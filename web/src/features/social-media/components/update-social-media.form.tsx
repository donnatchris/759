'use client';

import { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  socialMediaFormSchema,
  type TUpdateSocialMediaInput,
  type TUpdateSocialMediaOutput,
} from '../lib/social-media.schema';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { Save, RotateCcw } from 'lucide-react';
import { updateAllSocialMediasAction } from '../lib/social-media.action';
import {
  SOCIAL_MEDIA_TYPES,
  type SocialMedia,
} from '../lib/social-media.types';

type Props = {
  values?: SocialMedia[];
  onSuccess?: () => void;
  onClose?: () => void;
};

export function UpdateSocialMediasForm({ values, onSuccess, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);

  const clearServerError = () => setServerError(null);

  const defaultValues = useMemo(
    () => getSocialMediaDefaultValues(values),
    [values],
  );

  const form = useForm<
    TUpdateSocialMediaInput,
    unknown,
    TUpdateSocialMediaOutput
  >({
    resolver: zodResolver(socialMediaFormSchema),
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

  const onSubmit = async (data: TUpdateSocialMediaOutput) => {
    try {
      clearServerError();

      const response = await updateAllSocialMediasAction(data);

      if (response.success) {
        reset(defaultValues);
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
        {SOCIAL_MEDIA_TYPES.map((type, index) => (
          <div key={type} className="flex flex-col gap-2 rounded-lg border p-4">
            <p className="text-sm font-medium">{type}</p>

            <input
              type="hidden"
              {...form.register(`socialMedias.${index}.id`)}
            />

            <RHFInput
              name={`socialMedias.${index}.url`}
              label="URL"
              popoverContent={`L'URL de votre page ${type}. Assurez-vous d'inclure le protocole (http:// ou https://) au début de l'URL. Si vous ne souhaitez pas afficher ce réseau social, laissez ce champ vide.`}
            />

            <RHFInput
              name={`socialMedias.${index}.name`}
              label="Nom affiché (optionnel)"
              popoverContent="Le nom affiché pour ce réseau social, optionnel. Si laissé vide, seul l'icône du réseau social sera affichée."
            />
          </div>
        ))}

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

function getSocialMediaDefaultValues(
  values?: SocialMedia[],
): TUpdateSocialMediaInput {
  return {
    socialMedias: SOCIAL_MEDIA_TYPES.map((type) => {
      const existing = values?.find((item) => item.id === type);

      return {
        id: type,
        name: existing?.name ?? '',
        url: existing?.url ?? '',
      };
    }),
  };
}
