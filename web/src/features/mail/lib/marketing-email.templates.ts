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
  <div style="margin: 0; padding: 0; background: #F4F5F7;">
    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="width: 100%; background: #F4F5F7;"
    >
      <tr>
        <td align="center" style="padding: 32px 16px;">
          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="width: 100%; max-width: 600px;"
          >

            <!-- Header -->
            <tr>
              <td style="padding: 0 0 18px 0; text-align: center;">

                ${
                  eyebrow
                    ? `
                      <div
                        style="
                          font-family: Arial, sans-serif;
                          font-size: 12px;
                          line-height: 18px;
                          color: #6B7280;
                          letter-spacing: 0.14em;
                          text-transform: uppercase;
                        "
                      >
                        ${escapeTextHtml(eyebrow)}
                      </div>
                    `
                    : ''
                }

                <div
                  style="
                    font-family: Georgia, 'Times New Roman', serif;
                    font-size: 32px;
                    line-height: 40px;
                    font-weight: 700;
                    color: #14213D;
                    margin-top: 6px;
                  "
                >
                  ${APP_NAME}
                </div>

              </td>
            </tr>

            <!-- Card -->
            <tr>
              <td
                style="
                  border: 1px solid #D9DDE5;
                  border-radius: 16px;
                  background: #FFFFFF;
                  overflow: hidden;
                "
              >

                <!-- Tricolore -->
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="width: 100%;"
                >
                  <tr>
                    <td
                      width="33.33%"
                      style="
                        height: 7px;
                        background: #0055A4;
                        font-size: 0;
                        line-height: 0;
                      "
                    >
                      &nbsp;
                    </td>

                    <td
                      width="33.33%"
                      style="
                        height: 7px;
                        background: #FFFFFF;
                        font-size: 0;
                        line-height: 0;
                        border-bottom: 1px solid #E5E7EB;
                      "
                    >
                      &nbsp;
                    </td>

                    <td
                      width="33.33%"
                      style="
                        height: 7px;
                        background: #EF4135;
                        font-size: 0;
                        line-height: 0;
                      "
                    >
                      &nbsp;
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
                    <td style="padding: 38px 36px 34px 36px;">

                      <h1
                        style="
                          margin: 0 0 20px 0;
                          font-family: Georgia, 'Times New Roman', serif;
                          font-size: 27px;
                          line-height: 35px;
                          font-weight: 700;
                          color: #14213D;
                        "
                      >
                        ${escapeTextHtml(title)}
                      </h1>

                      ${
                        intro
                          ? `
                            <p
                              style="
                                margin: 0 0 20px 0;
                                font-family: Arial, sans-serif;
                                font-size: 16px;
                                line-height: 26px;
                                color: #596273;
                              "
                            >
                              ${escapeTextHtml(intro)}
                            </p>
                          `
                          : ''
                      }

                      <div
                        style="
                          margin: 0;
                          font-family: Arial, sans-serif;
                          font-size: 16px;
                          line-height: 27px;
                          color: #202938;
                        "
                      >
                        ${escapeTextHtml(content)}
                      </div>

                      ${
                        note
                          ? `
                            <div
                              style="
                                margin: 30px 0 0 0;
                                padding: 17px 19px;
                                border-radius: 10px;
                                background: #F7F8FA;
                                border-left: 4px solid #EF4135;
                                border-top: 1px solid #E5E7EB;
                                border-right: 1px solid #E5E7EB;
                                border-bottom: 1px solid #E5E7EB;
                                font-family: Arial, sans-serif;
                                font-size: 14px;
                                line-height: 22px;
                                color: #596273;
                              "
                            >
                              ${escapeTextHtml(note)}
                            </div>
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
                  padding: 20px 8px 0 8px;
                  text-align: center;
                  font-family: Arial, sans-serif;
                  font-size: 12px;
                  line-height: 19px;
                  color: #7A8391;
                "
              >

                <div style="margin-bottom: 8px;">
                  <span style="color: #0055A4;">●</span>
                  <span style="color: #D1D5DB;">●</span>
                  <span style="color: #EF4135;">●</span>
                </div>

                <div>
                  ${APP_NAME} · Actualités et informations
                </div>

                <div
                  style="
                    margin-top: 12px;
                    font-size: 11px;
                    line-height: 18px;
                  "
                >
                  Si vous souhaitez ne plus recevoir d'emails commerciaux de notre part,
                  vous pouvez modifier vos préférences en vous connectant à votre compte.
                </div>

                <div style="margin-top: 8px;">
                  <a
                    href="${homeUrl}"
                    style="
                      color: #0055A4;
                      text-decoration: underline;
                    "
                  >
                    ${homeUrl}
                  </a>
                </div>

              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
`;

//   return `
//     <div style="margin: 0; padding: 0; background: ${colors.background};">
//       <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; background: ${colors.background};">
//         <tr>
//           <td align="center" style="padding: 32px 16px;">
//             <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 600px;">
//               <tr>
//                 <td style="padding: 0 0 14px 0; text-align: center;">
//                   ${
//                     eyebrow
//                       ? `<div style="font-family: Arial, sans-serif; font-size: 13px; line-height: 18px; color: ${colors.mutedForeground}; letter-spacing: 0.08em; text-transform: uppercase;">${escapeTextHtml(eyebrow)}</div>`
//                       : ''
//                   }
//                   <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 30px; line-height: 38px; font-weight: 700; color: ${colors.secondary}; margin-top: 8px;">
//                     ${APP_NAME}
//                   </div>
//                 </td>
//               </tr>

//               <tr>
//                 <td style="border: 1px solid ${colors.border}; border-radius: 18px; background: ${colors.card}; overflow: hidden;">
//                   <div style="height: 8px; background: ${colors.primary}; border-bottom: 1px solid ${colors.border};"></div>

//                   <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
//                     <tr>
//                       <td style="padding: 34px 34px 30px 34px;">
//                         <h1 style="margin: 0 0 18px 0; font-family: Arial, sans-serif; font-size: 25px; line-height: 32px; color: ${colors.foreground};">
//                           ${escapeTextHtml(title)}
//                         </h1>

//                         ${
//                           intro
//                             ? `<p style="margin: 0 0 18px 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 25px; color: ${colors.mutedForeground};">${escapeTextHtml(intro)}</p>`
//                             : ''
//                         }

//                         <div style="margin: 0 0 26px 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 25px; color: ${colors.foreground};">
//                           ${escapeTextHtml(content)}
//                         </div>

//                         ${
//                           note
//                             ? `<div style="margin: 28px 0 0 0; padding: 16px 18px; border-radius: 12px; background: ${colors.muted}; border: 1px solid ${colors.border}; font-family: Arial, sans-serif; font-size: 14px; line-height: 22px; color: ${colors.mutedForeground};">${escapeTextHtml(note)}</div>`
//                             : ''
//                         }
//                       </td>
//                     </tr>
//                   </table>
//                 </td>
//               </tr>

//               <tr>
//                 <td style="padding: 18px 8px 0 8px; text-align: center; font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color: ${colors.mutedForeground};">
//                   ${APP_NAME} · Actualités et informations
//                   <div style="margin-top: 12px;">
//                     Si vous souhaitez ne plus recevoir d'emails commerciaux de notre part, vous pouvez modifier vos préférences en vous connectant à votre compte.
//                   </div>
//                   <div style="margin-top: 8px;">
//                     <a href="${homeUrl}" style="color: ${colors.primary}; text-decoration: underline;">${homeUrl}</a>
//                   </div>
//                 </td>
//               </tr>
//             </table>
//           </td>
//         </tr>
//       </table>
//     </div>
//   `;
}
