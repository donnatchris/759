'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

type Props = {
  title: string;
  subTitle?: string;
  buttonLabel: React.ReactNode;
  buttonAriaLabel?: string;
  buttonSize?:
    | 'sm'
    | 'default'
    | 'xs'
    | 'lg'
    | 'icon'
    | 'icon-xs'
    | 'icon-sm'
    | 'icon-lg';
  buttonClassName?: string;
  buttonVariant?:
    | 'default'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'secondary'
    | 'destructive';
  children: React.ReactNode;
};

export function DialogButton({
  title,
  subTitle,
  buttonLabel,
  buttonAriaLabel,
  buttonSize = 'default',
  buttonVariant = 'default',
  buttonClassName = '',
  children,
}: Props) {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={buttonVariant}
          size={buttonSize}
          className={`text-xs hover:scale-105 transition-transform ${buttonClassName}`}
          aria-label={buttonAriaLabel}
        >
          {buttonLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-2xl lg:max-w-3xl shadow-xl shadow-primary/50 border border-primary/20 hover:border-primary/70">
        <div className="flex max-h-[90vh] flex-col">
          <DialogHeader className="shrink-0 px-6 pt-6">
            <DialogTitle>{title}</DialogTitle>
            {subTitle && <DialogDescription>{subTitle}</DialogDescription>}
          </DialogHeader>

          <div className="overflow-y-auto px-6 pb-6 pt-4">
            {React.isValidElement(children)
              ? React.cloneElement(
                  children as React.ReactElement<{ onClose: () => void }>,
                  {
                    onClose: () => setOpen(false),
                  },
                )
              : children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
