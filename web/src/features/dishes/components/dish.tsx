import { isMenuEnabled } from '@/settings/settings.helpers';
import Image from 'next/image';
import type { Dish as DishModel } from '../lib/dishes.types';
import { DeleteDish } from './delete-dish';
import { EditDishAdminButton } from './edit-dish-admin-button';

type Props = {
  dish: DishModel;
};

export function Dish({ dish }: Props) {
  if (!isMenuEnabled()) return null;

  return (
    <div className="group relative rounded-sm border border-border bg-background/60 p-4 transition-colors hover:bg-muted/60">
      <div className="absolute -top-2 right-2 z-20 flex gap-2">
        <EditDishAdminButton dish={dish} />
        <DeleteDish id={dish.id} />
      </div>
      <div className="flex gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md">
          <Image
            src={dish.imageUrl}
            alt={dish.label}
            fill
            sizes="80px"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 text-sm sm:text-lg">
            <h4 className="min-w-0 flex-1 font-heading text-xl font-semibold text-foreground transition-colors duration-300 group-hover:text-accent">
              {dish.label}
            </h4>
            {dish.price && (
              <p className="shrink-0 text-sm font-bold text-primary">
                {dish.price}
              </p>
            )}
          </div>
          {dish.details && (
            <p className="mt-2 whitespace-pre-line text-xs leading-5 text-muted-foreground transition-colors duration-300 group-hover:text-foreground sm:text-sm">
              {dish.details}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
