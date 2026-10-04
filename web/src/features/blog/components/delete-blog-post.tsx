'use client';

import { isBlogEnabled } from '@/settings/settings.helpers';

import { DeleteButton } from '@/components/custom-ui/delete-button';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { deleteBlogPostAction } from '../lib/blog.action';

type Props = {
  id: string;
};

export function DeleteBlogPost({ id }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();

  if (!isBlogEnabled() || !isAdmin || !editMode) return null;

  return (
    <DeleteButton
      size="default"
      action={() => deleteBlogPostAction({ id })}
      confirmationTitle="Supprimer l'article"
      confirmationDescription="Cette action est irréversible et supprimera cet article de manière définitive."
    />
  );
}
