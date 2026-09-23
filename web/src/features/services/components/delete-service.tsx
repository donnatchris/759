'use client';

import { DeleteButton } from '@/components/custom-ui/delete-button';
import { deleteServiceAction } from '@/features/services/lib/services.action';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';

type Props = {
  id: string;
};

export function DeleteService({ id }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  if (!isAdmin || !editMode) return null;

  return (
    <DeleteButton
      size="default"
      action={() => deleteServiceAction({ id })}
      confirmationTitle={`Supprimer la prestation`}
      confirmationDescription="Cette action est irréversible et supprimera la prestation de manière définitive."
    />
  );
}
