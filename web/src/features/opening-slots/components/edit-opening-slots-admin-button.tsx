'use client';

import { EditDialogButton } from '@/components/custom-ui/edit-dialog-button';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { OpeningSlot } from '../lib/opening-slots.types';
import { UpdateOpeningSlotsForm } from './update-opening-slots.form';

type Props = {
  openingSlots: OpeningSlot[];
};

export function EditOpeningSlotsAdminButton({ openingSlots }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success("Horaires d'ouverture mis à jour avec succès", {
      position: 'top-center',
    });
    router.refresh();
  };

  return (
    <EditDialogButton
      title="Modifier les horaires"
      subTitle="Définissez les jours et heures d'ouverture standards."
    >
      <UpdateOpeningSlotsForm values={openingSlots} onSuccess={onSuccess} />
    </EditDialogButton>
  );
}
