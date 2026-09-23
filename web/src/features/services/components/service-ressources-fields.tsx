'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import type { Ressource } from '../lib/services.types';

type ServiceRessourcesFormInput = {
  serviceRessources: Array<{
    serviceId?: string;
    ressourceId: string;
    quantity: number | string;
    durationInMinutes: number | string | null;
    offsetInMinutes: number | string | null;
  }>;
};

type Props = {
  ressources: Ressource[];
  serviceId?: string;
};

export function ServiceRessourcesFields({ ressources, serviceId = '' }: Props) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ServiceRessourcesFormInput>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'serviceRessources',
  });

  const serviceRessourcesErrors = errors.serviceRessources;

  return (
    <div className="flex flex-col gap-4">
      {fields.length === 0 && (
        <p className="text-xs font-semibold text-muted-foreground">
          Cliquez sur le bouton pour ajouter une ressource à mobiliser pour
          cette prestation.
        </p>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="relative">
            <div className="flex flex-col gap-2 rounded-md border border-input p-2 shadow-sm">
              <div className="space-y-1">
                <label className="text-sm font-bold">Ressource</label>

                <select
                  {...register(`serviceRessources.${index}.ressourceId`)}
                  className="mt-1 flex w-full rounded-xl border border-input bg-background px-2 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Sélectionner une ressource</option>

                  {ressources.map((ressource) => (
                    <option key={ressource.id} value={ressource.id}>
                      {ressource.label} (max {ressource.quantity})
                    </option>
                  ))}
                </select>

                {serviceRessourcesErrors?.[index]?.ressourceId && (
                  <p className="text-sm text-destructive">
                    {serviceRessourcesErrors[index]?.ressourceId?.message}
                  </p>
                )}
              </div>

              <RHFInput<ServiceRessourcesFormInput>
                name={`serviceRessources.${index}.quantity`}
                label="Quantité"
                type="number"
                required
              />

              <RHFInput<ServiceRessourcesFormInput>
                name={`serviceRessources.${index}.durationInMinutes`}
                label="Durée mobilisation de la ressource (en minutes)"
                type="number"
                required
                popoverContent="Durée pendant laquelle cette ressource est mobilisée, en minutes."
              />

              <RHFInput<ServiceRessourcesFormInput>
                name={`serviceRessources.${index}.offsetInMinutes`}
                label="Décalage de mobilisation de la ressource (en minutes)"
                type="number"
                popoverContent="Nombre de minutes après le début de la prestation. Exemple : 30 signifie que cette ressource commence à être utilisée 30 minutes après le début de la prestation."
              />
            </div>

            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => remove(index)}
              className="absolute -right-3 -top-3"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({
            serviceId,
            ressourceId: '',
            quantity: 1,
            durationInMinutes: 30,
            offsetInMinutes: 0,
          })
        }
      >
        <Plus size={16} className="mr-1" />
        Ajouter une ressource à bloquer pour cette prestation
      </Button>
    </div>
  );
}
