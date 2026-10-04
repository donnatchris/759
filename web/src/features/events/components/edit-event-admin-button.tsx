'use client';

import { isEventsEnabled } from '@/settings/settings.helpers';

import { EditDialogButton } from '@/components/custom-ui/edit-dialog-button';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UpdateEventForm } from './update-event.form';
import type { Event } from '../lib/events.types';

type Props = {
  event: Event;
};

export function EditEventAdminButton({ event }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isEventsEnabled() || !isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success('Événement mis à jour avec succès !', {
      position: 'top-center',
    });
    router.refresh();
  };

  return (
    <EditDialogButton
      title="Modifier un événement"
      subTitle="Modifiez les informations de cet événement."
    >
      <UpdateEventForm values={event} onSuccess={onSuccess} />
    </EditDialogButton>
  );
}
