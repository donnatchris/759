'use client';

import { EditDialogButton } from '@/components/custom-ui/edit-dialog-button';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { TPageContentInputValues } from '../lib/page-title.schema';
import { UpdatePageContentForm } from './update-page-content.form';

type Props = {
  pageContent: TPageContentInputValues;
};

export function EditPageContentAdminButton({ pageContent }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success('Contenu de la page mis à jour avec succès', {
      position: 'top-center',
    });
    router.refresh();
  };

  return (
    <EditDialogButton
      title="Modifier le contenu de la page"
      subTitle="Modifiez uniquement le contenu Markdown affiché sur cette page."
    >
      <UpdatePageContentForm values={pageContent} onSuccess={onSuccess} />
    </EditDialogButton>
  );
}
