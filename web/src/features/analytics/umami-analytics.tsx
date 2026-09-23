import Script from 'next/script';

export function UmamiAnalytics() {
  const scriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
  if (!scriptUrl)
    console.warn('Umami script URL is not defined in environment variables.');
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!websiteId)
    console.warn('Umami website ID is not defined in environment variables.');

  if (!scriptUrl || !websiteId) return null;

  return (
    <Script
      defer
      src={scriptUrl}
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  );
}
