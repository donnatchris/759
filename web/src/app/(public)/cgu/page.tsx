import type { Metadata } from 'next';
import {
  EditLegalTermsAdminButton,
  LegalTermsMarkdown,
} from '@/features/legal-terms';
import { getCachedLatestLegalTermsService } from '@/features/legal-terms/lib/legal-terms.service';
import { PageTitle } from '@/features/pages/components/page-title';
import { getCachedPageTitleService } from '@/features/pages/lib/page-title.service';

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description:
    "Conditions générales d'utilisation, informations légales, données personnelles et cookies.",
  alternates: {
    canonical: '/cgu',
  },
};

export default async function CguPage() {
  const [page, legalTerms] = await Promise.all([
    getCachedPageTitleService({ slug: 'cgu' }),
    getCachedLatestLegalTermsService(),
  ]);

  return (
    <section className="bg-gradient-to-bl from-primary/20 via-primary/05 via-background to-background">
      <div className="container mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <div className="relative">
          <PageTitle pageTitle={page} />
        </div>

        <header className="mb-10 text-center">
          <div className="mb-4 flex justify-end">
            <EditLegalTermsAdminButton legalTerms={legalTerms} />
          </div>
          {legalTerms && (
            <p className="mt-3 text-xs text-secondary bg-accent sm:text-sm">
              Publié le {formatLegalTermsDate(legalTerms.createdAt)}
              <span className="mx-2">•</span>
              Dernière édition le {formatLegalTermsDate(legalTerms.updatedAt)}
            </p>
          )}
        </header>

        {legalTerms ? (
          <LegalTermsMarkdown content={legalTerms.content} />
        ) : (
          <p className="text-center text-muted-foreground">
            Les conditions générales d&apos;utilisation ne sont pas encore
            disponibles.
          </p>
        )}
      </div>
    </section>
  );
}

function formatLegalTermsDate(date: Date | string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'date inconnue';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(parsedDate);
}
