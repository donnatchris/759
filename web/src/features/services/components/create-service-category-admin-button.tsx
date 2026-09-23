'use client';

import { CreateDialogButton } from '@/components/custom-ui/create-dialog-button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { toast } from 'sonner';
import { CreateServiceCategoryForm } from './create-service-category.form';

export function CreateServiceCategoryAdminButton() {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success('Catégorie de prestation créée avec succès!', {
      position: 'top-center',
    });
    router.refresh();
  };

  return (
    <CreateDialogButton
      title="Créer une catégorie de prestation"
      subTitle="Créez une nouvelle catégorie de prestation pour organiser vos prestations."
    >
      <CreateServiceCategoryForm onSuccess={onSuccess} />
    </CreateDialogButton>
  );
}
