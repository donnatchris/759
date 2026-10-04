'use client';

import { isBlogEnabled } from '@/settings/settings.helpers';

import { CreateDialogButton } from '@/components/custom-ui/create-dialog-button';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CreateBlogPostForm } from './create-blog-post.form';

export function CreateBlogPostAdminButton() {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isBlogEnabled() || !isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success('Article créé avec succès !', { position: 'top-center' });
    router.refresh();
  };

  return (
    <CreateDialogButton
      title="Créer un article"
      subTitle="Ajoutez un nouvel article publié sur le Blog."
    >
      <CreateBlogPostForm onSuccess={onSuccess} />
    </CreateDialogButton>
  );
}
