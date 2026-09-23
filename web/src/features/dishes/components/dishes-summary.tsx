import Image from 'next/image';
import Link from 'next/link';
import type { DishCategory } from '../lib/dishes.types';

type Props = {
  dishCategories: DishCategory[];
};

export async function DishesSummary({ dishCategories }: Props) {
  const title = 'Les plaisirs de la table';
  const hoverText = 'Découvrir la table';

  return (
    <section
      id="notre-menu"
      className="scroll-mt-20 px-4 py-24 sm:px-8 sm:py-32"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-14 flex flex-col gap-5 pb-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker mb-4">Le goût du pays</p>
            <h2 className="section-title animate-fade-in-on-scroll">{title}</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            Produits du coin, recettes de famille et grandes tablées : ici, le
            repas est d’abord une façon de se retrouver.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dishCategories.map((category) => {
            const id = String(category.id);
            return (
              <div key={id} className="relative animate-fade-in-on-scroll">
                <Link
                  href={`/menu/#${category.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-md border border-border/70 bg-card p-3 transition-transform duration-300 motion-safe:hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
                    <Image
                      src={category.imageUrl}
                      alt={category.label}
                      fill
                      sizes="(min-width: 1280px) 584px, (min-width: 768px) calc((100vw - 7rem) / 2), calc(100vw - 2rem)"
                      className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
                    />
                  </div>

                  <h3 className="px-4 pt-6 font-heading text-3xl font-medium text-foreground">
                    {category.label}
                  </h3>
                  <p className="mt-3 flex-1 whitespace-pre-line px-4 text-sm leading-6 text-muted-foreground">
                    {category.shortDescription}
                  </p>
                  <p className="m-4 mt-6 flex w-fit border-b border-heritage-gold px-0 py-2 text-xs font-bold text-primary transition-colors group-hover:text-accent">
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
