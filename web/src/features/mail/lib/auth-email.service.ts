import { resend } from '@/lib/resend/resend';
import {
  getResetPasswordEmailHtml,
  getVerificationEmailHtml,
} from './auth-email.templates';

type AuthEmailUser = {
  email: string;
  name?: string | null;
};

type SendAuthEmailParams = {
  user: AuthEmailUser;
  url: string;
};

export async function sendAuthVerificationEmail({
  user,
  url,
}: SendAuthEmailParams) {
  const result = await resend.emails.send({
    from: getAuthEmailFromAddress(),
    to: user.email,
    subject: 'Confirmez votre adresse email',
    html: getVerificationEmailHtml({ url, userName: user.name }),
  });

  if (result.error) {
    console.error('Resend verification email error:', result.error);
    throw new Error('EMAIL_VERIFICATION_SEND_FAILED');
  }
}

export async function sendAuthResetPasswordEmail({
  user,
  url,
}: SendAuthEmailParams) {
  const result = await resend.emails.send({
    from: getAuthEmailFromAddress(),
    to: user.email,
    subject: 'Réinitialisation de votre mot de passe',
    html: getResetPasswordEmailHtml({ url, userName: user.name }),
  });

  if (result.error) {
    console.error('Resend reset password email error:', result.error);
    throw new Error('RESET_PASSWORD_EMAIL_SEND_FAILED');
  }
}

function getAuthEmailFromAddress() {
  const from = process.env.RESEND_FROM_EMAIL;

  if (!from) {
    throw new Error('RESEND_FROM_EMAIL is missing');
  }

  return from;
}
