import Link from 'next/link';
import { ResetPasswordForm } from '@/features/auth/components/reset-password.form';

type Props = {
  searchParams: Promise<{
    token?: string;
    error?: string;
  }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token, error } = await searchParams;
  const resetToken = error ? null : (token ?? null);

  return (
    <main className="max-w-md h-screen flex items-center justify-center flex-col mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Nouveau mot de passe</h1>
      <ResetPasswordForm token={resetToken} />
      <p className="text-sm text-muted-foreground">
        <Link href="/auth/sign-in" className="text-primary underline">
          Retour à la connexion
        </Link>
      </p>
    </main>
  );
}
