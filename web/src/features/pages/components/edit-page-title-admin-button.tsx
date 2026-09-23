'use client';

import { EditDialogButton } from '@/components/custom-ui/edit-dialog-button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { toast } from 'sonner';
import { TPageTitleOutputValues } from '../lib/page-title.schema';
import { UpdatePageTitleForm } from './update-page-title.form';

type Props = {
  pageTitle: TPageTitleOutputValues;
};

export function EditPageTitleAdminButton({ pageTitle }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success('Paramètres du site mis à jour avec succès', {
      position: 'top-center',
    });
    router.refresh();
  };

  return (
    <EditDialogButton
      title="Modifier l'intitulé de la page"
      subTitle="Modifiez l'intitulé et le sous-titre de la page pour personnaliser l'affichage de votre site."
    >
      <UpdatePageTitleForm values={pageTitle} onSuccess={onSuccess} />
    </EditDialogButton>
  );
}
