'use client';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { EmailPreferenceCheckbox } from './email-preference-checkbox';
import { LegalTermsAcceptanceCheckbox } from './legal-terms-acceptance-checkbox';
import { updateCurrentUserProfileAction } from '../auth.action';
import {
  updateUserProfileSchema,
  type TUpdateUserProfileInput,
  type TUpdateUserProfileOutput,
} from '../auth.schema';

type Props = {
  user: {
    name: string;
    phone: string | null;
    canReceiveMarketingEmails: boolean | null | undefined;
    legalTermsAccepted: boolean | null | undefined;
  };
  redirectTo: string;
  showPhoneField: boolean;
  showMarketingEmailConsent: boolean;
  showLegalTermsAcceptance: boolean;
  requireLegalTermsAcceptance: boolean;
};

export function AuthRedirectCompletionForm({
  user,
  redirectTo,
  showPhoneField,
  showMarketingEmailConsent,
  showLegalTermsAcceptance,
  requireLegalTermsAcceptance,
}: Props) {
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultValues: TUpdateUserProfileInput = {
    name: user.name,
    phone: user.phone ?? '',
    canReceiveMarketingEmails: Boolean(user.canReceiveMarketingEmails),
    legalTermsAccepted: Boolean(user.legalTermsAccepted),
  };

  const form = useForm<
    TUpdateUserProfileInput,
    unknown,
    TUpdateUserProfileOutput
  >({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = form;

  const continueToApp = () => {
    window.location.replace(redirectTo);
  };

  const onSubmit = async (data: TUpdateUserProfileOutput) => {
    if (requireLegalTermsAcceptance && data.legalTermsAccepted !== true) {
      setError('legalTermsAccepted', {
        type: 'manual',
        message: "Vous devez accepter les conditions générales d'utilisation",
      });
      return;
    }

    try {
      setServerError(null);
      const response = await updateCurrentUserProfileAction(data);

      if (!response.success) {
        setServerError(getErrorMessageFromResponse(response));
        return;
      }

      continueToApp();
    } catch {
      setServerError('Impossible de se connecter au serveur.');
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        {showPhoneField && (
          <div className="space-y-2">
            <RHFInput<TUpdateUserProfileInput>
              name="phone"
              label="Téléphone"
              type="tel"
              required
              popoverContent="Le numéro de téléphone sera utilisé pour confirmer les réservations."
            />
            <p className="text-xs text-muted-foreground">
              Le numéro de téléphone est obligatoire pour confirmer vos
              réservations, mais il ne sera pas partagé publiquement ni utilisé
              à d&apos;autres fins.
            </p>
          </div>
        )}

        {showMarketingEmailConsent && (
          <div className="space-y-2">
            <EmailPreferenceCheckbox<TUpdateUserProfileInput>
              name="canReceiveMarketingEmails"
              label="Recevoir les actualités et promotions"
              description="J'accepte de recevoir des emails commerciaux, comme les actualités et offres promotionnelles."
            />
            <p className="text-xs text-muted-foreground">
              Les emails commerciaux comprennent des actualités sur le site, des
              offres promotionnelles et d&apos;autres communications marketing.
            </p>
          </div>
        )}

        {showLegalTermsAcceptance && (
          <div className="space-y-2">
            <LegalTermsAcceptanceCheckbox<TUpdateUserProfileInput> name="legalTermsAccepted" />
            <p className="text-xs text-muted-foreground">
              {requireLegalTermsAcceptance
                ? 'Cette acceptation est obligatoire pour finaliser votre compte.'
                : 'Vous pouvez accepter cette nouvelle version maintenant ou plus tard.'}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4" aria-hidden="true" />
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={continueToApp}
            disabled={isSubmitting || requireLegalTermsAcceptance}
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
            Passer
          </Button>
        </div>

        {serverError && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}
      </form>
    </FormProvider>
  );
}
