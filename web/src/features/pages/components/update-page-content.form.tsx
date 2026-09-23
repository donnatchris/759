'use client';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import {
  pageContentSchema,
  type TPageContentInputValues,
  type TPageContentOutputValues,
} from '@/features/pages/lib/page-title.schema';
import { RotateCcw, Save } from 'lucide-react';
import { updatePageContentAction } from '../lib/page-title.action';

type Props = {
  values?: TPageContentInputValues;
  onSuccess?: () => void;
  onClose?: () => void;
};

export function UpdatePageContentForm({ values, onSuccess, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const clearServerError = () => setServerError(null);

  const defaultValues = {
    slug: values?.slug ?? '',
    content: values?.content ?? '',
  };

  const form = useForm<
    TPageContentInputValues,
    unknown,
    TPageContentOutputValues
  >({
    resolver: zodResolver(pageContentSchema),
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

  const onSubmit = async (data: TPageContentOutputValues) => {
    try {
      clearServerError();
      const response = await updatePageContentAction(data);
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
          name="content"
          label="Contenu"
          type="textarea"
          popoverContent="Le contenu optionnel de la page, au format Markdown."
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
