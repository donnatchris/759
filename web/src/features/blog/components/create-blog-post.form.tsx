'use client';

import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { Save, RotateCcw } from 'lucide-react';
import {
  createBlogPostSchema,
  type TCreateBlogPostInput,
  type TCreateBlogPostOutput,
} from '../lib/blog.schema';
import { createBlogPostAction } from '../lib/blog.action';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { getPublicImages } from '@/features/core/image/lib/image.action';
import { RHFPublicImageSelector } from '@/features/core';
import type { TPublicImage, TServerResponse } from '@/features/core';

type Props = {
  onSuccess?: () => void;
  onClose?: () => void;
};

export function CreateBlogPostForm({ onSuccess, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [images, setImages] = useState<TPublicImage[]>([]);

  useEffect(() => {
    async function fetchImages() {
      const res: TServerResponse<TPublicImage[]> = await getPublicImages();
      if (res.success) {
        setImages(res.data);
        return;
      }
      setImages([]);
      setServerError('Impossible de charger les images disponibles.');
    }

    fetchImages().catch(() => {
      setImages([]);
      setServerError('Impossible de charger les images disponibles.');
    });
  }, []);

  const defaultValues = {
    title: '',
    subTitle: '',
    content: '',
    tag: '',
    author: '',
    imageUrl: '',
    links: [],
    eventStartDate: '',
    eventEndDate: '',
  };

  const form = useForm<TCreateBlogPostInput, unknown, TCreateBlogPostOutput>({
    resolver: zodResolver(createBlogPostSchema),
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

  const onSubmit = async (data: TCreateBlogPostOutput) => {
    try {
      setServerError(null);
      const response = await createBlogPostAction(data);
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
          name="title"
          label="Titre"
          required
          popoverContent="Titre de l'article (obligatoire)."
        />
        <RHFInput
          name="subTitle"
          label="Sous-titre"
          popoverContent="Sous-titre de l'article (optionnel)."
        />
        <RHFInput
          name="tag"
          label="Tag"
          placeholder="Ex: Promotion, Offre spéciale, Événement, etc."
          popoverContent="Tag de l'article (optionnel). Permet de catégoriser les articles et d'afficher un badge dans la liste des articles. Par exemple : 'Promotion', 'Offre spéciale', 'Événement à venir', etc."
        />
        <RHFInput
          name="author"
          label="Auteur"
          popoverContent="Auteur de l'article (optionnel)."
        />
        <RHFInput
          name="content"
          label="Contenu"
          type="textarea"
          required
          popoverContent="Contenu détaillé de l'article (obligatoire)."
        />
        <RHFPublicImageSelector
          name="imageUrl"
          label="Image"
          images={images}
          popoverContent="Image associée à l'article (optionnelle)."
        />
        <RHFInput
          name="links"
          label="Liens"
          type="array"
          placeholder="https://..."
          popoverContent="Ajoutez des liens (optionnel) qui seront affichés sous le contenu de l'article. Par exemple, un lien vers une page de votre site ou vers un réseau social."
        />
        <h3 className="text-lg font-bold text-primary border-t mt-2">
          {"Dates de l'événement"}
        </h3>
        <p className="text-xs text-muted-foreground">
          {
            "Si votre événement est temporaire, vous pouvez définir les dates de début et de fin de l'événement pour informer les utilisateurs de la période de validité de l'article."
          }
        </p>
        <RHFInput
          name="eventStartDate"
          label="Date de début de l'événement"
          type="date"
          popoverContent="Date et heure de début de l'événement (optionnel)."
        />
        <RHFInput
          name="eventEndDate"
          label="Date de fin de l'événement"
          type="date"
          popoverContent="Date et heure de fin de l'événement (optionnel)."
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
