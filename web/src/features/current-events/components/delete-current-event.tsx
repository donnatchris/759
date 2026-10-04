'use client';

import { isActualitesEnabled } from '@/settings/settings.helpers';

import { DeleteButton } from '@/components/custom-ui/delete-button';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { deleteCurrentEventAction } from '../lib/current-events.action';

type Props = {
  id: string;
};

export function DeleteCurrentEvent({ id }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();

  if (!isActualitesEnabled() || !isAdmin || !editMode) return null;

  return (
    <DeleteButton
      size="default"
      action={() => deleteCurrentEventAction({ id })}
      confirmationTitle="Supprimer l'actualité"
      confirmationDescription="Cette action est irréversible et supprimera cette actualité de manière définitive."
    />
  );
}
