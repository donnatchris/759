import {
  APP_NAME,
  colors,
  escapeHtml,
  escapeTextHtml,
  getAppHomeUrl,
  getButtonHtml,
} from './email-layout';

type GenericEmailTemplateParams = {
  title: string;
  intro: string;
  content: string;
  actionUrl?: string;
  actionLabel?: string;
};

export function getGenericEmailHtml({
  title,
  intro,
  content,
  actionUrl,
  actionLabel,
}: GenericEmailTemplateParams) {
  const buttonUrl = escapeHtml(actionUrl ?? getAppHomeUrl());
  const buttonLabel = actionLabel ?? "Rejoindre la page d'accueil";


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
                  Message de l'association
                </div>

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
                      style="height: 7px; background: #0055A4; font-size: 0; line-height: 0;"
                    >
                      &nbsp;
                    </td>

                    <td
                      width="33.33%"
                      style="height: 7px; background: #FFFFFF; font-size: 0; line-height: 0; border-bottom: 1px solid #E5E7EB;"
                    >
                      &nbsp;
                    </td>

                    <td
                      width="33.33%"
                      style="height: 7px; background: #EF4135; font-size: 0; line-height: 0;"
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

                      <div
                        style="
                          margin: 0 0 28px 0;
                          font-family: Arial, sans-serif;
                          font-size: 16px;
                          line-height: 27px;
                          color: #202938;
                        "
                      >
                        ${escapeTextHtml(content)}
                      </div>

                      <!-- Button -->
                      <table
                        role="presentation"
                        cellspacing="0"
                        cellpadding="0"
                        border="0"
                        style="margin: 0 0 26px 0;"
                      >
                        <tr>
                          <td
                            bgcolor="#0055A4"
                            style="
                              border-radius: 8px;
                              background: #0055A4;
                            "
                          >
                            <a
                              href="${buttonUrl}"
                              style="
                                display: inline-block;
                                padding: 13px 24px;
                                font-family: Arial, sans-serif;
                                font-size: 15px;
                                line-height: 20px;
                                font-weight: 700;
                                color: #FFFFFF;
                                text-decoration: none;
                                border-radius: 8px;
                              "
                            >
                              ${escapeTextHtml(buttonLabel)}
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Red accent -->
                      <div
                        style="
                          height: 1px;
                          background: #E5E7EB;
                          margin: 4px 0 22px 0;
                        "
                      ></div>

                      <p
                        style="
                          margin: 0 0 8px 0;
                          font-family: Arial, sans-serif;
                          font-size: 13px;
                          line-height: 20px;
                          color: #7A8391;
                        "
                      >
                        Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :
                      </p>

                      <p
                        style="
                          margin: 0;
                          font-family: Arial, sans-serif;
                          font-size: 12px;
                          line-height: 19px;
                          word-break: break-all;
                        "
                      >
                        <a
                          href="${buttonUrl}"
                          style="
                            color: #0055A4;
                            text-decoration: underline;
                          "
                        >
                          ${buttonUrl}
                        </a>
                      </p>

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

                ${APP_NAME}
                <br />

                <span style="font-size: 11px;">
                  Message automatique — merci de ne pas répondre à cet email.
                </span>
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
//                   <div style="font-family: Arial, sans-serif; font-size: 13px; line-height: 18px; color: ${colors.mutedForeground}; letter-spacing: 0.08em; text-transform: uppercase;">
//                     Message
//                   </div>
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

//                         <p style="margin: 0 0 18px 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 25px; color: ${colors.mutedForeground};">
//                           ${escapeTextHtml(intro)}
//                         </p>

//                         <div style="margin: 0 0 26px 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 25px; color: ${colors.foreground};">
//                           ${escapeTextHtml(content)}
//                         </div>

//                         ${getButtonHtml(buttonUrl, escapeTextHtml(buttonLabel))}

//                         <p style="margin: 24px 0 8px 0; font-family: Arial, sans-serif; font-size: 13px; line-height: 20px; color: ${colors.mutedForeground};">
//                           Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :
//                         </p>

//                         <p style="margin: 0; font-family: Arial, sans-serif; font-size: 12px; line-height: 19px; color: ${colors.primary}; word-break: break-all;">
//                           <a href="${buttonUrl}" style="color: ${colors.primary}; text-decoration: underline;">${buttonUrl}</a>
//                         </p>
//                       </td>
//                     </tr>
//                   </table>
//                 </td>
//               </tr>

//               <tr>
//                 <td style="padding: 18px 8px 0 8px; text-align: center; font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color: ${colors.mutedForeground};">
//                   ${APP_NAME} · Message automatique
//                 </td>
//               </tr>
//             </table>
//           </td>
//         </tr>
//       </table>
//     </div>
//   `;
}
