'use client';

import { DeleteButton } from '@/components/custom-ui/delete-button';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { deleteRessourceAction } from '../lib/ressource.action';

type Props = {
  id: string;
};

export function DeleteRessource({ id }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();

  if (!isAdmin || !editMode) return null;

  return (
    <DeleteButton
      size="default"
      action={() => deleteRessourceAction({ id })}
      confirmationTitle="Supprimer la ressource"
      confirmationDescription="Cette action est irréversible. La suppression échouera si cette ressource est utilisée par une prestation ou une réservation existante."
    />
  );
}
