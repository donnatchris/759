'use client';

import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { Save, RotateCcw } from 'lucide-react';
import {
  updateCurrentEventSchema,
  type TUpdateCurrentEventInput,
  type TUpdateCurrentEventOutput,
} from '../lib/current-events.schema';
import { editCurrentEventAction } from '../lib/current-events.action';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { getPublicImages } from '@/features/core/image/lib/image.action';
import { RHFPublicImageSelector } from '@/features/core';
import type { TPublicImage, TServerResponse } from '@/features/core';

type Props = {
  values: TUpdateCurrentEventOutput;
  onSuccess?: () => void;
  onClose?: () => void;
};

export function UpdateCurrentEventForm({ values, onSuccess, onClose }: Props) {
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
    id: values.id,
    title: values.title ?? '',
    subTitle: values.subTitle ?? '',
    tag: values.tag ?? '',
    content: values.content ?? '',
    author: values.author ?? '',
    imageUrl: values.imageUrl ?? '',
    links: values.links ?? [],
    eventStartDate: values.eventStartDate
      ? new Date(values.eventStartDate)
      : '',
    eventEndDate: values.eventEndDate ? new Date(values.eventEndDate) : '',
    displayStartDate: values.displayStartDate
      ? new Date(values.displayStartDate)
      : '',
    displayEndDate: values.displayEndDate
      ? new Date(values.displayEndDate)
      : '',
  };

  const form = useForm<
    TUpdateCurrentEventInput,
    unknown,
    TUpdateCurrentEventOutput
  >({
    resolver: zodResolver(updateCurrentEventSchema),
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

  const onSubmit = async (data: TUpdateCurrentEventOutput) => {
    try {
      setServerError(null);
      const response = await editCurrentEventAction(data);
      if (!response.success) {
        setServerError(getErrorMessageFromResponse(response));
        return;
      }

      resetAll();
      onSuccess?.();
      onClose?.();
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
          popoverContent="Titre de l'actualité (obligatoire)."
        />
        <RHFInput
          name="subTitle"
          label="Sous-titre"
          popoverContent="Sous-titre de l'actualité (optionnel)."
        />
        <RHFInput
          name="tag"
          label="Tag"
          placeholder="Ex: Promotion, Offre spéciale, Événement, etc."
          popoverContent="Tag de l'actualité (optionnel). Permet de catégoriser les actualités et d'afficher un badge dans la liste des actualités. Par exemple : 'Promotion', 'Offre spéciale', 'Événement à venir', etc."
        />
        <RHFInput
          name="author"
          label="Auteur"
          popoverContent="Auteur de l'actualité (optionnel)."
        />
        <RHFInput
          name="content"
          label="Contenu"
          type="textarea"
          required
          popoverContent="Contenu détaillé de l'actualité (obligatoire)."
        />
        <RHFPublicImageSelector
          name="imageUrl"
          label="Image"
          images={images}
          popoverContent="Image associée à l'actualité (optionnelle)."
        />
        <RHFInput
          name="links"
          label="Liens"
          type="array"
          placeholder="https://..."
          popoverContent="Ajoutez des liens (optionnel) qui seront affichés sous le contenu de l'actualité. Par exemple, un lien vers une page de votre site ou vers un réseau social."
        />
        <h3 className="text-lg font-bold text-primary border-t mt-2">
          {"Dates de l'événement"}
        </h3>
        <p className="text-xs text-muted-foreground">
          {
            "Si votre événement est temporaire, vous pouvez définir les dates de début et de fin de l'événement pour informer les utilisateurs de la période de validité de l'actualité."
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
        <h3 className="text-lg font-bold text-primary border-t mt-2">
          {"Dates d'affichage dans le bandeau de la page d'accueil"}
        </h3>
        <p className="text-xs text-muted-foreground">
          {
            "Si vous souhaitez que votre actualité soit mise en avant dans le bandeau de la page d'accueil, vous pouvez définir une période d'affichage."
          }
        </p>
        <RHFInput
          name="displayStartDate"
          label="Date de début d'affichage dans le bandeau"
          type="date"
          popoverContent="Date à partir de laquelle l'actualité apparaîtra dans le bandeau de la page d'accueil à partir de cette date. Sinon, l'actualité n'apparaîtra pas dans le bandeau mais sera toujours accessible depuis la page dédiée aux actualités."
        />
        <RHFInput
          name="displayEndDate"
          label="Date de fin d'affichage dans le bandeau"
          type="date"
          placeholder="Sélectionnez une date"
          popoverContent="Si une date de début d'affichage est définie, vous devez définir une date de fin d'affichage pour indiquer jusqu'à quand l'actualité doit apparaître dans le bandeau de la page d'accueil. Passé cette date, l'actualité n'apparaîtra plus dans le bandeau mais sera toujours accessible depuis la page dédiée aux actualités."
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
