export const APP_NAME = process.env.SITE_FULL_NAME || 'Mon site';

export const colors = {
  background: '#fffaf5',
  card: '#fcf7f2',
  foreground: '#2a1608',
  primary: '#e67e22',
  primaryForeground: '#fff8f0',
  secondary: '#5a2e0c',
  accent: '#efac41',
  muted: '#f3e2d2',
  mutedForeground: '#6b3a1a',
  border: '#ead2bd',
};

export function getButtonHtml(url: string, label: string) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0;">
      <tr>
        <td style="border-radius: 999px; background: ${colors.primary}; box-shadow: 0 8px 18px rgba(230, 126, 34, 0.24);">
          <a
            href="${url}"
            style="
              display: inline-block;
              padding: 14px 22px;
              font-family: Arial, sans-serif;
              font-size: 15px;
              line-height: 18px;
              font-weight: 700;
              background: ${colors.primary};
              color: ${colors.primaryForeground};
              text-decoration: none;
              border-radius: 999px;
              border: 1px solid ${colors.accent};
            "
          >
            ${label}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function getAppHomeUrl() {
  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.BETTER_AUTH_URL ??
    'http://localhost:3000';
  const siteUrl = /^[a-z][a-z\d+.-]*:\/\//i.test(rawUrl)
    ? rawUrl
    : `https://${rawUrl}`;

  return new URL('/', siteUrl).toString();
}

export function escapeTextHtml(value: string) {
  return escapeHtml(value).replace(/\r\n|\n|\r/g, '<br />');
}

export function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
