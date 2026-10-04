'use client';

import { isEventsEnabled } from '@/settings/settings.helpers';

import { DeleteButton } from '@/components/custom-ui/delete-button';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { notifyCalendarEventsChanged } from '../lib/events-calendar-refresh';
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
      action={async () => {
        const response = await deleteEventAction({ id });
        if (response.success) notifyCalendarEventsChanged();
        return response;
      }}
      confirmationTitle="Supprimer l'événement"
      confirmationDescription="Cette action est irréversible et supprimera cet événement de manière définitive."
    />
  );
}
