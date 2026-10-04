'use client';

import { isMenuEnabled } from '@/settings/settings.helpers';

import { DeleteButton } from '@/components/custom-ui/delete-button';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { deleteDishAction } from '../lib/dishes.action';

type Props = {
  id: string;
};

export function DeleteDish({ id }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  if (!isMenuEnabled() || !isAdmin || !editMode) return null;

  return (
    <DeleteButton
      size="default"
      action={() => deleteDishAction({ id })}
      confirmationTitle="Supprimer le plat"
      confirmationDescription="Cette action est irréversible et supprimera le plat de manière définitive."
    />
  );
}
