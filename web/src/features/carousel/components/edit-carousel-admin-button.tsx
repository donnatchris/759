'use client';

import { EditDialogButton } from '@/components/custom-ui/edit-dialog-button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { toast } from 'sonner';
import { UpdateCarouselForm } from './update-carousel.form';
import { type CarouselImage } from '../lib/carousel.types';

type Props = {
  images: CarouselImage[];
};

export function EditCarouselAdminButton({ images }: Props) {
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
      title="Modifier le carousel"
      subTitle="Modifiez la sélection d'images affichées sur la page d'accueil"
    >
      <UpdateCarouselForm carouselImages={images} onSuccess={onSuccess} />
    </EditDialogButton>
  );
}
