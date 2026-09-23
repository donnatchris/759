import { ScrollReveal } from '@/components/system/scroll-reveal';
import { Category } from '@/features/dishes/components/category';
import { CreateDishCategoryAdminButton } from '@/features/dishes/components/create-dish-category-admin-button';
import { getAllDishesAndCategoriesService } from '@/features/dishes/lib/dishes.service';
import type { TDishCategoryWithDishes } from '@/features/dishes/lib/dishes.types';
import { PageTitle } from '@/features/pages/components/page-title';
import { getCachedPageTitleService } from '@/features/pages/lib/page-title.service';

export default async function MenuPage() {
  const [page, dishCategories]: [
    Awaited<ReturnType<typeof getCachedPageTitleService>>,
    TDishCategoryWithDishes[],
  ] = await Promise.all([
    getCachedPageTitleService({ slug: 'menu' }),
    getAllDishesAndCategoriesService(),
  ]);

  return (
    <section className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <PageTitle pageTitle={page} />

        <div className="my-6">
          <CreateDishCategoryAdminButton />
        </div>

        {dishCategories.length > 0 ? (
          <div className="flex flex-col gap-6">
            {dishCategories.map((dishCategory, index) => (
              <Category
                key={dishCategory.id}
                dishCategory={dishCategory}
                imagePriority={index === 0}
              />
            ))}
          </div>
        ) : (
          <p className="border border-border bg-card px-6 py-12 text-center text-muted-foreground">
            Le menu sera bientôt disponible.
          </p>
        )}
      </div>

      <ScrollReveal />
    </section>
  );
}
