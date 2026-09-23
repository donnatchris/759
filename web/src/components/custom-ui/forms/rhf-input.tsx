'use client';

import { useState } from 'react';
import { useFormContext, get, Controller } from 'react-hook-form';
import type { FieldValues, FieldPath } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { PopoverIndicator } from '@/components/custom-ui/forms/popover-indicator';
import { RequiredFieldIndicator } from '@/components/custom-ui/forms/required-field-indicator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, EyeOff, Trash2 } from 'lucide-react';

type Props<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  type?: React.InputHTMLAttributes<HTMLInputElement>['type'];
  selectOptions?: { value: string; label: string }[];
  required?: boolean;
  popoverContent?: string;
  disableAutocomplete?: boolean;
};

export function RHFInput<TFieldValues extends FieldValues>({
  name,
  label,
  placeholder = '',
  type = 'text',
  selectOptions,
  required = false,
  popoverContent,
  disableAutocomplete = false,
}: Props<TFieldValues>) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<TFieldValues>();

  const fieldError = get(errors, name) as { message?: string } | undefined;
  const reg = register(name);

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const toDateInputValue = (value: unknown) => {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) return '';
      return formatDateForInput(value);
    }

    if (typeof value === 'string') {
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return '';
      return formatDateForInput(parsed);
    }

    return '';
  };

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const renderDefaultInput = () => (
    <div className="relative">
      <Input
        autoComplete={disableAutocomplete ? 'off' : undefined}
        id={name}
        type={inputType}
        placeholder={placeholder}
        {...reg}
        onChange={(e) => reg.onChange(e)}
        className={`${isPassword ? 'pr-10' : ''} rounded-xl`}
      />

      {isPassword && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={
            showPassword
              ? 'Masquer le mot de passe'
              : 'Afficher le mot de passe'
          }
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );

  const renderInput = () => {
    switch (type) {
      case 'select':
        if (selectOptions) {
          return (
            <Controller
              control={control}
              name={name}
              render={({ field }) => (
                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder={placeholder || label} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          );
        }
        return renderDefaultInput();
      case 'textarea':
        return (
          <Textarea
            id={name}
            placeholder={placeholder}
            {...reg}
            onChange={(e) => reg.onChange(e)}
            className="rounded-xl"
          />
        );
      case 'date':
        return (
          <Controller
            control={control}
            name={name}
            render={({ field }) => (
              <div className="flex  gap-2">
                <Input
                  autoComplete={disableAutocomplete ? 'off' : undefined}
                  id={name}
                  type="date"
                  value={toDateInputValue(field.value)}
                  onChange={(e) => field.onChange(e.target.valueAsDate ?? null)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  className="rounded-xl"
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => field.onChange('')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          />
        );
      case 'array':
        return (
          <Controller
            control={control}
            name={name}
            render={({ field }) => {
              const values = Array.isArray(field.value) ? field.value : [''];

              return (
                <div className="flex flex-col gap-2">
                  {values.map((value, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        value={value}
                        placeholder={placeholder}
                        className="rounded-xl"
                        onChange={(e) => {
                          const next = [...values];
                          next[index] = e.target.value;
                          field.onChange(next);
                        }}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          field.onChange(values.filter((_, i) => i !== index));
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => field.onChange([...values, ''])}
                  >
                    Ajouter un élément
                  </Button>
                </div>
              );
            }}
          />
        );
      default:
        return renderDefaultInput();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name} className="font-bold">
        {label}
        {required && <RequiredFieldIndicator />}
        {popoverContent && <PopoverIndicator text={popoverContent} />}
      </Label>
      {renderInput()}

      {fieldError?.message && (
        <p className="text-destructive">{fieldError.message}</p>
      )}
    </div>
  );
}
