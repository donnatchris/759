'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { requestPasswordReset } from '@/features/auth/auth-client';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { Button } from '@/components/ui/button';
import {
  forgotPasswordSchema,
  type TForgotPasswordInput,
  type TForgotPasswordOutput,
} from '../auth.schema';
import { getErrorMessageFromAuthError } from '../auth.error';

export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<TForgotPasswordInput, unknown, TForgotPasswordOutput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: TForgotPasswordOutput) => {
    setServerError(null);

    const res = await requestPasswordReset({
      email: data.email,
      redirectTo: '/auth/reset-password',
    });

    if (res.error) {
      setServerError(getErrorMessageFromAuthError(res.error));
      return;
    }

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="w-full space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          Si un compte correspond à cette adresse email, un lien de
          réinitialisation vient d&apos;être envoyé.
        </p>
        <Button asChild className="w-full">
          <Link href="/auth/sign-in">Retour à la connexion</Link>
        </Button>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <div className="w-full space-y-4">
        {serverError && <p className="text-destructive">{serverError}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <RHFInput name="email" label="Email" type="email" required />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Envoi...' : 'Envoyer le lien'}
          </Button>
        </form>
      </div>
    </FormProvider>
  );
}
