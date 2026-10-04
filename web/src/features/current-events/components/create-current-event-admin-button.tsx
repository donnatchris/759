'use client';

import { isActualitesEnabled } from '@/settings/settings.helpers';

import { CreateDialogButton } from '@/components/custom-ui/create-dialog-button';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CreateCurrentEventForm } from './create-current-event.form';

export function CreateCurrentEventAdminButton() {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isActualitesEnabled() || !isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success('Actualité créée avec succès !', { position: 'top-center' });
    router.refresh();
  };

  return (
    <CreateDialogButton
      title="Créer une actualité"
      subTitle="Ajoutez une nouvelle actualité publiée sur la page Actualités."
    >
      <CreateCurrentEventForm onSuccess={onSuccess} />
    </CreateDialogButton>
  );
}
