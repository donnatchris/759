'use client';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  pageTitleSchema,
  type TPageTitleInputValues,
  type TPageTitleOutputValues,
} from '@/features/pages/lib/page-title.schema';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { Save, RotateCcw } from 'lucide-react';
import { updatePageTitleAction } from '../lib/page-title.action';

type Props = {
  values?: TPageTitleInputValues;
  onSuccess?: () => void;
  onClose?: () => void;
};

export function UpdatePageTitleForm({ values, onSuccess, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const clearServerError = () => setServerError(null);

  const defaultValues = {
    slug: values?.slug ?? '',
    title: values?.title ?? '',
    subTitle: values?.subTitle ?? '',
  };

  const form = useForm<TPageTitleInputValues, unknown, TPageTitleOutputValues>({
    resolver: zodResolver(pageTitleSchema),
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

  const onSubmit = async (data: TPageTitleOutputValues) => {
    try {
      clearServerError();
      const response = await updatePageTitleAction(data);
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
          required
          popoverContent="Le titre principal de la page, affiché en grand en haut de la page."
        />
        <RHFInput
          name="subTitle"
          label="Sous-titre"
          popoverContent="Le sous-titre de la page, optionnel, affiché en plus petit sous le titre principal."
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
