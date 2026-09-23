'use client';

import { EditDialogButton } from '@/components/custom-ui/edit-dialog-button';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { LegalTerms } from '../lib/legal-terms.types';
import { UpdateLegalTermsForm } from './update-legal-terms.form';

type Props = {
  legalTerms: Pick<LegalTerms, 'content'> | null;
};

export function EditLegalTermsAdminButton({ legalTerms }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success('Nouvelle version des CGU publiée avec succès', {
      position: 'top-center',
    });
    router.refresh();
  };

  return (
    <EditDialogButton
      title="Modifier les CGU"
      subTitle="Publiez une nouvelle version des conditions générales d'utilisation. L'ancienne version reste conservée en base de données."
    >
      <UpdateLegalTermsForm
        values={{ content: legalTerms?.content ?? '' }}
        onSuccess={onSuccess}
      />
    </EditDialogButton>
  );
}
