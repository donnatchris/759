'use client';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { Save, RotateCcw } from 'lucide-react';
import type { TServerResponse } from '@/features/core/server/server.response';
import {
  updatePresentationSchema,
  type TUpdatePresentationInput,
  type TUpdatePresentationOutput,
} from '../lib/presentation.schema';
import type { TPresentation } from '../lib/presentation.types';
import { updatePresentation } from '../lib/presentation.action';

type Props = {
  values?: TUpdatePresentationOutput;
  onSuccess?: () => void;
  onClose?: () => void;
  updateAction?: (
    data: TUpdatePresentationOutput,
  ) => Promise<TServerResponse<TPresentation>>;
};

export function UpdatePresentationForm({
  values,
  onSuccess,
  onClose,
  updateAction = updatePresentation,
}: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const clearServerError = () => setServerError(null);

  const defaultValues = {
    title: values?.title ?? '',
    subTitle: values?.subTitle ?? '',
    content: values?.content ?? '',
    footer: values?.footer ?? '',
  };

  const form = useForm<
    TUpdatePresentationInput,
    unknown,
    TUpdatePresentationOutput
  >({
    resolver: zodResolver(updatePresentationSchema),
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

  const onSubmit = async (data: TUpdatePresentationOutput) => {
    try {
      clearServerError();
      const response = await updateAction(data);
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
          name="title"
          label="Titre"
          placeholder="Votre titre ici"
          popoverContent="Le titre principal de votre présentation."
        />

        <RHFInput
          name="subTitle"
          label="Sous-titre"
          placeholder="Votre sous-titre ici"
          popoverContent="Un court texte d'accroche pour compléter votre titre."
        />

        <RHFInput
          name="content"
          label="Contenu"
          placeholder="Votre contenu ici"
          popoverContent="Le texte de présentation de votre établissement. Vous pouvez utiliser des sauts de ligne pour structurer votre texte."
          type="textarea"
        />

        <RHFInput
          name="footer"
          label="Pied de section"
          placeholder="Votre texte de conclusion ici"
          popoverContent="Un court texte affiché après le contenu de présentation."
          type="textarea"
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
