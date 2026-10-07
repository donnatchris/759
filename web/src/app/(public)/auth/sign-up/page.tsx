import Link from 'next/link';
import { SignUpForm } from '@/features/auth/components/sign-up.form';
import { GoogleLoginButton } from '@/features/auth/components/google-login-button';
import { AlreadyAuthenticatedMessage } from '@/features/auth/components/already-authenticated-message';
import { auth } from '@/features/auth/auth';
import { headers } from 'next/headers';
import { isGoogleAuthEnabled } from '@/settings/settings.helpers';

export default async function SignUpPage() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);

  if (session?.user) {
    return (
      <main className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-md flex-col items-center justify-center px-6 py-12">
        <AlreadyAuthenticatedMessage
          user={session.user}
          actionLabel="créer un nouveau compte"
        />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-md flex-col items-center justify-center gap-4 px-6 py-12">
      <h1 className="text-2xl font-bold">{'Créer un compte'}</h1>
      <SignUpForm />
      {isGoogleAuthEnabled() && (
        <>
          <p className="text-sm text-muted-foreground">-- ou --</p>
          <div className="flex items-center justify-center">
            <GoogleLoginButton />
          </div>
        </>
      )}
      <p className="text-sm text-muted-foreground">
        {'Vous avez déjà un compte ?'}{' '}
        <Link href="/auth/sign-in" className="text-primary underline">
          {'Se connecter'}
        </Link>
      </p>
    </main>
  );
}
