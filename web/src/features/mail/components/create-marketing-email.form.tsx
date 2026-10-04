'use client';

import { useEffect, useState } from 'react';
import { RHFPublicImageSelector } from '@/features/core/image/components/rhf-public-image-selector';
import { getPublicImages } from '@/features/core/image/lib/image.action';
import type { TPublicImage } from '@/features/core/image/lib/image.service';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { Button } from '@/components/ui/button';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import {
  createMarketingEmailSchema,
  type TCreateMarketingEmailInput,
  type TCreateMarketingEmailOutput,
} from '../lib/marketing-email.schema';
import { createMarketingEmailAction } from '../lib/marketing-email.action';
import type { TMarketingEmailListItem } from '../lib/marketing-email.types';

type Props = {
  onCreated?: (marketingEmail: TMarketingEmailListItem) => void;
};

const defaultValues: TCreateMarketingEmailInput = {
  subject: '',
  eyebrow: '',
  title: '',
  intro: '',
  content: '',
  note: '',
  imageUrl: '',
};

export function CreateMarketingEmailForm({ onCreated }: Props) {
  const [images, setImages] = useState<TPublicImage[]>([]);
  const [imagesError, setImagesError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchImages() {
      try {
        const response = await getPublicImages();
        if (!active) return;
        if (response.success) {
          setImages(response.data);
        } else {
          setImagesError('Impossible de charger les images disponibles.');
        }
      } catch {
        if (active)
          setImagesError('Impossible de charger les images disponibles.');
      }
    }
    void fetchImages();
    return () => {
      active = false;
    };
  }, []);

  const form = useForm<
    TCreateMarketingEmailInput,
    unknown,
    TCreateMarketingEmailOutput
  >({
    resolver: zodResolver(createMarketingEmailSchema),
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
  };

  const onSubmit = async (data: TCreateMarketingEmailOutput) => {
    const response = await createMarketingEmailAction(data);

    if (!response.success) {
      toast.error(getErrorMessageFromResponse(response), {
        position: 'top-center',
      });
      return;
    }

    resetAll();
    onCreated?.(response.data);
    toast.success(
      "L'email marketing est enregistré. Il sera envoyé dans la nuit aux utilisateurs concernés. Vous pouvez le retrouver et consulter son statut depuis l'onglet Historique.",
      {
        position: 'top-center',
      },
    );
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex max-w-3xl flex-col gap-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-primary">
              Nouvel email marketing
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Préparez le message qui sera envoyé aux contacts éligibles. Les
              emails seront envoyés dans la nuit aux utilisateurs qui ont
              accepté de recevoir les emails de marketing.
            </p>
          </div>
        </div>

        <RHFInput
          name="subject"
          label="Objet"
          required
          popoverContent="Objet visible dans la boîte mail des destinataires."
        />
        <RHFInput
          name="eyebrow"
          label="Surtitre"
          popoverContent="Court libellé affiché au-dessus du titre dans l'email"
        />
        <RHFInput
          name="title"
          label="Titre"
          required
          popoverContent="Titre principal affiché dans l'email."
        />
        <RHFInput
          name="intro"
          label="Introduction"
          type="textarea"
          popoverContent="Premier paragraphe du message."
        />
        <RHFInput
          name="content"
          label="Contenu"
          type="textarea"
          required
          popoverContent="Corps détaillé du message. Les retours à la ligne et sauts de ligne seront conservés dans l'email."
        />
        <RHFPublicImageSelector
          name="imageUrl"
          label="Image"
          images={images}
          allowEmpty
          emptyLabel="Aucune image"
          popoverContent="Image optionnelle affichée dans l'email. Sélectionnez une image de la bibliothèque du site."
        />
        {imagesError && (
          <p role="alert" className="text-sm text-destructive">
            {imagesError}
          </p>
        )}
        <RHFInput
          name="note"
          label="Note"
          type="textarea"
          popoverContent="Note optionnelle affichée dans un encadré sous le message."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="size-4" />
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={resetAll}
            disabled={isSubmitting}
          >
            <RotateCcw className="size-4" />
            Réinitialiser
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
