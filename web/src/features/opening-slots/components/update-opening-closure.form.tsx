'use client';

import { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import {
  deleteOpeningClosureAction,
  updateOpeningClosureAction,
} from '../lib/opening-slots.action';
import {
  updateOpeningClosureSchema,
  type TUpdateOpeningClosureInput,
  type TUpdateOpeningClosureOutput,
} from '../lib/opening-slots.schema';
import type { TOpeningClosureCalendarEvent } from '../lib/opening-slots.types';

type Props = {
  values: TOpeningClosureCalendarEvent;
  onDeleted?: () => void;
  onSuccess?: () => void;
  onClose?: () => void;
};

export function UpdateOpeningClosureForm({
  values,
  onDeleted,
  onSuccess,
  onClose,
}: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const defaultValues = useMemo<TUpdateOpeningClosureInput>(
    () => ({
      originalStartDate: values.startDate,
      originalEndDate: values.endDate,
      startDate: values.startDate,
      endDate: values.endDate,
      label: values.label,
    }),
    [values],
  );

  const form = useForm<
    TUpdateOpeningClosureInput,
    unknown,
    TUpdateOpeningClosureOutput
  >({
    resolver: zodResolver(updateOpeningClosureSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const resetAll = () => {
    reset(defaultValues);
    setServerError(null);
    setDeleteConfirmOpen(false);
  };

  const onSubmit = async (data: TUpdateOpeningClosureOutput) => {
    try {
      setServerError(null);
      setDeleteConfirmOpen(false);

      const response = await updateOpeningClosureAction(data);

      if (!response.success) {
        setServerError(getErrorMessageFromResponse(response));
        return;
      }

      toast.success('La période de fermeture a bien été modifiée.', {
        position: 'top-center',
      });
      onSuccess?.();
      onClose?.();
    } catch {
      setServerError('Impossible de se connecter au serveur.');
    }
  };

  const deleteClosure = async () => {
    try {
      setIsDeleting(true);
      setServerError(null);

      const response = await deleteOpeningClosureAction({
        startDate: values.startDate,
        endDate: values.endDate,
      });

      if (!response.success) {
        setServerError(getErrorMessageFromResponse(response));
        return;
      }

      toast.success('La période de fermeture a bien été supprimée.', {
        position: 'top-center',
      });
      onDeleted?.();
      onClose?.();
    } catch {
      setServerError('Impossible de se connecter au serveur.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input type="hidden" {...register('originalStartDate')} />
        <input type="hidden" {...register('originalEndDate')} />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="opening-closure-edit-start-date">
              Date de début <span className="text-destructive">*</span>
            </Label>
            <Input
              id="opening-closure-edit-start-date"
              type="date"
              className="rounded-xl"
              {...register('startDate')}
            />
            {errors.startDate?.message && (
              <p className="text-sm text-destructive">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="opening-closure-edit-end-date">
              Date de fin <span className="text-destructive">*</span>
            </Label>
            <Input
              id="opening-closure-edit-end-date"
              type="date"
              className="rounded-xl"
              {...register('endDate')}
            />
            {errors.endDate?.message && (
              <p className="text-sm text-destructive">
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>

        <RHFInput<TUpdateOpeningClosureInput>
          name="label"
          label="Libellé"
          placeholder="Fermeture exceptionnelle"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="submit"
              disabled={isSubmitting || isDeleting}
              className="rounded-xl"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetAll}
              disabled={isSubmitting || isDeleting}
              className="rounded-xl"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Réinitialiser
            </Button>
          </div>

          {!deleteConfirmOpen && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={isSubmitting || isDeleting}
              className="rounded-xl"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Supprimer
            </Button>
          )}
        </div>

        {deleteConfirmOpen && (
          <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <div>
              <p className="text-sm font-semibold text-destructive">
                Supprimer la fermeture ?
              </p>
              <p className="text-sm text-muted-foreground">
                Cette action supprimera cette période de fermeture du
                calendrier.
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={isDeleting}
                className="rounded-xl"
              >
                Annuler
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => void deleteClosure()}
                disabled={isDeleting}
                className="rounded-xl"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {isDeleting ? 'Suppression...' : 'Confirmer'}
              </Button>
            </div>
          </div>
        )}

        {serverError && <p className="text-destructive">{serverError}</p>}
      </form>
    </FormProvider>
  );
}
