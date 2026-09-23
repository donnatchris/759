'use client';

import { useEffect, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  updateCarouselFormSchema,
  type TUpdateCarouselFormInput,
  type TUpdateCarouselFormOutput,
  type TUpdateCarouselOutput,
} from '../lib/carousel.schema';
import { updateCarouselAction } from '../lib/carousel.action';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';

import { getPublicImages } from '@/features/core/image/lib/image.action';
import type { TPublicImage, TServerResponse } from '@/features/core';
import { RHFPublicImageSelector } from '@/features/core';

type Props = {
  carouselImages?: TUpdateCarouselOutput;
  onSuccess?: () => void;
  onClose?: () => void;
};

export function UpdateCarouselForm({
  carouselImages = [],
  onSuccess,
  onClose,
}: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [images, setImages] = useState<TPublicImage[]>([]);

  const clearServerError = () => setServerError(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        const res: TServerResponse<TPublicImage[]> = await getPublicImages();

        if (!res.success) {
          setImages([]);
          setServerError(getErrorMessageFromResponse(res));
          return;
        }

        setImages(res.data);
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
    images:
      carouselImages.length > 0
        ? carouselImages.map((image) => ({
            url: image.url,
          }))
        : [{ url: '' }],
  };

  const form = useForm<
    TUpdateCarouselFormInput,
    unknown,
    TUpdateCarouselFormOutput
  >({
    resolver: zodResolver(updateCarouselFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'images',
  });

  const resetAll = () => {
    reset(defaultValues);
    clearServerError();
  };

  const addImage = () => {
    append({ url: '' });
  };

  const onSubmit = async (data: TUpdateCarouselFormOutput) => {
    try {
      clearServerError();

      const response = await updateCarouselAction(data.images);

      if (response.success) {
        reset({
          images: response.data.map((image) => ({
            url: image.url,
          })),
        });

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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={addImage}
            disabled={isSubmitting}
            className="rounded-xl"
          >
            <Plus size={16} className="mr-1 inline-block" />
            Ajouter
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col gap-3 rounded-xl border bg-card p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">Image {index + 1}</p>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => move(index, index - 1)}
                    disabled={isSubmitting || index === 0}
                    className="rounded-xl"
                    aria-label="Monter l'image"
                  >
                    <ArrowUp size={16} />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => move(index, index + 1)}
                    disabled={isSubmitting || index === fields.length - 1}
                    className="rounded-xl"
                    aria-label="Descendre l'image"
                  >
                    <ArrowDown size={16} />
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={isSubmitting}
                    className="rounded-xl"
                    aria-label="Supprimer l'image"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              <RHFPublicImageSelector
                name={`images.${index}.url`}
                label="Image"
                required
                popoverContent="Image affichée dans le carousel de la page d'accueil."
                images={images}
              />
            </div>
          ))}
        </div>

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
