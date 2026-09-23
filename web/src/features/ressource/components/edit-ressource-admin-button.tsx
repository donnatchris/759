'use client';

import { EditDialogButton } from '@/components/custom-ui/edit-dialog-button';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UpdateRessourceForm } from './update-ressource.form';
import type { Ressource } from '../lib/ressource.types';

type Props = {
  ressource: Ressource;
};

export function EditRessourceAdminButton({ ressource }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success('Ressource mise à jour avec succès !', {
      position: 'top-center',
    });
    router.refresh();
  };

  return (
    <EditDialogButton
      title="Modifier une ressource"
      subTitle="Modifiez les informations de cette ressource."
    >
      <UpdateRessourceForm values={ressource} onSuccess={onSuccess} />
    </EditDialogButton>
  );
}
