'use client';

import { isEventsEnabled } from '@/settings/settings.helpers';

import { CreateDialogButton } from '@/components/custom-ui/create-dialog-button';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CreateEventForm } from './create-event.form';

export function CreateEventAdminButton() {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isEventsEnabled() || !isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success('Événement créé avec succès !', { position: 'top-center' });
    router.refresh();
  };

  return (
    <CreateDialogButton
      title="Créer un événement"
      subTitle="Ajoutez un nouvel événement."
    >
      <CreateEventForm onSuccess={onSuccess} />
    </CreateDialogButton>
  );
}
