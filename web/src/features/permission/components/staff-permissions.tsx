'use client';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmailPreferenceCheckbox } from '@/features/auth/components/email-preference-checkbox';
import { useUser } from '@/features/auth/auth.context';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import {
  updateStaffPermissionsSchema,
  type TUpdateStaffPermissionsInput,
  type TUpdateStaffPermissionsOutput,
} from '../lib/permission.schema';
import { updateStaffPermissionsAction } from '../lib/permission.action';
import type { TPermissionUser } from '../lib/permission.types';

type Props = {
  permissionUser: TPermissionUser;
};

export function StaffPermissions({ permissionUser }: Props) {
  const { isAdmin } = useUser();
  const [permissions, setPermissions] = useState(permissionUser.permissions);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<
    TUpdateStaffPermissionsInput,
    unknown,
    TUpdateStaffPermissionsOutput
  >({
    resolver: zodResolver(updateStaffPermissionsSchema),
    defaultValues: {
      userId: permissionUser.id,
      canManageAppointments: permissions?.canManageAppointments ?? false,
      canManageUsers: permissions?.canManageUsers ?? false,
      canManageMarketingEmails: permissions?.canManageMarketingEmails ?? false,
    },
  });

  if (permissionUser.role === 'ADMIN') {
    return (
      <PermissionMessage>
        Cet utilisateur est administrateur. Il dispose de tous les droits, y
        compris celui de modifier les pages et les contenus du site.
      </PermissionMessage>
    );
  }

  if (permissionUser.role === 'USER') {
    return (
      <PermissionMessage>
        Cet utilisateur est un simple utilisateur. Il ne dispose d’aucun droit
        sur l’Espace Staff du site.
      </PermissionMessage>
    );
  }

  const onSubmit = async (data: TUpdateStaffPermissionsOutput) => {
    setServerError(null);
    const response = await updateStaffPermissionsAction(data);

    if (!response.success) {
      setServerError(getErrorMessageFromResponse(response));
      return;
    }

    setPermissions(response.data);
    form.reset({
      userId: response.data.userId,
      canManageAppointments: response.data.canManageAppointments,
      canManageUsers: response.data.canManageUsers,
      canManageMarketingEmails: response.data.canManageMarketingEmails,
    });
    toast.success('Permissions mises à jour.', { position: 'top-center' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-5" aria-hidden="true" />
          Permissions Staff
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!permissions && (
          <p className="text-sm text-muted-foreground">
            Cet utilisateur ne dispose d’aucune permission pour le moment.
          </p>
        )}

        {isAdmin ? (
          <FormProvider {...form}>
            <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
              <EmailPreferenceCheckbox<TUpdateStaffPermissionsInput>
                name="canManageAppointments"
                label="Gestion des rendez-vous"
                description="Prendre ou annuler des rendez-vous depuis l’Espace Staff."
              />
              <EmailPreferenceCheckbox<TUpdateStaffPermissionsInput>
                name="canManageUsers"
                label="Gestion des utilisateurs"
                description="Gérer les comptes utilisateurs : supprimer ou bannir des utilisateurs, modifier leurs rôles et leurs droits, à l’exception des permissions du staff."
              />
              <EmailPreferenceCheckbox<TUpdateStaffPermissionsInput>
                name="canManageMarketingEmails"
                label="Gestion des emails marketing"
                description="Créer, envoyer, modifier ou supprimer les emails marketing."
              />

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'Enregistrement...'
                  : 'Enregistrer les permissions'}
              </Button>
              {serverError && (
                <p className="text-sm text-destructive">{serverError}</p>
              )}
            </form>
          </FormProvider>
        ) : (
          permissions && <PermissionsSummary permissions={permissions} />
        )}
      </CardContent>
    </Card>
  );
}

function PermissionMessage({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-6 text-sm text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  );
}

function PermissionsSummary({
  permissions,
}: {
  permissions: NonNullable<TPermissionUser['permissions']>;
}) {
  const permissionItems = [
    ['Gestion des rendez-vous', permissions.canManageAppointments],
    ['Gestion des utilisateurs', permissions.canManageUsers],
    ['Gestion des emails marketing', permissions.canManageMarketingEmails],
  ] as const;

  return (
    <ul className="space-y-2 text-sm">
      {permissionItems.map(([label, enabled]) => (
        <li key={label} className="flex items-center justify-between gap-4">
          <span>{label}</span>
          <span className={enabled ? 'text-primary' : 'text-muted-foreground'}>
            {enabled ? 'Autorisé' : 'Non autorisé'}
          </span>
        </li>
      ))}
    </ul>
  );
}
