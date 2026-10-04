'use client';

import { isPrestationsEnabled } from '@/settings/settings.helpers';

import { DeleteButton } from '@/components/custom-ui/delete-button';
import { deleteServiceCategoryAction } from '@/features/services/lib/services.action';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';

type Props = {
  id: string;
};

export function DeleteServiceCategory({ id }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  if (!isPrestationsEnabled() || !isAdmin || !editMode) return null;

  return (
    <DeleteButton
      size="default"
      action={() => deleteServiceCategoryAction({ id })}
      confirmationTitle={`Supprimer la catégorie de service`}
      confirmationDescription="Cette action est irréversible et supprimera tous les services associés à cette catégorie."
    />
  );
}
