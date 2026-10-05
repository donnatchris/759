import { SEO_SETTINGS } from '@/settings/settings.seo';
import type { Metadata } from 'next';

import { BackLink } from '@/components/custom-ui/back-link';
import { SiteHomeQrCode } from '@/features/qrcode';

export const metadata: Metadata = {
  title: SEO_SETTINGS.privatePageTitles.qrCode,
};

export default function StaffQrCodePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';

  return (
    <main className="container mx-auto px-4 py-8">
      <BackLink href="/staff" className="mb-2 text-xs sm:text-sm">
        Retour à l’Espace Staff
      </BackLink>

      <div className="mb-8">
        <h1 className="mb-4 p-4 text-center font-brand text-4xl font-bold tracking-wide text-primary sm:text-6xl">
          QR code
        </h1>
        <p className="mx-auto max-w-2xl text-center text-sm leading-6 text-muted-foreground">
          Téléchargez un QR code pointant vers la page d&apos;accueil du site
          pour vos supports de communication.
        </p>
      </div>

      <SiteHomeQrCode siteUrl={siteUrl} />
    </main>
  );
}
