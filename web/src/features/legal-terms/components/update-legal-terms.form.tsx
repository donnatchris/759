'use client';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { RotateCcw, Save } from 'lucide-react';
import {
  createLegalTermsSchema,
  type TCreateLegalTermsInput,
  type TCreateLegalTermsOutput,
} from '../lib/legal-terms.schema';
import { createLegalTermsAction } from '../lib/legal-terms.action';

type Props = {
  values?: TCreateLegalTermsInput;
  onSuccess?: () => void;
  onClose?: () => void;
};

export function UpdateLegalTermsForm({ values, onSuccess, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const clearServerError = () => setServerError(null);

  const defaultValues = {
    content: values?.content ?? '',
  };

  const form = useForm<
    TCreateLegalTermsInput,
    unknown,
    TCreateLegalTermsOutput
  >({
    resolver: zodResolver(createLegalTermsSchema),
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

  const onSubmit = async (data: TCreateLegalTermsOutput) => {
    try {
      clearServerError();
      const response = await createLegalTermsAction(data);

      if (response.success) {
        reset(data);
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
          label="Contenu des CGU"
          type="textarea"
          required
          popoverContent="Le contenu est enregistré comme une nouvelle version des CGU. Vous pouvez utiliser du Markdown pour structurer les titres, listes et textes en gras: # devant les titres, ## devant les sous-titres, - pour les listes, **texte** pour le texte en gras."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={isSubmitting} className="rounded-xl">
            <Save size={16} className="mr-1 inline-block" />
            {isSubmitting ? 'Publication...' : 'Publier une nouvelle version'}
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
