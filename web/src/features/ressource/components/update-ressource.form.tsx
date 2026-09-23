'use client';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { RotateCcw, Save } from 'lucide-react';
import { updateRessourceAction } from '../lib/ressource.action';
import {
  updateRessourceSchema,
  type TUpdateRessourceInput,
  type TUpdateRessourceOutput,
} from '../lib/ressource.schema';
import type { Ressource } from '../lib/ressource.types';

type Props = {
  values: Ressource;
  onSuccess?: () => void;
  onClose?: () => void;
};

export function UpdateRessourceForm({ values, onSuccess, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultValues = {
    id: values.id,
    label: values.label,
    quantity: values.quantity,
    color: values.color,
  };

  const form = useForm<TUpdateRessourceInput, unknown, TUpdateRessourceOutput>({
    resolver: zodResolver(updateRessourceSchema),
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

  const onSubmit = async (data: TUpdateRessourceOutput) => {
    try {
      setServerError(null);
      const response = await updateRessourceAction(data);
      if (!response.success) {
        setServerError(getErrorMessageFromResponse(response));
        return;
      }

      resetAll();
      onClose?.();
      onSuccess?.();
    } catch {
      setServerError('Impossible de se connecter au serveur.');
    }
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 p-4"
      >
        <RHFInput
          name="label"
          label="Intitulé de la ressource"
          required
          popoverContent="Nom de la ressource utilisée pour organiser les disponibilités."
        />
        <RHFInput
          name="quantity"
          label="Quantité disponible"
          type="number"
          required
          popoverContent="Nombre d'unités disponibles simultanément pour cette ressource."
        />
        <RHFInput
          name="color"
          label="Couleur"
          type="color"
          required
          popoverContent="Couleur associée à la ressource au format hexadécimal."
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
