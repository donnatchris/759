import { APP_NAME } from './email-layout';
import { getSiteFullName } from '@/settings/settings.helpers';
import { getGenericEmailHtml } from './generic-email.templates';
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

export async function sendAuthInvitationEmail(email: string, url: string) {
  const siteName = getSiteFullName() || APP_NAME;
  const result = await resend.emails.send({
    from: getAuthEmailFromAddress(),
    to: email,
    subject: `Votre invitation à rejoindre ${siteName}`,
    html: getGenericEmailHtml({
      eyebrow: 'Invitation',
      title: `Rejoignez ${siteName}`,
      intro: [
        `Vous êtes invité à créer votre compte sur le site ${siteName}.`,
        'Gardons le contact ! Si vous choisissez de recevoir nos emails lors de votre inscription, vous pourrez suivre nos actualités et découvrir nos événements pour ne rien manquer de nos prochains rendez-vous.',
        'Cliquez sur le bouton ci-dessous pour compléter votre inscription.',
        'À bientôt parmi nous !',
      ].join('\n\n'),
      actionLabel: 'Créer mon compte',
      actionUrl: url,
      note: 'Ce lien personnel est valable 48 heures et ne peut être utilisé qu’une fois. Si vous ne souhaitez pas vous inscrire, ignorez cet email.',
    }),
  });
  if (result.error) throw new Error('INVITATION_EMAIL_SEND_FAILED');
}
