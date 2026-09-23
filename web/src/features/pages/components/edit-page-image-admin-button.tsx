'use client';

import { EditDialogButton } from '@/components/custom-ui/edit-dialog-button';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { TPageImageInputValues } from '../lib/page-title.schema';
import { UpdatePageImageForm } from './update-page-image.form';

type Props = {
  pageImage: TPageImageInputValues;
};

export function EditPageImageAdminButton({ pageImage }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success('Image de la page mise à jour avec succès', {
      position: 'top-center',
    });
    router.refresh();
  };

  return (
    <EditDialogButton
      title="Modifier l'image de la page"
      subTitle="Sélectionnez une image publique ou choisissez de ne pas afficher d'image."
    >
      <UpdatePageImageForm values={pageImage} onSuccess={onSuccess} />
    </EditDialogButton>
  );
}
