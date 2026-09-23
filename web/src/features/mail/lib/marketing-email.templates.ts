import {
  APP_NAME,
  colors,
  escapeHtml,
  escapeTextHtml,
  getAppHomeUrl,
} from './email-layout';

type MarketingEmailTemplateParams = {
  eyebrow?: string | null;
  title: string;
  intro?: string | null;
  content: string;
  note?: string | null;
};

export function getMarketingEmailHtml({
  eyebrow,
  title,
  intro,
  content,
  note,
}: MarketingEmailTemplateParams) {
  const homeUrl = escapeHtml(getAppHomeUrl());

  return `
    <div style="margin: 0; padding: 0; background: ${colors.background};">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; background: ${colors.background};">
        <tr>
          <td align="center" style="padding: 32px 16px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 600px;">
              <tr>
                <td style="padding: 0 0 14px 0; text-align: center;">
                  ${
                    eyebrow
                      ? `<div style="font-family: Arial, sans-serif; font-size: 13px; line-height: 18px; color: ${colors.mutedForeground}; letter-spacing: 0.08em; text-transform: uppercase;">${escapeTextHtml(eyebrow)}</div>`
                      : ''
                  }
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
                          ${escapeTextHtml(title)}
                        </h1>

                        ${
                          intro
                            ? `<p style="margin: 0 0 18px 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 25px; color: ${colors.mutedForeground};">${escapeTextHtml(intro)}</p>`
                            : ''
                        }

                        <div style="margin: 0 0 26px 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 25px; color: ${colors.foreground};">
                          ${escapeTextHtml(content)}
                        </div>

                        ${
                          note
                            ? `<div style="margin: 28px 0 0 0; padding: 16px 18px; border-radius: 12px; background: ${colors.muted}; border: 1px solid ${colors.border}; font-family: Arial, sans-serif; font-size: 14px; line-height: 22px; color: ${colors.mutedForeground};">${escapeTextHtml(note)}</div>`
                            : ''
                        }
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding: 18px 8px 0 8px; text-align: center; font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color: ${colors.mutedForeground};">
                  ${APP_NAME} · Actualités et informations
                  <div style="margin-top: 12px;">
                    Si vous souhaitez ne plus recevoir d'emails commerciaux de notre part, vous pouvez modifier vos préférences en vous connectant à votre compte.
                  </div>
                  <div style="margin-top: 8px;">
                    <a href="${homeUrl}" style="color: ${colors.primary}; text-decoration: underline;">${homeUrl}</a>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}
