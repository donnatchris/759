'use client';

import { EditDialogButton } from '@/components/custom-ui/edit-dialog-button';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import {
  updateOpeningSlotsPresentation,
  type TPresentation,
  UpdatePresentationForm,
} from '@/features/presentation';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type Props = {
  presentation: TPresentation;
};

export function EditOpeningSlotsPresentationAdminButton({
  presentation,
}: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success("Textes des horaires d'ouverture mis à jour avec succès", {
      position: 'top-center',
    });
    router.refresh();
  };

  return (
    <EditDialogButton
      title="Modifier les textes des horaires"
      subTitle="Modifiez le titre, le sous-titre, le texte d'introduction et le texte affiché sous les horaires."
    >
      <UpdatePresentationForm
        values={presentation}
        updateAction={updateOpeningSlotsPresentation}
        onSuccess={onSuccess}
      />
    </EditDialogButton>
  );
}
