'use client';

import { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { ServiceRessourcesFields } from './service-ressources-fields';

import {
  updateServiceSchema,
  type TUpdateServiceInput,
  type TUpdateServiceOutput,
} from '../lib/services.schema';
import { updateServiceAction } from '../lib/services.action';
import type { Ressource, TServiceWithRessources } from '../lib/services.types';

type Props = {
  values: TServiceWithRessources;
  ressources: Ressource[];
  onSuccess?: () => void;
  onClose?: () => void;
};

export function UpdateServiceForm({
  values,
  ressources,
  onSuccess,
  onClose,
}: Props) {
  const [serverError, setServerError] = useState<string | null>(null);

  const clearServerError = () => setServerError(null);

  const defaultValues = useMemo<TUpdateServiceInput>(
    () => ({
      id: values?.id ?? '',
      label: values?.label ?? '',
      details: values?.details ?? '',
      price: values?.price ?? '',
      orderIndex: values?.orderIndex ?? '',
      bookable: values?.bookable ?? true,
      serviceRessources:
        values?.serviceRessources?.map((sr) => ({
          serviceId: values.id,
          ressourceId: sr.ressourceId,
          quantity: sr.quantity,
          durationInMinutes: sr.durationInMinutes,
          offsetInMinutes: sr.offsetInMinutes ?? 0,
        })) ?? [],
    }),
    [values],
  );

  const form = useForm<TUpdateServiceInput, unknown, TUpdateServiceOutput>({
    resolver: zodResolver(updateServiceSchema),
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
    clearServerError();
  };

  const onSubmit = async (data: TUpdateServiceOutput) => {
    try {
      clearServerError();

      const response = await updateServiceAction(data);

      if (response.success) {
        reset(data);
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
          name="label"
          label="Intitulé de la prestation"
          required
          popoverContent="L'intitulé de la prestation, affiché sur la page d'accueil et dans le menu."
        />

        <RHFInput
          name="details"
          label="Description de la prestation"
          type="textarea"
          popoverContent="La description de la prestation, affichée sur la page d'accueil et dans le menu."
        />

        <RHFInput
          name="price"
          label="Prix de la prestation"
          popoverContent="Le prix de la prestation, tel que vous souhaitez l'afficher."
        />

        <RHFInput
          name="orderIndex"
          label="Ordre d'affichage"
          type="number"
          popoverContent="Les prestations sont affichées dans l'ordre défini par cet index de tri."
        />

        <div className="flex items-center gap-3 rounded-lg border border-border p-3">
          <input
            id={`update-service-${values.id}-bookable`}
            type="checkbox"
            {...form.register('bookable')}
            className="h-4 w-4 accent-primary"
          />
          <Label
            htmlFor={`update-service-${values.id}-bookable`}
            className="font-medium"
          >
            Réservable en ligne
          </Label>
        </div>

        <div className="mt-2 border-t pt-4">
          <h3 className="text-lg font-bold text-primary">
            Ressources mobilisées par cette prestation
          </h3>

          <p className="text-xs text-muted-foreground">
            Définissez les ressources nécessaires pour réaliser cette
            prestation. Par exemple : salle, équipement, véhicule, technicien,
            etc.
          </p>
        </div>

        <ServiceRessourcesFields
          ressources={ressources}
          serviceId={values.id}
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
