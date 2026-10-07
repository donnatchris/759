'use client';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MailPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { sendInvitationAction } from '../../invitation.action';

const schema = z.object({
  email: z.email({ error: 'Veuillez renseigner un email valide' }),
});

export function InviteUserForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });
  const onSubmit = async (data: z.infer<typeof schema>) => {
    setServerError(null);
    try {
      const response = await sendInvitationAction(data);
      if (!response.success) {
        if (form.getValues('email') === data.email) {
          setServerError(getErrorMessageFromResponse(response));
        }
        return;
      }
      toast.success(`Invitation envoyée à ${response.data.email}.`, {
        position: 'top-center',
      });
      form.reset();
    } catch {
      if (form.getValues('email') === data.email) {
        setServerError(
          'L’invitation n’a pas pu être envoyée. Veuillez réessayer.',
        );
      }
    }
  };
  return (
    <section className="mb-6 rounded-lg border bg-card p-4 sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <MailPlus className="size-5 text-primary" />
        Inviter un utilisateur
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Envoyez un lien personnel valable 48 heures. Un nouvel envoi remplace le
        lien précédent. Le destinataire choisira son mot de passe et ses
        préférences.
      </p>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onChange={() => setServerError(null)}
          className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end"
        >
          <div className="min-w-0 flex-1">
            <RHFInput
              name="email"
              label="Email du destinataire"
              type="email"
              required
            />
          </div>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            <MailPlus />
            {form.formState.isSubmitting ? 'Envoi...' : 'Envoyer l’invitation'}
          </Button>
        </form>
      </FormProvider>
      {serverError && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {serverError}
        </p>
      )}
    </section>
  );
}
