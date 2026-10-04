'use client';

import { isPrestationsEnabled } from '@/settings/settings.helpers';

import { EditDialogButton } from '@/components/custom-ui/edit-dialog-button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { toast } from 'sonner';
import { UpdateServiceCategoryForm } from './update-service-category.form';
import type { TServicesCategoryWithServicesAndRessources } from '../lib/services.types';

type Props = {
  category: TServicesCategoryWithServicesAndRessources;
};

export function EditOfferingSummaryAdminButton({ category }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isPrestationsEnabled() || !isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success('Catégorie de prestation mise à jour avec succès!', {
      position: 'top-center',
    });
    router.refresh();
  };

  return (
    <EditDialogButton
      title="Modifier la catégorie de prestation"
      subTitle="Modifiez les informations de la catégorie de prestation, telles que l'intitulé, la description ou l'image."
    >
      <UpdateServiceCategoryForm values={category} onSuccess={onSuccess} />
    </EditDialogButton>
  );
}
