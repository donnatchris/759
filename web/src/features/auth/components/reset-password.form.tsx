'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { resetPassword } from '@/features/auth/auth-client';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { Button } from '@/components/ui/button';
import {
  resetPasswordFormSchema,
  type TResetPasswordFormInput,
  type TResetPasswordFormOutput,
} from '../auth.schema';
import { getPasswordResetErrorMessageFromAuthError } from '../auth.error';

type Props = {
  token: string | null;
};

export function ResetPasswordForm({ token }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<
    TResetPasswordFormInput,
    unknown,
    TResetPasswordFormOutput
  >({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: TResetPasswordFormOutput) => {
    if (!token) return;

    setServerError(null);

    const res = await resetPassword({
      newPassword: data.password,
      token,
    });

    if (res.error) {
      setServerError(getPasswordResetErrorMessageFromAuthError(res.error));
      return;
    }

    toast.success('Votre mot de passe a été mis à jour.', {
      position: 'top-center',
    });
    router.push('/auth/sign-in');
    router.refresh();
  };

  if (!token) {
    return (
      <div className="w-full space-y-4 text-center">
        <p className="text-sm text-destructive">
          Le lien de réinitialisation est invalide ou a expiré.
        </p>
        <Button asChild className="w-full">
          <Link href="/auth/forgot-password">Demander un nouveau lien</Link>
        </Button>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <div className="w-full space-y-4">
        {serverError && <p className="text-destructive">{serverError}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <RHFInput
            name="password"
            label="Nouveau mot de passe"
            type="password"
            required
          />
          <RHFInput
            name="confirmPassword"
            label="Confirmer le mot de passe"
            type="password"
            required
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </Button>
        </form>
      </div>
    </FormProvider>
  );
}
