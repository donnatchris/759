'use client';

import { notifyCalendarEventsChanged } from '../lib/events-calendar-refresh';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { Save, RotateCcw } from 'lucide-react';
import {
  updateEventSchema,
  type TUpdateEventInput,
  type TUpdateEventOutput,
} from '../lib/events.schema';
import { editEventAction } from '../lib/events.action';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { getPublicImages } from '@/features/core/image/lib/image.action';
import { RHFPublicImageSelector } from '@/features/core';
import type { TPublicImage, TServerResponse } from '@/features/core';

type Props = {
  values: TUpdateEventOutput;
  onSuccess?: () => void;
  onClose?: () => void;
};

export function UpdateEventForm({ values, onSuccess, onClose }: Props) {
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

  const form = useForm<TUpdateEventInput, unknown, TUpdateEventOutput>({
    resolver: zodResolver(updateEventSchema),
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

  const onSubmit = async (data: TUpdateEventOutput) => {
    try {
      setServerError(null);
      const response = await editEventAction(data);
      if (!response.success) {
        setServerError(getErrorMessageFromResponse(response));
        return;
      }

      resetAll();
      notifyCalendarEventsChanged();
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
          popoverContent="Titre de l'événement (obligatoire)."
        />
        <RHFInput
          name="subTitle"
          label="Sous-titre"
          popoverContent="Sous-titre de l'événement (optionnel)."
        />
        <RHFInput
          name="tag"
          label="Tag"
          placeholder="Ex: Promotion, Offre spéciale, Événement, etc."
          popoverContent="Tag de l'événement (optionnel). Permet de catégoriser les événements et d'afficher un badge dans la liste des événements. Par exemple : 'Promotion', 'Offre spéciale', 'Événement à venir', etc."
        />
        <RHFInput
          name="author"
          label="Auteur"
          popoverContent="Auteur de l'événement (optionnel)."
        />
        <RHFInput
          name="content"
          label="Contenu"
          type="textarea"
          required
          popoverContent="Contenu détaillé de l'événement (obligatoire)."
        />
        <RHFPublicImageSelector
          name="imageUrl"
          label="Image"
          images={images}
          popoverContent="Image associée à l'événement (optionnelle)."
        />
        <RHFInput
          name="links"
          label="Liens"
          type="array"
          placeholder="https://..."
          popoverContent="Ajoutez des liens (optionnel) qui seront affichés sous le contenu de l'événement. Par exemple, un lien vers une page de votre site ou vers un réseau social."
        />
        <h3 className="text-lg font-bold text-primary border-t mt-2">
          {"Dates de l'événement"}
        </h3>
        <p className="text-xs text-muted-foreground">
          {
            'La date et l’heure de début placent l’événement dans le calendrier public, uniquement au jour de son début. La date et l’heure de fin sont facultatives. Les horaires sont ceux de Paris.'
          }
        </p>
        <RHFInput
          name="eventStartDate"
          label="Date et heure de début de l'événement"
          type="datetime-local"
          required
          popoverContent="Date et heure de début obligatoires (heure de Paris). L’événement sera visible dans les calendriers et sur la page d’accueil."
        />
        <RHFInput
          name="eventEndDate"
          label="Date et heure de fin de l'événement"
          type="datetime-local"
          popoverContent="Date et heure de fin de l'événement (optionnel)."
        />
        <h3 className="text-lg font-bold text-primary border-t mt-2">
          {"Dates d'affichage dans le bandeau de la page d'accueil"}
        </h3>
        <p className="text-xs text-muted-foreground">
          {
            "Si vous souhaitez que votre événement soit mis en avant dans le bandeau de la page d'accueil, vous pouvez définir une période d'affichage."
          }
        </p>
        <RHFInput
          name="displayStartDate"
          label="Date de début d'affichage dans le bandeau"
          type="date"
          popoverContent="Date à partir de laquelle l'événement apparaîtra dans le bandeau de la page d'accueil à partir de cette date. Sinon, l'événement n'apparaîtra pas dans le bandeau mais sera toujours accessible depuis la page dédiée aux événements."
        />
        <RHFInput
          name="displayEndDate"
          label="Date de fin d'affichage dans le bandeau"
          type="date"
          placeholder="Sélectionnez une date"
          popoverContent="Si une date de début d'affichage est définie, vous devez définir une date de fin d'affichage pour indiquer jusqu'à quand l'événement doit apparaître dans le bandeau de la page d'accueil. Passé cette date, l'événement n'apparaîtra plus dans le bandeau mais sera toujours accessible depuis la page dédiée aux événements."
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
