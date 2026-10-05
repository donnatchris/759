import {
  APP_NAME,
  escapeHtml,
  escapeTextHtml,
  getAppHomeUrl,
} from './email-layout';

type GenericEmailTemplateParams = {
  title: string;
  intro?: string | null;
  content?: string;
  eyebrow?: string | null;
  note?: string | null;
  imageUrl?: string | null;
  links?: string[];
  showAction?: boolean;
  footerText?: string;
  footerUrl?: string;
  actionUrl?: string;
  actionLabel?: string;
};

export function getGenericEmailHtml({
  title,
  intro,
  content,
  actionUrl,
  actionLabel,
  eyebrow = "Message de l'association",
  note,
  imageUrl,
  links,
  showAction = true,
  footerText = 'Message automatique — merci de ne pas répondre à cet email.',
  footerUrl,
}: GenericEmailTemplateParams) {
  const buttonUrl = showAction ? escapeHtml(actionUrl ?? getAppHomeUrl()) : '';
  const safeFooterUrl = footerUrl ? escapeHtml(footerUrl) : '';
  const buttonLabel = actionLabel ?? "Rejoindre la page d'accueil";

  return `
  <style>
    @media only screen and (max-width: 620px) {
      .generic-email-padding { padding-right: 24px !important; padding-left: 24px !important; }
      .generic-email-title { font-size: 40px !important; line-height: 42px !important; }
      .generic-email-cta { display: block !important; text-align: center !important; }
    }
  </style>
  <div style="margin: 0; padding: 0; background: #f3f2ed;">
    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="width: 100%; background: #f3f2ed;"
    >
      <tr>
        <td align="center" style="padding: 28px 12px;">
          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="width: 100%; max-width: 600px;"
          >

            <!-- Card -->
            <tr>
              <td
                style="
                  border: 1px solid #ced2d6;
                  border-radius: 0;
                  background: #faf8f2;
                  overflow: hidden;
                "
              >

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td class="generic-email-padding" style="padding: 22px 42px; background-color: #18345b; border-bottom: 5px solid #dfb74e; font-family: Baskerville, Georgia, 'Times New Roman', serif; font-size: 32px; line-height: 34px; font-weight: 700; letter-spacing: -1px; color: #faf8f2;">
                      ${APP_NAME}
                    </td>
                  </tr>
                </table>

                <!-- Content -->
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                >
                  <tr>
                    <td class="generic-email-padding" style="padding: 48px 42px 34px 42px;">
                      ${
                        eyebrow
                          ? `<p style="margin: 0 0 13px; font-family: Arial, Helvetica, sans-serif; font-size: 11px; line-height: 16px; font-weight: 700; letter-spacing: 2.2px; text-transform: uppercase; color: #ad343b;">
                        ${escapeTextHtml(eyebrow)}
                      </p>`
                          : ''
                      }

                      ${imageUrl && /^https?:\/\//i.test(imageUrl) ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" width="516" style="display:block;width:100%;height:auto;margin:0 0 24px;" />` : ''}
                      <h1 class="generic-email-title"
                        style="
                          margin: 0 0 20px 0;
                          font-family: Baskerville, Georgia, 'Times New Roman', serif;
                          font-size: 50px;
                          line-height: 51px;
                          font-weight: 600;
                          letter-spacing: -1.8px;
                          color: #18345b;
                        "
                      >
                        ${escapeTextHtml(title)}
                      </h1>

                      ${
                        intro
                          ? `<p
                        style="
                          margin: 0 0 20px 0;
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 16px;
                          line-height: 26px;
                          color: #1b2c43;
                        "
                      >
                        ${escapeTextHtml(intro)}
                      </p>`
                          : ''
                      }

                      ${
                        content !== undefined
                          ? `<div
                        style="
                          margin: 0 0 28px 0;
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 16px;
                          line-height: 27px;
                          color: #1b2c43;
                        "
                      >
                        ${escapeTextHtml(content)}
                      </div>`
                          : ''
                      }

                      ${
                        showAction
                          ? `
                      <!-- Button -->
                      <table
                        role="presentation"
                        cellspacing="0"
                        cellpadding="0"
                        border="0"
                        width="100%" style="width: 100%; margin: 0 0 26px 0;"
                      >
                        <tr>
                          <td
                            align="center" bgcolor="#ad343b"
                            style="
                              background: #ad343b;
                            "
                          >
                            <a
                              href="${buttonUrl}"
                              class="generic-email-cta"
                              style="
                                display: inline-block;
                                padding: 17px 28px;
                                font-family: Arial, Helvetica, sans-serif;
                                font-size: 14px;
                                line-height: 20px;
                                font-weight: 700;
                                color: #faf8f2;
                                text-decoration: none;
                                letter-spacing: 0.3px;
                              "
                            >
                              ${escapeTextHtml(buttonLabel)}
                            </a>
                          </td>
                        </tr>
                      </table>

                      `
                          : ''
                      }

                      ${(links ?? [])
                        .filter((url) => /^https?:\/\//i.test(url))
                        .map(
                          (url) =>
                            `<p style="word-break:break-word;"><a href="${escapeHtml(url)}" style="color:#18345b;">${escapeHtml(url)}</a></p>`,
                        )
                        .join('')}
                      ${note ? `<div style="margin: 0 0 24px; padding: 17px 19px; background: #f3f2ed; border: 1px solid #ced2d6; border-left: 4px solid #ad343b; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 22px; color: #606a76;">${escapeTextHtml(note)}</div>` : ''}

                      ${
                        showAction
                          ? `
                      <!-- Red accent -->
                      <div
                        style="
                          height: 1px;
                          background: #ced2d6;
                          margin: 4px 0 22px 0;
                        "
                      ></div>

                      <p
                        style="
                          margin: 0 0 8px 0;
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 13px;
                          line-height: 20px;
                          color: #606a76;
                        "
                      >
                        Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :
                      </p>

                      <p
                        style="
                          margin: 0;
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 12px;
                          line-height: 19px;
                          word-break: break-all;
                        "
                      >
                        <a
                          href="${buttonUrl}"
                          style="
                            color: #18345b;
                            text-decoration: underline;
                          "
                        >
                          ${buttonUrl}
                        </a>
                      </p>
                      `
                          : ''
                      }

                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  padding: 28px 42px;
                  background-color: #18345b;
                  border-top: 5px solid #dfb74e;
                  text-align: center;
                  font-family: Arial, Helvetica, sans-serif;
                  font-size: 12px;
                  line-height: 19px;
                  color: #faf8f2;
                "
              >
                ${APP_NAME}
                <br />

                <span style="font-size: 11px;">
                  ${escapeTextHtml(footerText)}
                  ${safeFooterUrl ? `<div style="margin-top: 8px;"><a href="${safeFooterUrl}" style="color: #dfb74e; text-decoration: underline;">${safeFooterUrl}</a></div>` : ''}
                </span>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 24px auto 0;">
                  <tr>
                    <td align="center" bgcolor="#dfb74e" style="background: #dfb74e; border-radius: 6px;">
                      <a href="https://delice-et-tradition-du-roussillon.fr" style="display: inline-block; padding: 16px 40px; border: 1px solid #dfb74e; border-radius: 6px; font-family: Arial, Helvetica, sans-serif; font-size: 18px; line-height: 24px; font-weight: 700; color: #18345b; text-decoration: none;">
                        Le 7.59
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
`;
}
