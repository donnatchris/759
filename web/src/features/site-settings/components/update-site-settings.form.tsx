'use client';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { Save, RotateCcw } from 'lucide-react';
import {
  siteSettingsUpdateSchema,
  type TSiteSettingsUpdateInput,
  type TSiteSettingsUpdateOutput,
} from '../lib/site-settings.schema';
import { updateSiteSettings } from '../lib/site-settings.action';

type Props = {
  values?: TSiteSettingsUpdateInput;
  onSuccess?: () => void;
  onClose?: () => void;
};

export function UpdateSiteSettingsForm({ values, onSuccess, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const clearServerError = () => setServerError(null);

  const defaultValues = {
    fullName: values?.fullName ?? '',
    shortName: values?.shortName ?? '',
    sloganHead: values?.sloganHead ?? '',
    sloganAccent: values?.sloganAccent ?? '',
    sloganTail: values?.sloganTail ?? '',
    address: values?.address ?? '',
    tel: values?.tel ?? '',
    mail: values?.mail ?? '',
    activities: values?.activities ?? [''],
  };

  const form = useForm<
    TSiteSettingsUpdateInput,
    unknown,
    TSiteSettingsUpdateOutput
  >({
    resolver: zodResolver(siteSettingsUpdateSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const resetAll = () => {
    reset({
      fullName: '',
      shortName: '',
      sloganHead: '',
      sloganAccent: '',
      sloganTail: '',
      address: '',
      tel: '',
      mail: '',
      activities: [''],
    });
    clearServerError();
  };

  const onSubmit = async (data: TSiteSettingsUpdateOutput) => {
    try {
      clearServerError();
      const response = await updateSiteSettings(data);
      if (response.success) {
        resetAll();
        onClose?.();
        onSuccess?.();
      } else {
        setServerError(getErrorMessageFromResponse(response));
      }
    } catch {
      setServerError(
        'Impossible de se connecter au serveur. Veuillez réessayer plus tard.',
      );
    }
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 p-4"
      >
        <RHFInput
          name="fullName"
          label="Nom complet"
          required
          popoverContent="Le nom complet de votre site, qui peut être affiché dans le pied de page ou d'autres sections du site."
        />

        <RHFInput
          name="shortName"
          label="Nom court"
          popoverContent="Le nom court de votre site, utilisé pour les logos ou les affichages où l'espace est limité."
        />

        <RHFInput
          name="sloganHead"
          label="Slogan - début"
          popoverContent="La première partie de votre slogan, qui peut être affichée sur la page d'accueil ou dans d'autres sections du site."
        />

        <RHFInput
          name="sloganAccent"
          label="Slogan - accent"
          popoverContent="La partie accentuée de votre slogan, qui peut être mise en valeur sur la page d'accueil ou dans d'autres sections du site."
        />

        <RHFInput
          name="sloganTail"
          label="Slogan - fin"
          popoverContent="La dernière partie de votre slogan, qui peut être affichée sur la page d'accueil ou dans d'autres sections du site."
        />

        <RHFInput
          name="address"
          label="Adresse"
          popoverContent="L'adresse physique de votre entreprise, qui peut être affichée sur la page d'accueil, dans le pied de page ou sur la page de contact. Laissez vide si vous ne souhaitez pas afficher publiquement."
        />

        <RHFInput
          name="tel"
          label="Téléphone"
          popoverContent="Le numéro de téléphone de votre entreprise, qui peut être affiché sur la page d'accueil, dans le pied de page ou sur la page de contact. Laissez vide si vous ne souhaitez pas afficher publiquement."
        />

        <RHFInput
          name="mail"
          label="E-mail"
          popoverContent="L'adresse e-mail de votre entreprise, qui peut être affichée sur la page d'accueil, dans le pied de page ou sur la page de contact. Laissez vide si vous ne souhaitez pas afficher publiquement."
        />

        <RHFInput
          name="activities"
          label="Activités"
          type="array"
          popoverContent="Une liste des activités ou services que votre entreprise propose, qui peut être affichée sur la page d'accueil ou dans d'autres sections du site."
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
