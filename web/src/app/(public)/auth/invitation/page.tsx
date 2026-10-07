import Link from 'next/link';
import { headers } from 'next/headers';
import { auth } from '@/features/auth/auth';
import { getValidInvitation } from '@/features/auth/invitation.repository';
import { SignUpForm } from '@/features/auth/components/sign-up.form';
import { AlreadyAuthenticatedMessage } from '@/features/auth/components/already-authenticated-message';

export default async function InvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);
  const invitation = await getValidInvitation(token);
  return (
    <main className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-md flex-col items-center justify-center gap-4 px-6 py-12">
      {session?.user ? (
        <AlreadyAuthenticatedMessage
          user={session.user}
          actionLabel="accepter une invitation"
        />
      ) : invitation && token ? (
        <>
          <h1 className="text-2xl font-bold">Vous êtes invité !</h1>
          <p className="text-center text-sm text-muted-foreground">
            Complétez votre inscription pour créer votre compte. Votre adresse
            email sera automatiquement vérifiée grâce à cette invitation.
          </p>
          <SignUpForm invitation={{ token, email: invitation.email }} />
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold">Invitation indisponible</h1>
          <p className="text-center text-sm text-muted-foreground">
            Ce lien est invalide, expiré ou déjà utilisé. Demandez un nouveau
            lien à l’équipe.
          </p>
          <Link href="/auth/sign-in" className="text-primary underline">
            Se connecter
          </Link>
        </>
      )}
    </main>
  );
}
