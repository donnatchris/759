'use client';

import type { TPublicImage } from '../lib/image.service';
import { useFormContext, get, Controller, useWatch } from 'react-hook-form';
import type { FieldValues, FieldPath } from 'react-hook-form';
import Image from 'next/image';
import { Check, ChevronsUpDown, ImageOff } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { PopoverIndicator } from '@/components/custom-ui/forms/popover-indicator';
import { RequiredFieldIndicator } from '@/components/custom-ui/forms/required-field-indicator';

type Props<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  required?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
  popoverContent?: string;
  images: TPublicImage[];
};

export function RHFPublicImageSelector<TFieldValues extends FieldValues>({
  name,
  label,
  placeholder = 'Sélectionner une image',
  required = false,
  allowEmpty = false,
  emptyLabel = 'Aucune image',
  popoverContent,
  images,
}: Props<TFieldValues>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<TFieldValues>();

  const fieldError = get(errors, name) as { message?: string } | undefined;

  const selectedImageUrl = useWatch({
    control,
    name,
  }) as string | undefined;

  const selectedImage = images.find((image) => image.url === selectedImageUrl);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name} className="font-bold">
        {label}
        {required && <RequiredFieldIndicator />}
        {popoverContent && <PopoverIndicator text={popoverContent} />}
      </Label>

      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                className="h-auto min-h-11 w-full justify-between rounded-xl px-3 py-2"
              >
                {selectedImage ? (
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                      <Image
                        src={selectedImage.url}
                        alt={selectedImage.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>

                    <span className="min-w-0 truncate text-left">
                      {selectedImage.name}
                    </span>
                  </div>
                ) : allowEmpty && selectedImageUrl === '' ? (
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-muted">
                      <ImageOff className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <span className="min-w-0 truncate text-left">
                      {emptyLabel}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}

                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent
              align="start"
              sideOffset={4}
              className="z-[100] w-[var(--radix-popover-trigger-width)] overflow-hidden p-0"
            >
              <div
                className="max-h-80 overflow-y-auto overscroll-contain p-1"
                onWheel={(event) => event.stopPropagation()}
                onTouchMove={(event) => event.stopPropagation()}
              >
                {images.length === 0 && !allowEmpty ? (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    Aucune image disponible.
                  </p>
                ) : (
                  <>
                    {allowEmpty && (
                      <button
                        type="button"
                        onClick={() => field.onChange('')}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                          selectedImageUrl === '' &&
                            'bg-accent text-accent-foreground',
                        )}
                      >
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border bg-muted">
                          <ImageOff className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{emptyLabel}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            Ne pas afficher d&apos;image.
                          </p>
                        </div>

                        <Check
                          className={cn(
                            'h-4 w-4 shrink-0',
                            selectedImageUrl === ''
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                      </button>
                    )}
                    {images.map((image) => {
                      const isSelected = selectedImageUrl === image.url;

                      return (
                        <button
                          key={image.url}
                          type="button"
                          onClick={() => field.onChange(image.url)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                            isSelected && 'bg-accent text-accent-foreground',
                          )}
                        >
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                            {image.url && (
                              <Image
                                src={image.url}
                                alt={image.name}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{image.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {image.url}
                            </p>
                          </div>

                          <Check
                            className={cn(
                              'h-4 w-4 shrink-0',
                              isSelected ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      />

      {fieldError?.message && (
        <p className="text-sm text-destructive">{fieldError.message}</p>
      )}
    </div>
  );
}
