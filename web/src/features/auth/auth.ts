import { APIError, betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import {
  sendAuthResetPasswordEmail,
  sendAuthVerificationEmail,
} from '@/features/mail/lib/auth-email.service';

const VERIFICATION_EMAIL_EXPIRATION_SECONDS = 60 * 60 * 2; // 2 hours
const RESET_PASSWORD_EXPIRATION_SECONDS = 60 * 60; // 1 hour

type SendVerificationEmailParams = {
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
  url: string;
  token: string;
};

type SendResetPasswordEmailParams = {
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
  url: string;
  token: string;
};

const prisma = new PrismaClient();

const EMAIL_BANNED_ERROR = {
  code: 'EMAIL_BANNED',
  message: 'Cet email est banni et ne peut plus accéder au service.',
};

const baseURL = process.env.BETTER_AUTH_URL;
if (!baseURL)
  throw new Error('BETTER_AUTH_URL is not defined in environment variables');
const googleClientId = process.env.GOOGLE_CLIENT_ID;
if (!googleClientId)
  throw new Error('GOOGLE_CLIENT_ID is not defined in environment variables');
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!googleClientSecret)
  throw new Error(
    'GOOGLE_CLIENT_SECRET is not defined in environment variables',
  );

export const auth = betterAuth({
  baseURL,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: RESET_PASSWORD_EXPIRATION_SECONDS,
    sendResetPassword: async ({ user, url }: SendResetPasswordEmailParams) => {
      await sendAuthResetPasswordEmail({ user, url });
    },
  },

  emailVerification: {
    // The one-shot local bootstrap creates a verified administrator without
    // contacting the email provider. Normal registrations still send emails.
    sendOnSignUp: process.env.SEEDING_ADMIN !== 'true',
    autoSignInAfterVerification: true,
    expiresIn: VERIFICATION_EMAIL_EXPIRATION_SECONDS,
    sendVerificationEmail: async ({
      user,
      url,
    }: SendVerificationEmailParams) => {
      await sendAuthVerificationEmail({ user, url });
    },
  },
  socialProviders: {
    google: {
      clientId: googleClientId!,
      clientSecret: googleClientSecret!,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: ['USER', 'MEMBER', 'STAFF', 'ADMIN'],
        required: false,
        defaultValue: 'USER',
        input: false,
      },
      phone: {
        type: 'string',
        required: false,
        input: true,
      },
      canBook: {
        type: 'boolean',
        required: false,
        defaultValue: true,
        input: false,
      },
      canReceiveMarketingEmails: {
        type: 'boolean',
        required: false,
        defaultValue: false,
        input: true,
      },
      legalTermsAccepted: {
        type: 'boolean',
        required: false,
        input: true,
      },
      legalTermsAcceptedAt: {
        type: 'date',
        required: false,
        input: false,
      },
      acceptedLegalTermsId: {
        type: 'string',
        required: false,
        input: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        async before(user, ctx) {
          if (await isBannedEmail(user.email)) {
            throw APIError.from('FORBIDDEN', EMAIL_BANNED_ERROR);
          }

          const path = getAuthHookPath(ctx);
          const legalTermsAccepted = user.legalTermsAccepted === true;

          if (path === '/sign-up/email' && !legalTermsAccepted) {
            throw APIError.from('BAD_REQUEST', {
              code: 'LEGAL_TERMS_REQUIRED',
              message:
                "Vous devez accepter les conditions générales d'utilisation.",
            });
          }

          if (!legalTermsAccepted) return;

          const legalTerms = await prisma.legalTerms.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { id: true },
          });

          if (!legalTerms) {
            throw APIError.from('BAD_REQUEST', {
              code: 'LEGAL_TERMS_NOT_FOUND',
              message:
                "La version des conditions générales d'utilisation est introuvable.",
            });
          }

          return {
            data: {
              ...user,
              legalTermsAccepted: true,
              legalTermsAcceptedAt: new Date(),
              acceptedLegalTermsId: legalTerms.id,
            },
          };
        },
        async after(user) {
          try {
            const {
              createAdminNewUserNotificationService,
              createNewUserWelcomeNotificationService,
            } =
              await import('@/features/notifications/lib/notifications.service');
            const notificationData = {
              userId: user.id,
              name: user.name,
              email: user.email,
            };

            await Promise.all([
              createAdminNewUserNotificationService(notificationData),
              createNewUserWelcomeNotificationService(notificationData),
            ]);
          } catch (error) {
            console.error(
              'Error while creating new user notifications:',
              error,
            );
          }
        },
      },
    },
    session: {
      create: {
        async before(session, ctx) {
          if (!ctx) return;
          const user = await ctx.context.internalAdapter.findUserById(
            session.userId,
          );
          if (user?.email && (await isBannedEmail(user.email))) {
            throw APIError.from('FORBIDDEN', EMAIL_BANNED_ERROR);
          }
        },
      },
    },
  },
  hooks: {
    async before(ctx) {
      const path = getAuthHookPath(ctx);

      if (path !== '/sign-in/email' && path !== '/sign-up/email') {
        return;
      }

      const email = getEmailFromBody(ctx.body);
      if (email && (await isBannedEmail(email))) {
        throw APIError.from('FORBIDDEN', EMAIL_BANNED_ERROR);
      }
    },
  },
});

function getAuthHookPath(ctx: unknown): string | null {
  if (
    typeof ctx !== 'object' ||
    ctx === null ||
    !('path' in ctx) ||
    typeof ctx.path !== 'string'
  ) {
    return null;
  }

  return ctx.path;
}

async function isBannedEmail(email: string): Promise<boolean> {
  const bannedEmail = await prisma.bannedEmail.findUnique({
    where: {
      email: normalizeEmail(email),
    },
    select: {
      id: true,
    },
  });

  return Boolean(bannedEmail);
}

function getEmailFromBody(body: unknown): string | null {
  if (
    typeof body !== 'object' ||
    body === null ||
    !('email' in body) ||
    typeof body.email !== 'string'
  ) {
    return null;
  }

  return body.email;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
