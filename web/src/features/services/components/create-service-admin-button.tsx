'use client';

import { isPrestationsEnabled } from '@/settings/settings.helpers';

import { CreateDialogButton } from '@/components/custom-ui/create-dialog-button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { toast } from 'sonner';
import { CreateServiceForm } from './create-service.form';
import type { Ressource } from '../lib/services.types';

type Props = {
  serviceId: string;
  ressources: Ressource[];
};

export function CreateServiceAdminButton({ serviceId, ressources }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isPrestationsEnabled() || !isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success('Prestation créée avec succès!', {
      position: 'top-center',
    });
    router.refresh();
  };

  return (
    <CreateDialogButton
      title="Ajouter une prestation"
      subTitle="Ajoutez une prestation à cette catégorie de prestations."
    >
      <CreateServiceForm
        categoryId={serviceId}
        ressources={ressources}
        onSuccess={onSuccess}
      />
    </CreateDialogButton>
  );
}
