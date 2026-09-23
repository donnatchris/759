import { auth } from '@/features/auth/auth';
import { AuthRedirectCompletionForm } from '@/features/auth/components/auth-redirect-completion.form';
import { getLatestLegalTermsService } from '@/features/legal-terms/lib/legal-terms.service';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AuthRedirectPage() {
  const [session, latestLegalTerms] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getLatestLegalTermsService(),
  ]);
  if (!session) {
    redirect('/auth/sign-in');
  }

  const redirectTo =
    session.user.role === 'ADMIN' || session.user.role === 'STAFF'
      ? '/staff'
      : '/dashboard';
  const showPhoneField = !session.user.phone;
  const showMarketingEmailConsent =
    session.user.canReceiveMarketingEmails !== true;
  const showLegalTermsAcceptance =
    latestLegalTerms !== null &&
    (session.user.legalTermsAccepted !== true ||
      session.user.acceptedLegalTermsId !== latestLegalTerms.id);
  const requireLegalTermsAcceptance =
    showLegalTermsAcceptance && session.user.legalTermsAccepted !== true;
  const shouldShowCompletionForm =
    showPhoneField || showMarketingEmailConsent || showLegalTermsAcceptance;

  if (!shouldShowCompletionForm) {
    redirect(redirectTo);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-5 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">
          {showLegalTermsAcceptance
            ? "Conditions générales d'utilisation"
            : 'Compléter votre profil'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {showLegalTermsAcceptance
            ? requireLegalTermsAcceptance
              ? "Veuillez consulter et accepter la version actuellement en vigueur des conditions générales d'utilisation avant de continuer."
              : "Une nouvelle version des conditions générales d'utilisation est disponible. Vous pouvez l'accepter maintenant ou poursuivre et le faire plus tard."
            : 'Ces informations peuvent être ajoutées maintenant ou plus tard depuis votre profil.'}
        </p>
      </div>

      <AuthRedirectCompletionForm
        user={{
          name: session.user.name,
          phone: session.user.phone ?? null,
          canReceiveMarketingEmails: session.user.canReceiveMarketingEmails,
          legalTermsAccepted: showLegalTermsAcceptance
            ? false
            : session.user.legalTermsAccepted,
        }}
        redirectTo={redirectTo}
        showPhoneField={showPhoneField}
        showMarketingEmailConsent={showMarketingEmailConsent}
        showLegalTermsAcceptance={showLegalTermsAcceptance}
        requireLegalTermsAcceptance={requireLegalTermsAcceptance}
      />
    </main>
  );
}
