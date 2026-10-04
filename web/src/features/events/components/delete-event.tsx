'use client';

import { isEventsEnabled } from '@/settings/settings.helpers';

import { DeleteButton } from '@/components/custom-ui/delete-button';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { deleteEventAction } from '../lib/events.action';

type Props = {
  id: string;
};

export function DeleteEvent({ id }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();

  if (!isEventsEnabled() || !isAdmin || !editMode) return null;

  return (
    <DeleteButton
      size="default"
      action={() => deleteEventAction({ id })}
      confirmationTitle="Supprimer l'événement"
      confirmationDescription="Cette action est irréversible et supprimera cet événement de manière définitive."
    />
  );
}
