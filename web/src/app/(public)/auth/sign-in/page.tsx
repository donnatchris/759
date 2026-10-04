'use client';

import { SignInForm } from '@/features/auth/components/sign-in.form';
import { GoogleLoginButton } from '@/features/auth/components/google-login-button';
import Link from 'next/link';
import { useUser } from '@/features/auth/auth.context';
import { AlreadyAuthenticatedMessage } from '@/features/auth/components/already-authenticated-message';
import { isSignUpEnabled } from '@/settings/settings.helpers';

export default function SignInPage() {
  const { user } = useUser();

  if (user) {
    return (
      <main className="max-w-md h-screen flex items-center justify-center flex-col mx-auto p-6">
        <AlreadyAuthenticatedMessage
          user={user}
          actionLabel="vous connecter avec un autre compte"
        />
      </main>
    );
  }

  return (
    <main className="max-w-md h-screen flex items-center justify-center flex-col mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">{'Connexion'}</h1>
      <SignInForm />
      <p className="text-sm text-muted-foreground">-- ou --</p>
      <div className="flex items-center justify-center">
        <GoogleLoginButton />
      </div>
      {isSignUpEnabled() ? (
        <p className="text-muted-foreground">
          {'Pas encore de compte ?'}{' '}
          <Link href="/auth/sign-up" className="text-primary underline">
            {"S'inscrire"}
          </Link>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {
            "Si vous n'avez pas de compte, vous devez demander à un administrateur de vous inviter à rejoindre la plateforme."
          }
        </p>
      )}
    </main>
  );
}
