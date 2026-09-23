'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, QrCode } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type Props = {
  siteUrl: string;
};

export function SiteHomeQrCode({ siteUrl }: Props) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState(false);
  const hasError = !siteUrl || generationError;

  useEffect(() => {
    let isCurrent = true;

    if (!siteUrl) return;

    QRCode.toDataURL(siteUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 1024,
      color: {
        dark: '#111111',
        light: '#ffffff',
      },
    })
      .then((dataUrl) => {
        if (isCurrent) setQrCodeDataUrl(dataUrl);
      })
      .catch(() => {
        if (isCurrent) {
          setQrCodeDataUrl(null);
          setGenerationError(true);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [siteUrl]);

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <QrCode className="size-5" aria-hidden="true" />
          QR code de la page d&apos;accueil
        </CardTitle>
        <CardDescription>
          Vous pouvez utiliser ce QR code dans vos communications publicitaires,
          sur vos flyers, cartes de visite, affiches ou publications. Les
          personnes qui le scannent seront redirigées vers la page
          d&apos;accueil du site.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
        <div className="flex size-64 shrink-0 items-center justify-center rounded-lg border border-border bg-white p-4 shadow-sm">
          {qrCodeDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrCodeDataUrl}
              alt={`QR code vers ${siteUrl}`}
              className="size-full"
            />
          )}

          {!qrCodeDataUrl && !hasError && (
            <span className="text-sm text-muted-foreground">
              Génération du QR code...
            </span>
          )}

          {hasError && (
            <span className="text-center text-sm text-destructive">
              Impossible de générer le QR code.
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Adresse cible
            </p>
            <p className="mt-1 break-all rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
              {siteUrl || 'NEXT_PUBLIC_SITE_URL non configurée'}
            </p>
          </div>

          {qrCodeDataUrl ? (
            <Button asChild className="w-full sm:w-fit">
              <a href={qrCodeDataUrl} download="qr-code-site.png">
                <Download aria-hidden="true" />
                Télécharger le PNG
              </a>
            </Button>
          ) : (
            <Button disabled className="w-full sm:w-fit">
              <Download aria-hidden="true" />
              Télécharger le PNG
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
