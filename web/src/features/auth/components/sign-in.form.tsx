'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { sendVerificationEmail, signIn } from '@/features/auth/auth-client';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { Button } from '@/components/ui/button';
import {
  signInSchema,
  type TSignInInput,
  type TSignInOutput,
} from '../auth.schema';
import { EMAIL_VERIFICATION_CALLBACK_URL } from '../auth.const';
import { getErrorMessageFromAuthError } from '../auth.error';
import { emailNotVerifiedClientError } from '../auth.error';

export function SignInForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState<string | null>(null);
  const [isSendingVerificationEmail, setIsSendingVerificationEmail] =
    useState(false);

  const defaultValues = {
    email: '',
    password: '',
  };

  const form = useForm<TSignInInput, unknown, TSignInOutput>({
    resolver: zodResolver(signInSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: TSignInOutput) => {
    setServerError(null);
    setEmailNotVerified(false);
    setEmailToVerify(null);

    const res = await signIn.email({
      email: data.email,
      password: data.password,
    });

    if (res.error) {
      if (emailNotVerifiedClientError(res.error)) {
        setEmailNotVerified(true);
        setEmailToVerify(data.email);
        setServerError(
          'Votre adresse email n’est pas vérifiée. Consultez vos mails pour valider le lien de vérification. Si vous ne l’avez pas reçu, vous pouvez demander un nouveau lien de vérification.',
        );
        return;
      }
      setServerError(getErrorMessageFromAuthError(res.error));
      return;
    }

    router.push('/auth/redirect');
    router.refresh();
    toast.success('Bienvenue !', {
      position: 'top-center',
    });
  };

  const resendVerificationEmail = async () => {
    if (!emailToVerify) return;

    setIsSendingVerificationEmail(true);
    setServerError(null);

    const res = await sendVerificationEmail({
      email: emailToVerify,
      callbackURL: EMAIL_VERIFICATION_CALLBACK_URL,
    });

    setIsSendingVerificationEmail(false);

    if (res.error) {
      setServerError(getErrorMessageFromAuthError(res.error));
      return;
    }

    toast.success('Email de vérification envoyé.', {
      position: 'top-center',
    });
  };

  return (
    <FormProvider {...form}>
      <div className="w-full space-y-4">
        {serverError && <p className="text-destructive">{serverError}</p>}
        {emailNotVerified && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isSendingVerificationEmail}
            onClick={resendVerificationEmail}
          >
            {isSendingVerificationEmail
              ? 'Envoi...'
              : "Renvoyer l'email de vérification"}
          </Button>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <RHFInput name="email" label="Email" type="email" required />
          <RHFInput
            name="password"
            label="Mot de passe"
            type="password"
            required
          />
          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary underline"
            >
              Mot de passe oublié
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      </div>
    </FormProvider>
  );
}
