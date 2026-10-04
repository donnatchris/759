import { isPrestationsEnabled } from '@/settings/settings.helpers';
import Image from 'next/image';
import Link from 'next/link';
import type { ServicesCategory } from '../lib/services.types';
import { getCachedPageTitleService } from '@/features/pages/lib/page-title.service';

type Props = {
  servicesCategories: ServicesCategory[];
};

export async function OfferingsSummary({ servicesCategories }: Props) {
  if (!isPrestationsEnabled()) return null;

  const { title } = await getCachedPageTitleService({ slug: 'prestations' });
  const hoverText = 'Cliquez pour découvrir...';
  return (
    <section className="bg-secondary px-4 py-24 text-secondary-foreground sm:px-8">
      <div className="max-w-7xl mx-auto">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#56c7c4]">
          À votre rythme
        </p>
        <h2 className="mb-12 max-w-2xl font-brand text-4xl leading-none tracking-[-0.04em] text-white sm:text-6xl animate-fade-in-on-scroll">
          {title}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {servicesCategories.map((category) => {
            const id = String(category.id);
            return (
              <div key={id} className="relative animate-fade-in-on-scroll">
                <Link
                  href={`/prestations/#${category.id}`}
                  className="group relative flex min-h-64 flex-col justify-end overflow-hidden border border-white/15 bg-white/5 p-8 text-left transition hover:border-[#56c7c4]/60 hover:bg-white/10"
                >
                  <div className="absolute inset-0 overflow-hidden">
                    {category.imageUrl && (
                      <Image
                        src={category.imageUrl}
                        alt={category.label}
                        fill
                        sizes="(min-width: 1280px) 584px, (min-width: 768px) calc((100vw - 7rem) / 2), calc(100vw - 2rem)"
                        className="object-cover opacity-10 grayscale transition-all duration-700 group-hover:scale-105 group-hover:opacity-25"
                      />
                    )}
                  </div>
                  <h3 className="relative font-brand text-3xl font-semibold text-white">
                    {category.label}
                  </h3>
                  <p className="relative mt-4 whitespace-pre-line text-sm leading-6 text-white/65">
                    {category.shortDescription}
                  </p>
                  <p className="relative mt-7 text-xs font-semibold uppercase tracking-[0.15em] text-[#ef765b] transition-transform group-hover:translate-x-2">
                    {hoverText} →
                  </p>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
