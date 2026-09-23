'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CalendarDays, Utensils } from 'lucide-react';

type Props = {
  destination?: 'menu' | 'reservations';
};

export function CTAButton({ destination = 'reservations' }: Props) {
  const router = useRouter();
  const isMenuDestination = destination === 'menu';

  return (
    <Button
      variant="none"
      className="
        relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-sm
        border border-white/15 bg-heritage-red px-5 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-heritage-paper
        shadow-md
        transition-all duration-300
        motion-safe:hover:-translate-y-1 hover:bg-accent/90
      "
      onClick={() => router.push(isMenuDestination ? '/menu' : '/prestations')}
    >
      {isMenuDestination ? <Utensils /> : <CalendarDays />}
      <span>{isMenuDestination ? 'À la table' : 'Participer'}</span>
    </Button>
  );
}
