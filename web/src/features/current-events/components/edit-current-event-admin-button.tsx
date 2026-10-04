'use client';

import { isActualitesEnabled } from '@/settings/settings.helpers';

import { EditDialogButton } from '@/components/custom-ui/edit-dialog-button';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UpdateCurrentEventForm } from './update-current-event.form';
import type { CurrentEvent } from '../lib/current-events.types';

type Props = {
  currentEvent: CurrentEvent;
};

export function EditCurrentEventAdminButton({ currentEvent }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isActualitesEnabled() || !isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success('Actualité mise à jour avec succès !', {
      position: 'top-center',
    });
    router.refresh();
  };

  return (
    <EditDialogButton
      title="Modifier une actualité"
      subTitle="Modifiez les informations de cette actualité."
    >
      <UpdateCurrentEventForm values={currentEvent} onSuccess={onSuccess} />
    </EditDialogButton>
  );
}
