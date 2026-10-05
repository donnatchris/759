import {
  isPrestationsEnabled,
  isBlogEnabled,
} from '@/settings/settings.helpers';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function MoreInfos() {
  if (!isPrestationsEnabled() && !isBlogEnabled()) return null;
  return (
    <section className="animate-fade-in-on-scroll px-4 py-10">
      <div className="mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-x-5 gap-y-3 border-y border-border px-5 py-4 text-primary sm:flex-nowrap">
        {isPrestationsEnabled() && (
          <Link
            href="/prestations"
            className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.12em] hover:text-accent sm:text-sm"
          >
            Réserver <ArrowUpRight className="size-4" />
          </Link>
        )}
        {isPrestationsEnabled() && isBlogEnabled() && (
          <span
            className="hidden h-5 w-px shrink-0 bg-border sm:block"
            aria-hidden="true"
          />
        )}
        {isBlogEnabled() && (
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.12em] hover:text-accent sm:text-sm"
          >
            Actualités du 7.59 <ArrowUpRight className="size-4" />
          </Link>
        )}
      </div>
    </section>
  );
}
