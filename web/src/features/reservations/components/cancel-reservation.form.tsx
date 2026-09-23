'use client';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import {
  cancelAdminReservationAction,
  cancelCurrentUserReservationAction,
} from '../lib/reservations.action';
import {
  cancelReservationSchema,
  type TCancelReservationInput,
  type TCancelReservationOutput,
} from '../lib/reservations.schema';
import type { TReservationDetails } from '../lib/reservations.types';

type Props = {
  reservationId: string;
  mode?: 'admin' | 'user';
  onSuccess?: (reservation: TReservationDetails) => void;
  onClose?: () => void;
};

export function CancelReservationForm({
  reservationId,
  mode = 'user',
  onSuccess,
  onClose,
}: Props) {
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultValues: TCancelReservationInput = {
    id: reservationId,
    cancellationMessage: '',
  };

  const form = useForm<
    TCancelReservationInput,
    unknown,
    TCancelReservationOutput
  >({
    resolver: zodResolver(cancelReservationSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const resetAll = () => {
    reset(defaultValues);
    setServerError(null);
  };

  const onSubmit = async (data: TCancelReservationOutput) => {
    try {
      setServerError(null);
      const response =
        mode === 'admin'
          ? await cancelAdminReservationAction(data)
          : await cancelCurrentUserReservationAction(data);

      if (!response.success) {
        setServerError(getErrorMessageFromResponse(response));
        return;
      }

      resetAll();
      onClose?.();
      onSuccess?.(response.data);
    } catch {
      setServerError('Impossible de se connecter au serveur.');
    }
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
      >
        <input type="hidden" {...form.register('id')} />
        <div>
          <h3 className="font-semibold text-destructive">
            Annuler cette réservation
          </h3>
          <p className="text-sm text-muted-foreground">
            Confirmez l&apos;annulation et indiquez un court message pour
            {mode === 'admin' ? ' le client.' : " l'admin."}
          </p>
        </div>

        <RHFInput<TCancelReservationInput>
          name="cancellationMessage"
          label="Motif d'annulation"
          type="textarea"
          required
          popoverContent={
            mode === 'admin'
              ? "Ce message sera conservé dans les notes d'annulation de la réservation."
              : "Ce message sera visible par l'admin dans les notes de la réservation."
          }
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" variant="destructive" disabled={isSubmitting}>
            <XCircle className="h-4 w-4" />
            {isSubmitting ? 'Annulation...' : 'Confirmer l’annulation'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={resetAll}
            disabled={isSubmitting}
          >
            <RotateCcw className="h-4 w-4" />
            Réinitialiser
          </Button>
        </div>

        {serverError && <p className="text-destructive">{serverError}</p>}
      </form>
    </FormProvider>
  );
}
