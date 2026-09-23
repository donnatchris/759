'use client';

import { useEffect, useState } from 'react';
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
import { updateDishCategoryAction } from '../lib/dishes.action';
import {
  updateDishCategorySchema,
  type TUpdateDishCategoryInput,
  type TUpdateDishCategoryOutput,
} from '../lib/dishes.schema';

type Props = {
  values: TUpdateDishCategoryInput;
  onSuccess?: () => void;
  onClose?: () => void;
};

export function UpdateDishCategoryForm({ values, onSuccess, onClose }: Props) {
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

  const defaultValues = {
    id: values?.id ?? '',
    label: values?.label ?? '',
    shortDescription: values?.shortDescription ?? '',
    longDescription: values?.longDescription ?? '',
    imageUrl: values?.imageUrl ?? '',
    infos: values?.infos ?? '',
    orderIndex: values?.orderIndex ?? undefined,
  };

  const form = useForm<
    TUpdateDishCategoryInput,
    unknown,
    TUpdateDishCategoryOutput
  >({
    resolver: zodResolver(updateDishCategorySchema),
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

  const onSubmit = async (data: TUpdateDishCategoryOutput) => {
    try {
      clearServerError();
      const response = await updateDishCategoryAction(data);
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
          label="Intitulé de la catégorie de plats"
          required
          popoverContent="L'intitulé de la catégorie, affiché dans le résumé et sur la page du menu."
        />
        <RHFInput
          name="shortDescription"
          label="Description courte"
          type="textarea"
          required
          popoverContent="La description courte de la catégorie, affichée dans le résumé du menu."
        />
        <RHFInput
          name="longDescription"
          label="Description longue"
          type="textarea"
          popoverContent="La description détaillée affichée sur la page du menu. Si elle est vide, la description courte sera utilisée."
        />
        <RHFInput
          name="infos"
          label="Informations supplémentaires"
          type="textarea"
          popoverContent="Les informations complémentaires affichées sous les plats de cette catégorie."
        />
        <RHFPublicImageSelector
          name="imageUrl"
          label="Image de la catégorie de plats"
          required
          popoverContent="L'image de la catégorie, affichée dans le résumé et sur la page du menu."
          images={images}
        />
        <RHFInput
          name="orderIndex"
          label="Index de tri"
          type="number"
          popoverContent="Les catégories sont affichées par ordre croissant d'index de tri."
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
