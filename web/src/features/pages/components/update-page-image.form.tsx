'use client';

import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  pageImageSchema,
  type TPageImageInputValues,
  type TPageImageOutputValues,
} from '@/features/pages/lib/page-title.schema';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { getPublicImages } from '@/features/core/image/lib/image.action';
import type { TPublicImage, TServerResponse } from '@/features/core';
import { RHFPublicImageSelector } from '@/features/core';
import { RotateCcw, Save } from 'lucide-react';
import { updatePageImageAction } from '../lib/page-title.action';

type Props = {
  values?: TPageImageInputValues;
  onSuccess?: () => void;
  onClose?: () => void;
};

export function UpdatePageImageForm({ values, onSuccess, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [images, setImages] = useState<TPublicImage[]>([]);
  const clearServerError = () => setServerError(null);

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
    slug: values?.slug ?? '',
    image: values?.image ?? '',
  };

  const form = useForm<TPageImageInputValues, unknown, TPageImageOutputValues>({
    resolver: zodResolver(pageImageSchema),
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

  const onSubmit = async (data: TPageImageOutputValues) => {
    try {
      clearServerError();
      const response = await updatePageImageAction(data);
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
        <RHFPublicImageSelector
          name="image"
          label="Image de la page"
          allowEmpty
          emptyLabel="Pas d'image"
          popoverContent="L'image affichée sur la page. Choisissez une image publique ou aucune image."
          images={images}
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
