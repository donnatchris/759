'use client';

import {
  get,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { Label } from '@/components/ui/label';
import type { ReactNode } from 'react';

type Props<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label: ReactNode;
  description: ReactNode;
};

export function EmailPreferenceCheckbox<TFieldValues extends FieldValues>({
  name,
  label,
  description,
}: Props<TFieldValues>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TFieldValues>();
  const fieldError = get(errors, name) as { message?: string } | undefined;

  return (
    <div className="space-y-1">
      <div className="flex items-start gap-3 rounded-lg border border-border p-3">
        <input
          id={name}
          type="checkbox"
          {...register(name)}
          className="mt-1 h-4 w-4 accent-primary"
        />
        <div className="grid gap-1">
          <Label htmlFor={name} className="font-medium">
            {label}
          </Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {fieldError?.message && (
        <p className="text-sm text-destructive">{fieldError.message}</p>
      )}
    </div>
  );
}
