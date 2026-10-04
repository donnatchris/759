import { isMenuEnabled } from '@/settings/settings.helpers';
import Image from 'next/image';
import { Info } from 'lucide-react';
import type { TDishCategoryWithDishes } from '../lib/dishes.types';
import { CreateDishAdminButton } from './create-dish-admin-button';
import { DeleteDishCategory } from './delete-dish-category';
import { Dish } from './dish';
import { EditDishCategoryAdminButton } from './edit-dish-category-admin-button';

type Props = {
  dishCategory: TDishCategoryWithDishes;
  imagePriority?: boolean;
};

export function Category({ dishCategory, imagePriority = false }: Props) {
  if (!isMenuEnabled()) return null;

  const id = String(dishCategory.id);
  const text = dishCategory.longDescription ?? dishCategory.shortDescription;

  return (
    <div>
      <div
        className="grid scroll-mt-24 overflow-hidden rounded-sm border border-border bg-card lg:grid-cols-[.65fr_1.35fr]"
        id={id}
      >
        <div className="group relative flex min-h-72 flex-col justify-end gap-2 overflow-hidden bg-primary p-8 text-primary-foreground">
          <div className="absolute top-2 right-2 z-20 flex gap-2">
            <CreateDishAdminButton categoryId={id} />
            <EditDishCategoryAdminButton category={dishCategory} />
            <DeleteDishCategory id={id} />
          </div>
          <Image
            src={dishCategory.imageUrl}
            alt={dishCategory.label}
            width={800}
            height={400}
            sizes="(max-width: 640px) 100vw, 800px"
            loading={imagePriority ? 'eager' : 'lazy'}
            className="absolute left-0 top-0 h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-transparent" />
          <p className="relative z-10 mb-2 text-xs font-bold uppercase tracking-widest">
            À la table
          </p>
          <h3 className="relative z-10 mb-4 font-heading text-4xl font-semibold tracking-tight">
            {dishCategory.label}
          </h3>
          <p className="relative z-10 whitespace-pre-line text-sm leading-6 text-primary-foreground/75">
            {text}
          </p>
        </div>
        <div className="p-6 sm:p-8">
          <main className="flex flex-col gap-3">
            {dishCategory.dishes.map((dish) => (
              <Dish key={dish.id} dish={dish} />
            ))}
          </main>
        </div>
        {dishCategory.infos && (
          <div className="flex items-center gap-2 bg-muted/40 p-5 text-muted-foreground lg:col-span-2">
            <Info className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm">{dishCategory.infos}</span>
          </div>
        )}
      </div>
    </div>
  );
}
