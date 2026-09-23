import { APP_NAME, colors, escapeHtml, getButtonHtml } from './email-layout';

type AuthEmailTemplateParams = {
  url: string;
  userName?: string | null;
};

export function getVerificationEmailHtml({ url }: AuthEmailTemplateParams) {
  const safeUrl = escapeHtml(url);

  return getAuthEmailLayout({
    eyebrow: 'Confirmation de compte',
    title: `Bienvenue sur ${APP_NAME}`,
    intro:
      'Merci pour votre inscription. Il ne reste plus qu’à confirmer votre adresse email pour activer votre compte.',
    ctaLabel: 'Confirmer mon email',
    url: safeUrl,
    note: 'Ce lien est valable pendant 2 heures.',
  });
}

export function getResetPasswordEmailHtml({
  url,
  userName,
}: AuthEmailTemplateParams) {
  const safeUrl = escapeHtml(url);
  const safeName = userName ? escapeHtml(userName) : '';
  const greeting = safeName ? `Bonjour ${safeName},` : 'Bonjour,';

  return getAuthEmailLayout({
    eyebrow: 'Sécurité du compte',
    title: 'Réinitialisation de votre mot de passe',
    intro: `${greeting}<br /><br />Vous avez demandé à réinitialiser votre mot de passe pour ${APP_NAME}. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.`,
    ctaLabel: 'Réinitialiser mon mot de passe',
    url: safeUrl,
    note: "Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.",
  });
}

type AuthEmailLayoutParams = {
  eyebrow: string;
  title: string;
  intro: string;
  ctaLabel: string;
  url: string;
  note: string;
};

function getAuthEmailLayout({
  eyebrow,
  title,
  intro,
  ctaLabel,
  url,
  note,
}: AuthEmailLayoutParams) {
  return `
    <div style="margin: 0; padding: 0; background: ${colors.background};">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; background: ${colors.background};">
        <tr>
          <td align="center" style="padding: 32px 16px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 600px;">
              <tr>
                <td style="padding: 0 0 14px 0; text-align: center;">
                  <div style="font-family: Arial, sans-serif; font-size: 13px; line-height: 18px; color: ${colors.mutedForeground}; letter-spacing: 0.08em; text-transform: uppercase;">
                    ${eyebrow}
                  </div>
                  <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 30px; line-height: 38px; font-weight: 700; color: ${colors.secondary}; margin-top: 8px;">
                    ${APP_NAME}
                  </div>
                </td>
              </tr>

              <tr>
                <td style="border: 1px solid ${colors.border}; border-radius: 18px; background: ${colors.card}; overflow: hidden;">
                  <div style="height: 8px; background: ${colors.primary}; border-bottom: 1px solid ${colors.border};"></div>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="padding: 34px 34px 30px 34px;">
                        <h1 style="margin: 0 0 18px 0; font-family: Arial, sans-serif; font-size: 25px; line-height: 32px; color: ${colors.foreground};">
                          ${title}
                        </h1>

                        <p style="margin: 0 0 24px 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 25px; color: ${colors.mutedForeground};">
                          ${intro}
                        </p>

                        ${getButtonHtml(url, ctaLabel)}

                        <div style="margin: 28px 0 0 0; padding: 16px 18px; border-radius: 12px; background: ${colors.muted}; border: 1px solid ${colors.border}; font-family: Arial, sans-serif; font-size: 14px; line-height: 22px; color: ${colors.mutedForeground};">
                          ${note}
                        </div>

                        <p style="margin: 24px 0 8px 0; font-family: Arial, sans-serif; font-size: 13px; line-height: 20px; color: ${colors.mutedForeground};">
                          Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :
                        </p>

                        <p style="margin: 0; font-family: Arial, sans-serif; font-size: 12px; line-height: 19px; color: ${colors.primary}; word-break: break-all;">
                          <a href="${url}" style="color: ${colors.primary}; text-decoration: underline;">${url}</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding: 18px 8px 0 8px; text-align: center; font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color: ${colors.mutedForeground};">
                  ${APP_NAME} · Message automatique
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}
