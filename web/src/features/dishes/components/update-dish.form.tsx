'use client';

import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import {
  RHFPublicImageSelector,
  type TPublicImage,
  type TServerResponse,
} from '@/features/core';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { getPublicImages } from '@/features/core/image/lib/image.action';
import { updateDishAction } from '../lib/dishes.action';
import {
  updateDishSchema,
  type TUpdateDishInput,
  type TUpdateDishOutput,
} from '../lib/dishes.schema';
import type { Dish } from '../lib/dishes.types';

type Props = {
  values: Dish;
  onSuccess?: () => void;
  onClose?: () => void;
};

export function UpdateDishForm({ values, onSuccess, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [images, setImages] = useState<TPublicImage[]>([]);
  const clearServerError = () => setServerError(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        const response: TServerResponse<TPublicImage[]> =
          await getPublicImages();
        if (response.success) {
          setImages(response.data);
        } else {
          setImages([]);
          setServerError(
            'Impossible de charger les images disponibles. Veuillez réessayer plus tard.',
          );
        }
      } catch {
        setImages([]);
        setServerError(
          'Impossible de charger les images disponibles. Veuillez réessayer plus tard.',
        );
      }
    }
    fetchImages();
  }, []);

  const defaultValues = useMemo<TUpdateDishInput>(
    () => ({
      id: values?.id ?? '',
      label: values?.label ?? '',
      details: values?.details ?? '',
      price: values?.price ?? '',
      imageUrl: values?.imageUrl ?? '',
      orderIndex: values?.orderIndex ?? '',
    }),
    [values],
  );

  const form = useForm<TUpdateDishInput, unknown, TUpdateDishOutput>({
    resolver: zodResolver(updateDishSchema),
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

  const onSubmit = async (data: TUpdateDishOutput) => {
    try {
      clearServerError();
      const response = await updateDishAction(data);
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
          label="Intitulé du plat"
          required
          popoverContent="Le nom du plat affiché sur le menu."
        />
        <RHFInput
          name="details"
          label="Description du plat"
          type="textarea"
          popoverContent="La description et la composition du plat affichées sur le menu."
        />
        <RHFInput
          name="price"
          label="Prix du plat"
          popoverContent="Le prix du plat tel que vous souhaitez l'afficher."
        />
        <RHFPublicImageSelector
          name="imageUrl"
          label="Image du plat"
          required
          popoverContent="L'image du plat affichée sur le menu."
          images={images}
        />
        <RHFInput
          name="orderIndex"
          label="Ordre d'affichage"
          type="number"
          popoverContent="Les plats sont affichés par ordre croissant d'index de tri."
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
