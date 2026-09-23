'use client';

import { EditDialogButton } from '@/components/custom-ui/edit-dialog-button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { toast } from 'sonner';
import { UpdateSiteSettingsForm } from './update-site-settings.form';
import { SiteSettings } from '../lib/site-settings.types';

type Props = {
  siteSettings: SiteSettings;
};

export function EditSiteSettingsAdminButton({ siteSettings }: Props) {
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
      title="Modifier les paramètres du site"
      subTitle="Modifiez les informations principales du site, tels que le nom, les activités, le slogan, l'adresse, le téléphone ou l'email."
    >
      <UpdateSiteSettingsForm values={siteSettings} onSuccess={onSuccess} />
    </EditDialogButton>
  );
}
