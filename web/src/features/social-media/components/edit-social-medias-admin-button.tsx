'use client';

import { EditDialogButton } from '@/components/custom-ui/edit-dialog-button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { toast } from 'sonner';
import { UpdateSocialMediasForm } from './update-social-media.form';
import { type SocialMedia } from '../lib/social-media.types';

type Props = {
  socialMedias: SocialMedia[];
};

export function EditSocialMediasAdminButton({ socialMedias }: Props) {
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
      title="Modifier les réseaux sociaux"
      subTitle="Modifiez les liens vers les réseaux sociaux de votre site. Vous pouvez ajouter ou supprimer des liens pour chaque réseau social disponible."
    >
      <UpdateSocialMediasForm values={socialMedias} onSuccess={onSuccess} />
    </EditDialogButton>
  );
}
