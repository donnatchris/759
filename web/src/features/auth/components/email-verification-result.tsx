'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EMAIL_VERIFICATION_REDIRECT_DELAY_MS } from '../auth.const';

type Props = {
  error?: string;
};

const errorMessages: Record<string, string> = {
  INVALID_TOKEN:
    'Le lien de vérification est invalide. Vous pouvez demander un nouveau lien depuis la page de connexion.',
  TOKEN_EXPIRED:
    'Le lien de vérification a expiré. Vous pouvez demander un nouveau lien depuis la page de connexion.',
  USER_NOT_FOUND: "Aucun compte n'a été trouvé pour ce lien de vérification.",
  INVALID_USER:
    "Ce lien de vérification ne correspond pas à l'utilisateur connecté.",
};

export function EmailVerificationResult({ error }: Props) {
  const router = useRouter();
  const hasError = Boolean(error);
  const Icon = hasError ? AlertCircle : CheckCircle2;
  const title = hasError
    ? "Impossible de vérifier l'adresse email"
    : 'Bienvenue, votre email est vérifié';
  const message = hasError
    ? getEmailVerificationErrorMessage(error)
    : 'Votre compte est maintenant activé. Vous allez être redirigé vers la page d’accueil.';

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      router.replace('/');
      router.refresh();
    }, EMAIL_VERIFICATION_REDIRECT_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [router]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className={`mb-6 flex size-14 items-center justify-center rounded-full ${
          hasError
            ? 'bg-destructive/10 text-destructive'
            : 'bg-primary/10 text-primary'
        }`}
        aria-hidden="true"
      >
        <Icon className="size-7" />
      </div>

      <div className="space-y-3">
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="text-sm leading-6 text-muted-foreground sm:text-base">
          {message}
        </p>
        <p className="text-xs text-muted-foreground">
          Redirection automatique dans{' '}
          {Math.ceil(EMAIL_VERIFICATION_REDIRECT_DELAY_MS / 1000)} secondes.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {hasError && (
          <Button asChild variant="outline">
            <Link href="/auth/sign-in">Demander un nouveau lien</Link>
          </Button>
        )}
        <Button asChild>
          <Link href="/">
            <Home className="size-4" aria-hidden="true" />
            Aller à l&apos;accueil
          </Link>
        </Button>
      </div>
    </div>
  );
}

function getEmailVerificationErrorMessage(error?: string) {
  if (!error) {
    return 'Le lien de vérification est invalide ou a expiré.';
  }

  return errorMessages[error] ?? 'Le lien de vérification est invalide.';
}
