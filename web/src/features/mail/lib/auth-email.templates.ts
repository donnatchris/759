import { APP_NAME } from './email-layout';
import { getGenericEmailHtml } from './generic-email.templates';

type AuthEmailTemplateParams = {
  url: string;
  userName?: string | null;
};

export function getVerificationEmailHtml({ url }: AuthEmailTemplateParams) {
  return getGenericEmailHtml({
    eyebrow: 'Confirmation de compte',
    title: `Bienvenue sur ${APP_NAME}`,
    intro:
      'Merci pour votre inscription. Il ne reste plus qu’à confirmer votre adresse email pour activer votre compte.',
    actionLabel: 'Confirmer mon email',
    actionUrl: url,
    note: 'Ce lien est valable pendant 2 heures.',
  });
}

export function getResetPasswordEmailHtml({
  url,
  userName,
}: AuthEmailTemplateParams) {
  const greeting = userName ? `Bonjour ${userName},` : 'Bonjour,';

  return getGenericEmailHtml({
    eyebrow: 'Sécurité du compte',
    title: 'Réinitialisation de votre mot de passe',
    intro: `${greeting}\n\nVous avez demandé à réinitialiser votre mot de passe pour ${APP_NAME}. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.`,
    actionLabel: 'Réinitialiser mon mot de passe',
    actionUrl: url,
    note: "Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.",
  });
}
