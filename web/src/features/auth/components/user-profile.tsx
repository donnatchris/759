'use client';

import { useState } from 'react';
import { Mail, Megaphone, Phone, Shield, Trash2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ConfirmToast } from '@/components/custom-ui/confirm-toast';
import { EditDialogButton } from '@/components/custom-ui/edit-dialog-button';
import { Button } from '@/components/ui/button';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { signOut } from '../auth-client';
import { deleteCurrentUserAccountAction } from '../auth.action';
import { useUser } from '../auth.context';
import { UpdateUserProfileForm } from './update-user-profile.form';

const roleLabels = {
  USER: 'Utilisateur',
  MEMBER: 'Membre',
  STAFF: 'Staff',
  ADMIN: 'Admin',
};

export function UserProfile() {
  const { user } = useUser();
  const router = useRouter();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  if (!user) return null;

  const onSuccess = () => {
    toast.success('Profil mis à jour avec succès', {
      position: 'top-center',
    });
    router.refresh();
  };

  const handleDeleteAccountClick = () => {
    if (isDeletingAccount) return;

    ConfirmToast({
      title: 'Supprimer votre compte ?',
      description:
        "Cette action supprime définitivement votre compte. Elle sera refusée si vous possédez une réservation à venir (dans ce cas annulez d'abord ces réservations). Vous serez automatiquement déconnecté après la suppression.",
      confirmText: 'Supprimer mon compte',
      cancelText: 'Annuler',
      onConfirm: async () => {
        setIsDeletingAccount(true);
        const response = await deleteCurrentUserAccountAction();

        if (!response.success) {
          setIsDeletingAccount(false);
          toast.error(getErrorMessageFromResponse(response), {
            position: 'top-center',
          });
          return;
        }

        try {
          await signOut();
        } catch {
          // The account is already deleted server-side; the redirect below clears the UI state.
        }

        toast.success('Votre compte a été supprimé.', {
          position: 'top-center',
        });
        router.push('/');
        router.refresh();
      },
    });
  };

  const marketingEmailsAccepted = user.canReceiveMarketingEmails ?? false;

  return (
    <section className="mx-auto w-full max-w-7xl rounded-xl border border-primary/20 bg-background/70 p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary">Mes informations</h2>
          <p className="text-sm text-muted-foreground">
            Coordonnées et préférences associées à votre compte.
          </p>
        </div>
        <EditDialogButton
          title="Modifier mes informations"
          subTitle="Modifiez votre nom ou votre numéro de téléphone."
          label="Modifier mes informations"
          buttonVariant="default"
        >
          <UpdateUserProfileForm
            values={{
              name: user.name ?? '',
              phone: user.phone ?? '',
              canReceiveMarketingEmails:
                user.canReceiveMarketingEmails ?? false,
            }}
            onSuccess={onSuccess}
          />
        </EditDialogButton>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <ProfileRow icon={<User className="h-4 w-4" />} label="Nom">
          {user.name}
        </ProfileRow>
        <ProfileRow icon={<Mail className="h-4 w-4" />} label="E-mail">
          {user.email}
        </ProfileRow>
        <ProfileRow icon={<Phone className="h-4 w-4" />} label="Téléphone">
          {user.phone?.trim() || 'Non renseigné'}
        </ProfileRow>
        <ProfileRow icon={<Shield className="h-4 w-4" />} label="Rôle">
          {roleLabels[user.role ?? 'USER']}
        </ProfileRow>
        <ProfileRow
          icon={<Megaphone className="h-4 w-4" />}
          label="Emails commerciaux"
        >
          {formatConsent(user.canReceiveMarketingEmails)}
        </ProfileRow>
      </div>

      {!marketingEmailsAccepted ? (
        <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <h3 className="font-semibold text-destructive">
            {`Vous n'avez pas accepté de recevoir des emails concernant les actualités et événements de notre organisation.`}
          </h3>
          <p className="text-sm text-muted-foreground">
            {`C'est dommage! Vous risquez de passer à côté d'informations importantes concernant nos événements et notre actualité.`}
          </p>
          <p className="text-sm text-destructive font-semibold">
            {`Vous risquez de passer à côté d'informations importantes concernant nos événements et notre actualité.`}
          </p>
          <p className="text-sm text-muted-foreground">
            {`Si vous souhaitez être tenu au courant, vous pouvez modifier cette préférence en cliquant sur le bouton "Modifier mes informations".`}
          </p>
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <h3 className="font-semibold text-primary">
            {`Vous avez accepté de recevoir des emails concernant les actualités et événements de notre organisation.`}
          </h3>
          <p className="text-sm text-muted-foreground">
            {`Vous serez tenu au courant des actualités et événements de notre organisation par email.`}
          </p>
          <p className="text-sm text-muted-foreground">
            {`Si vous souhaitez ne plus recevoir ces emails, vous pouvez modifier cette préférence en cliquant sur le bouton "Modifier mes informations".`}
          </p>
        </div>
      )}

      <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-destructive">
              Supprimer mon compte
            </h3>
            <p className="text-sm text-muted-foreground">
              Cette action est définitive et vous déconnectera automatiquement.
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeletingAccount}
            onClick={handleDeleteAccountClick}
          >
            <Trash2 className="h-4 w-4" />
            {isDeletingAccount ? 'Suppression...' : 'Supprimer mon compte'}
          </Button>
        </div>
      </div>
    </section>
  );
}

function formatConsent(value: boolean | null | undefined): string {
  return value ? 'Acceptés' : 'Refusés';
}

function ProfileRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2">
      <span className="text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-semibold">{children}</p>
      </div>
    </div>
  );
}
