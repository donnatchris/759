'use client';

import { useState, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  servicesCategorySchema,
  type TServicesCategoryInput,
  type TServicesCategoryOutput,
} from '../lib/services.schema';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { Save, RotateCcw } from 'lucide-react';
import { createServiceCategoryAction } from '../lib/services.action';

import { getPublicImages } from '@/features/core/image/lib/image.action';
import type { TPublicImage, TServerResponse } from '@/features/core';
import { RHFPublicImageSelector } from '@/features/core';

type Props = {
  onSuccess?: () => void;
  onClose?: () => void;
};

export function CreateServiceCategoryForm({ onSuccess, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const clearServerError = () => setServerError(null);

  const [images, setImages] = useState<TPublicImage[]>([]);

  useEffect(() => {
    async function fetchImages() {
      try {
        const res: TServerResponse<TPublicImage[]> = await getPublicImages();
        const fetchedImages = res.success ? res.data : [];
        if (!res.success) {
          setImages([]);
          setServerError(
            'Impossible de charger les images disponibles. Veuillez réessayer plus tard.',
          );
        } else {
          setImages(fetchedImages);
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
    label: '',
    shortDescription: '',
    longDescription: '',
    imageUrl: '',
    infos: '',
    orderIndex: '',
  };

  const form = useForm<
    TServicesCategoryInput,
    unknown,
    TServicesCategoryOutput
  >({
    resolver: zodResolver(servicesCategorySchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const resetAll = () => {
    reset();
    clearServerError();
  };

  const onSubmit = async (data: TServicesCategoryOutput) => {
    try {
      clearServerError();
      const response = await createServiceCategoryAction(data);
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
          label="Intitulé de la catégorie de prestation"
          required
          popoverContent="L'intitulé (le titre) de la catégorie de prestation, affiché sur la page d'accueil et dans le menu."
        />
        <RHFInput
          name="shortDescription"
          label="Description courte"
          type="textarea"
          required
          popoverContent="La description courte de la catégorie de prestation, affichée sur la page d'accueil, utilisée pour présenter brièvement la catégorie de prestation."
        />
        <RHFInput
          name="longDescription"
          label="Description longue"
          type="textarea"
          popoverContent="La description longue de la catégorie de prestation, affichée sur la page de détails de la catégorie de prestation, utilisée pour présenter en détail la catégorie de prestation. Si la description longue n'est pas renseignée, c'est la description courte qui sera affichée à la place."
        />
        <RHFInput
          name="infos"
          label="Informations supplémentaires"
          type="textarea"
          popoverContent="Les informations supplémentaires de la catégorie de prestation, affichées sur la page de détails de la catégorie de prestation, utilisées pour présenter des informations complémentaires."
        />
        <RHFPublicImageSelector
          name="imageUrl"
          label="Image de la catégorie de prestation"
          required
          popoverContent="L'image de la catégorie de prestation, affichée sur la page d'accueil et dans le menu. L'image doit être au format PNG, JPG ou SVG et doit avoir une taille maximale de 2 Mo."
          images={images}
        />
        <RHFInput
          name="orderIndex"
          label="Index de tri"
          type="number"
          popoverContent="L'index de tri de la catégorie de prestation, utilisé pour définir l'ordre d'affichage des catégories de prestation sur la page d'accueil et dans le menu. Les catégories de prestation sont triées par ordre croissant d'index de tri. Si l'index de tri n'est pas renseigné, la catégorie de prestation sera affichée après celles qui ont un index de tri renseigné."
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
