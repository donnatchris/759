import Link from 'next/link';
import { SignUpForm } from '@/features/auth/components/sign-up.form';
import { GoogleLoginButton } from '@/features/auth/components/google-login-button';
import { AlreadyAuthenticatedMessage } from '@/features/auth/components/already-authenticated-message';
import { auth } from '@/features/auth/auth';
import { headers } from 'next/headers';

export default async function SignUpPage() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);

  if (session?.user) {
    return (
      <main className="max-w-md h-screen flex items-center justify-center flex-col mx-auto p-6">
        <AlreadyAuthenticatedMessage
          user={session.user}
          actionLabel="créer un nouveau compte"
        />
      </main>
    );
  }

  return (
    <main className="max-w-md h-screen flex items-center justify-center flex-col mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">{'Créer un compte'}</h1>
      <SignUpForm />
      <p className="text-sm text-muted-foreground">-- ou --</p>
      <div className="flex items-center justify-center">
        <GoogleLoginButton />
      </div>
      <p className="text-sm text-muted-foreground">
        {'Vous avez déjà un compte ?'}{' '}
        <Link href="/auth/sign-in" className="text-primary underline">
          {'Se connecter'}
        </Link>
      </p>
    </main>
  );
}
