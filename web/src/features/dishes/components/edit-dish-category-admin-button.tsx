'use client';

import { isMenuEnabled } from '@/settings/settings.helpers';

import { EditDialogButton } from '@/components/custom-ui/edit-dialog-button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { toast } from 'sonner';
import type { TDishCategoryWithDishes } from '../lib/dishes.types';
import { UpdateDishCategoryForm } from './update-dish-category.form';

type Props = {
  category: TDishCategoryWithDishes;
};

export function EditDishCategoryAdminButton({ category }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isMenuEnabled() || !isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success('Catégorie de plats mise à jour avec succès !', {
      position: 'top-center',
    });
    router.refresh();
  };

  return (
    <EditDialogButton
      title="Modifier la catégorie de plats"
      subTitle="Modifiez les informations de la catégorie, comme son intitulé, sa description ou son image."
    >
      <UpdateDishCategoryForm values={category} onSuccess={onSuccess} />
    </EditDialogButton>
  );
}
