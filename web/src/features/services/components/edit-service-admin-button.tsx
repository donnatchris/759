'use client';

import { isPrestationsEnabled } from '@/settings/settings.helpers';

import { EditDialogButton } from '@/components/custom-ui/edit-dialog-button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { toast } from 'sonner';
import { UpdateServiceForm } from './update-service.form';
import type { TServiceWithRessources, Ressource } from '../lib/services.types';

type Props = {
  service: TServiceWithRessources;
  ressources: Ressource[];
};

export function EditServiceAdminButton({ service, ressources }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isPrestationsEnabled() || !isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success('Paramètres du site mis à jour avec succès', {
      position: 'top-center',
    });
    router.refresh();
  };

  return (
    <EditDialogButton
      title="Modifier la prestation"
      subTitle="Modifiez les informations de la prestation, comme son nom, sa description ou son prix."
    >
      <UpdateServiceForm
        values={service}
        ressources={ressources}
        onSuccess={onSuccess}
      />
    </EditDialogButton>
  );
}
