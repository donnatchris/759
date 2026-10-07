'use client';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { EmailPreferenceCheckbox } from './email-preference-checkbox';
import {
  updateUserProfileSchema,
  type TUpdateUserProfileInput,
  type TUpdateUserProfileOutput,
} from '../auth.schema';
import { updateCurrentUserProfileAction } from '../auth.action';
import { isPrestationsEnabled } from '@/settings/settings.helpers';

type Props = {
  values: TUpdateUserProfileInput;
  onSuccess?: () => void;
  onClose?: () => void;
};

export function UpdateUserProfileForm({ values, onSuccess, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultValues = {
    name: values.name ?? '',
    phone: values.phone ?? '',
    canReceiveMarketingEmails: values.canReceiveMarketingEmails ?? false,
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
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const resetAll = () => {
    reset(defaultValues);
    setServerError(null);
  };

  const onSubmit = async (data: TUpdateUserProfileOutput) => {
    try {
      setServerError(null);
      const response = await updateCurrentUserProfileAction(data);

      if (!response.success) {
        setServerError(getErrorMessageFromResponse(response));
        return;
      }

      reset(data);
      onClose?.();
      onSuccess?.();
    } catch {
      setServerError('Impossible de se connecter au serveur.');
    }
  };

  const phoneContent = isPrestationsEnabled()
    ? 'Facultatif pour votre compte, mais nécessaire pour réserver une prestation.'
    : 'Facultatif pour votre compte, mais pratique en cas de besoin.';

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 p-4"
      >
        <RHFInput
          name="name"
          label="Nom"
          required
          popoverContent="Votre nom ou pseudonyme affiché dans votre espace utilisateur."
        />
        <RHFInput
          name="phone"
          label="Téléphone (facultatif)"
          type="tel"
          popoverContent={phoneContent}
        />
        <EmailPreferenceCheckbox<TUpdateUserProfileInput>
          name="canReceiveMarketingEmails"
          label="Recevoir les actualités et informations"
          description="J'accepte de recevoir des emails relatifs aux actualités et aux événements."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={isSubmitting} className="rounded-xl">
            <Save size={16} className="mr-1 inline-block" />
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={resetAll}
            disabled={isSubmitting}
            className="rounded-xl"
          >
            <RotateCcw size={16} className="mr-1 inline-block" />
            Réinitialiser
          </Button>
        </div>

        {serverError && <p className="text-destructive">{serverError}</p>}
      </form>
    </FormProvider>
  );
}
