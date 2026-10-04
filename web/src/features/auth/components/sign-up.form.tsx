'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUp } from '@/features/auth/auth-client';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { Button } from '@/components/ui/button';
import { EmailPreferenceCheckbox } from './email-preference-checkbox';
import { LegalTermsAcceptanceCheckbox } from './legal-terms-acceptance-checkbox';
import { EMAIL_VERIFICATION_CALLBACK_URL } from '../auth.const';
import {
  signUpFormSchema,
  type TSignUpFormInput,
  type TSignUpFormOutput,
} from '../auth.schema';
import { getErrorMessageFromAuthError } from '../auth.error';
import { isPrestationsEnabled } from '@/settings/settings.helpers';

export function SignUpForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultValues = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    canReceiveMarketingEmails: false,
    legalTermsAccepted: false,
  };

  const form = useForm<TSignUpFormInput, unknown, TSignUpFormOutput>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: TSignUpFormOutput) => {
    setServerError(null);

    const res = await signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone ?? undefined,
      canReceiveMarketingEmails: data.canReceiveMarketingEmails,
      legalTermsAccepted: data.legalTermsAccepted,
      callbackURL: EMAIL_VERIFICATION_CALLBACK_URL,
    });
    if (res.error) {
      setServerError(getErrorMessageFromAuthError(res.error));
      return;
    }
    router.push('/auth/check-email');
    router.refresh();
  };

  const phoneContent = isPrestationsEnabled()
    ? 'Facultatif pour votre compte, mais nécessaire pour réserver une prestation.'
    : 'Facultatif pour votre compte, mais pratique en cas de besoin.';

  return (
    <FormProvider {...form}>
      <div className="w-full space-y-4">
        {serverError && <p className="text-destructive">{serverError}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <RHFInput
            name="name"
            label="Nom ou pseudo"
            required
            popoverContent="Votre nom ou pseudonyme."
          />
          <RHFInput name="email" label="Email" type="email" required />
          <RHFInput
            name="phone"
            label="Téléphone (facultatif)"
            type="tel"
            popoverContent={phoneContent}
          />
          <RHFInput
            name="password"
            label="Mot de passe"
            type="password"
            required
          />
          <RHFInput
            name="confirmPassword"
            label="Confirmer le mot de passe"
            type="password"
            required
          />
          <EmailPreferenceCheckbox<TSignUpFormInput>
            name="canReceiveMarketingEmails"
            label="Recevoir les actualités et informations commerciales"
            description="J'accepte de recevoir des emails commerciaux, comme les actualités et offres promotionnelles."
          />
          <LegalTermsAcceptanceCheckbox<TSignUpFormInput> name="legalTermsAccepted" />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Création...' : 'Créer un compte'}
          </Button>
        </form>
      </div>
    </FormProvider>
  );
}
