'use client';

import { isBlogEnabled } from '@/settings/settings.helpers';

import { EditDialogButton } from '@/components/custom-ui/edit-dialog-button';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UpdateBlogPostForm } from './update-blog-post.form';
import type { BlogPost } from '../lib/blog.types';

type Props = {
  blogPost: BlogPost;
};

export function EditBlogPostAdminButton({ blogPost }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isBlogEnabled() || !isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success('Article mis à jour avec succès !', {
      position: 'top-center',
    });
    router.refresh();
  };

  return (
    <EditDialogButton
      title="Modifier un article"
      subTitle="Modifiez les informations de cet article."
    >
      <UpdateBlogPostForm values={blogPost} onSuccess={onSuccess} />
    </EditDialogButton>
  );
}
