'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CalendarDays, type LucideIcon } from 'lucide-react';
import { type VariantProps } from 'class-variance-authority';

type Props = {
  label?: string;
  Icon?: LucideIcon;
  destination?: string;
  buttonVariant?: VariantProps<typeof Button>['variant'];
};

export function CTAButton({
  label = 'Voir les Événements à venir',
  Icon = CalendarDays,
  destination = 'evenements',
  buttonVariant = 'hero',
}: Props) {
  const router = useRouter();

  return (
    <Button variant={buttonVariant} onClick={() => router.push(destination)}>
      <Icon />
      <span>{label}</span>
    </Button>
  );
}
