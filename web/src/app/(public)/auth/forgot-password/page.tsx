import Link from 'next/link';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password.form';

export default function ForgotPasswordPage() {
  return (
    <main className="max-w-md h-screen flex items-center justify-center flex-col mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Mot de passe oublié</h1>
      <p className="text-center text-sm text-muted-foreground">
        Renseignez votre email pour recevoir un lien de réinitialisation.
      </p>
      <ForgotPasswordForm />
      <p className="text-sm text-muted-foreground">
        <Link href="/auth/sign-in" className="text-primary underline">
          Retour à la connexion
        </Link>
      </p>
    </main>
  );
}
