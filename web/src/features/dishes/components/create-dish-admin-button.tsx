'use client';

import { isMenuEnabled } from '@/settings/settings.helpers';

import { CreateDialogButton } from '@/components/custom-ui/create-dialog-button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { toast } from 'sonner';
import { CreateDishForm } from './create-dish.form';

type Props = {
  categoryId: string;
};

export function CreateDishAdminButton({ categoryId }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isMenuEnabled() || !isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success('Plat créé avec succès !', { position: 'top-center' });
    router.refresh();
  };

  return (
    <CreateDialogButton
      title="Ajouter un plat"
      subTitle="Ajoutez un plat à cette catégorie du menu."
    >
      <CreateDishForm categoryId={categoryId} onSuccess={onSuccess} />
    </CreateDialogButton>
  );
}
