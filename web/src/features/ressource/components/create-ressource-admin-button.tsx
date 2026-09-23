'use client';

import { CreateDialogButton } from '@/components/custom-ui/create-dialog-button';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CreateRessourceForm } from './create-ressource.form';

export function CreateRessourceAdminButton() {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success('Ressource créée avec succès !', {
      position: 'top-center',
    });
    router.refresh();
  };

  return (
    <CreateDialogButton
      title="Créer une ressource"
      subTitle="Ajoutez une nouvelle ressource réservable."
    >
      <CreateRessourceForm onSuccess={onSuccess} />
    </CreateDialogButton>
  );
}
