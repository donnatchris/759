'use client';

import { DeleteButton } from '@/components/custom-ui/delete-button';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { deleteDishCategoryAction } from '../lib/dishes.action';

type Props = {
  id: string;
};

export function DeleteDishCategory({ id }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  if (!isAdmin || !editMode) return null;

  return (
    <DeleteButton
      size="default"
      action={() => deleteDishCategoryAction({ id })}
      confirmationTitle="Supprimer la catégorie de plats"
      confirmationDescription="Cette action est irréversible et supprimera tous les plats associés à cette catégorie."
    />
  );
}
