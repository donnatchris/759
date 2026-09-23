'use client';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  createServiceSchema,
  type TCreateServiceInput,
  type TCreateServiceOutput,
} from '../lib/services.schema';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { Save, RotateCcw } from 'lucide-react';
import { createServiceAction } from '../lib/services.action';
import { Label } from '@/components/ui/label';
import { ServiceRessourcesFields } from './service-ressources-fields';
import type { Ressource } from '../lib/services.types';

type Props = {
  categoryId: string;
  ressources: Ressource[];
  onSuccess?: () => void;
  onClose?: () => void;
};

export function CreateServiceForm({
  categoryId,
  ressources,
  onSuccess,
  onClose,
}: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const clearServerError = () => setServerError(null);

  const defaultValues: TCreateServiceInput = {
    categoryId: categoryId,
    label: '',
    details: '',
    price: '',
    orderIndex: '',
    bookable: true,
    serviceRessources: [],
  };

  const form = useForm<TCreateServiceInput, unknown, TCreateServiceOutput>({
    resolver: zodResolver(createServiceSchema),
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

  const onSubmit = async (data: TCreateServiceOutput) => {
    try {
      clearServerError();
      const dataToSend: TCreateServiceInput = {
        ...data,
        categoryId,
      };
      const response = await createServiceAction(dataToSend);
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
          popoverContent="Le prix de la prestation (si applicable), affiché sur la page d'accueil et dans le menu. Saisissez le prix tel que vous souhaitez qu'il soit affiché (ex: '50€', 'À partir de 30€', 'Sur devis', etc.) ou laissez vide si ne s'applique pas."
        />
        <RHFInput
          name="orderIndex"
          label="Ordre d'affichage"
          type="number"
          popoverContent="Les prestations sont affichées dans l'ordre défini par cet index de tri, de la plus petite à la plus grande."
        />
        <div className="flex items-center gap-3 rounded-lg border border-border p-3">
          <input
            id="create-service-bookable"
            type="checkbox"
            {...form.register('bookable')}
            className="h-4 w-4 accent-primary"
          />
          <Label htmlFor="create-service-bookable" className="font-medium">
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

        <ServiceRessourcesFields ressources={ressources} />

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
