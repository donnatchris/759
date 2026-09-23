'use client';

import { CreateDialogButton } from '@/components/custom-ui/create-dialog-button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { toast } from 'sonner';
import { CreateDishCategoryForm } from './create-dish-category.form';

export function CreateDishCategoryAdminButton() {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success('Catégorie de plats créée avec succès !', {
      position: 'top-center',
    });
    router.refresh();
  };

  return (
    <CreateDialogButton
      title="Créer une catégorie de plats"
      subTitle="Créez une nouvelle catégorie pour organiser les plats du menu."
    >
      <CreateDishCategoryForm onSuccess={onSuccess} />
    </CreateDialogButton>
  );
}
