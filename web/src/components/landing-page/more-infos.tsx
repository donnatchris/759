import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function MoreInfos() {
  return (
    <section className="animate-fade-in-on-scroll px-4 py-10">
      <div className="mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-x-5 gap-y-3 border-y border-border px-5 py-4 text-primary sm:flex-nowrap">
        <Link
          href="/prestations"
          className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.12em] hover:text-accent sm:text-sm"
        >
          Réserver <ArrowUpRight className="size-4" />
        </Link>
        <span
          className="hidden h-5 w-px shrink-0 bg-border sm:block"
          aria-hidden="true"
        />
        <Link
          href="/actualites"
          className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.12em] hover:text-accent sm:text-sm"
        >
          Nos actualités <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
