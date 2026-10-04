'use client';

import { isMenuEnabled } from '@/settings/settings.helpers';

import { EditDialogButton } from '@/components/custom-ui/edit-dialog-button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { toast } from 'sonner';
import type { Dish } from '../lib/dishes.types';
import { UpdateDishForm } from './update-dish.form';

type Props = {
  dish: Dish;
};

export function EditDishAdminButton({ dish }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isMenuEnabled() || !isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success('Plat mis à jour avec succès !', { position: 'top-center' });
    router.refresh();
  };

  return (
    <EditDialogButton
      title="Modifier le plat"
      subTitle="Modifiez les informations du plat, comme son nom, sa description, son prix ou son image."
    >
      <UpdateDishForm values={dish} onSuccess={onSuccess} />
    </EditDialogButton>
  );
}
