'use client';

import { EditDialogButton } from '@/components/custom-ui/edit-dialog-button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { toast } from 'sonner';
import { UpdatePresentationForm } from './update-presentation.form';
import { TPresentation } from '../lib/presentation.types';

type Props = {
  presentation: TPresentation;
};

export function EditPresentationAdminButton({ presentation }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success('Présentation mise à jour avec succès!', {
      position: 'top-center',
    });
    router.refresh();
  };

  return (
    <EditDialogButton
      title="Modifier la présentation de l'entreprise ou association"
      subTitle="Modifiez la présentation de votre entreprise ou association pour mieux communiquer votre valeur ajoutée à vos clients."
    >
      <UpdatePresentationForm values={presentation} onSuccess={onSuccess} />
    </EditDialogButton>
  );
}
