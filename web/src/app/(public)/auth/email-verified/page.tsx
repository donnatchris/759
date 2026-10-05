import { SEO_SETTINGS } from '@/settings/settings.seo';
import type { Metadata } from 'next';
import { EmailVerificationResult } from '@/features/auth/components/email-verification-result';

export const metadata: Metadata = {
  title: SEO_SETTINGS.privatePageTitles.emailVerified,
};

type Props = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EmailVerifiedPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <main className="bg-gradient-to-bl from-primary/20 via-primary/5 via-background to-background">
      <EmailVerificationResult error={error} />
    </main>
  );
}
