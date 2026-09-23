import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CurrentEvent } from '../lib/current-events.types';
import { CurrentEventCard } from './current-event-card';

type Props = {
  currentEvent: CurrentEvent | null;
};

export function LatestCurrentEvent({ currentEvent }: Props) {
  if (!currentEvent) return null;

  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="container mx-auto max-w-6xl animate-fade-in-on-scroll">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker mb-4">La vie du 7.59</p>
            <h2 className="section-title">Prochain rendez-vous</h2>
          </div>

          <Button asChild variant="outline" size="lg">
            <Link href="/actualites">
              Voir tous les rendez-vous
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <CurrentEventCard currentEvent={currentEvent} />
      </div>
    </section>
  );
}
