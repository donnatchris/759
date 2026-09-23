import { MailMarketingAdmin } from '@/features/mail/components/mail-marketing-admin';
import { getMarketingEmailsService } from '@/features/mail/lib/marketing-email.service';
import { BackLink } from '@/components/custom-ui/back-link';

export default async function AdminMailMarketingPage() {
  const marketingEmails = await getMarketingEmailsService({
    page: 1,
    pageSize: 100,
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <BackLink href="/staff" className="mb-2 text-xs sm:text-sm">
        Retour à l’Espace Staff
      </BackLink>

      <div className="mb-8">
        <h1 className="mb-8 p-4 text-center font-brand text-4xl font-bold tracking-wide text-primary sm:text-6xl">
          Mail marketing
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Préparez les campagnes et consultez les emails marketing déjà
          enregistrés.
        </p>
      </div>

      <MailMarketingAdmin initialMarketingEmails={marketingEmails.items} />
    </main>
  );
}
