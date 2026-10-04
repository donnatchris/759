import { isPrestationsEnabled } from '@/settings/settings.helpers';
import { notFound } from 'next/navigation';
import {
  type TServicesCategoryWithServicesAndRessources,
  type Ressource,
} from '@/features/services';
import {
  getAllServicesWithRessourcesAndCategoriesService,
  getRessourcesService,
} from '@/features/services/lib/services.service';
import { getCachedPageTitleService } from '@/features/pages/lib/page-title.service';
import { PageTitle } from '@/features/pages/components/page-title';
import { Category } from '@/features/services/components/category';
import { ScrollReveal } from '@/components/system/scroll-reveal';
import { CreateServiceCategoryAdminButton } from '@/features/services/components/create-service-category-admin-button';
import { RessourcesAdmin } from '@/features/ressource';
import { getSiteSettingsService } from '@/features/site-settings/lib/site-settings.service';
import { auth } from '@/features/auth/auth';
import { headers } from 'next/headers';
import {
  BookingSettingsAdmin,
  type BookingSettings,
} from '@/features/reservations';
import { getPublicBookingSettingsService } from '@/features/reservations/lib/reservations.service';
import { MoreInfos } from '@/components/landing-page/more-infos';

export default async function PrestationsPage() {
  if (!isPrestationsEnabled()) notFound();
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = session?.user.role === 'ADMIN';

  const [
    page,
    categoriesWithServices,
    ressources,
    siteSettings,
    bookingSettings,
  ]: [
    Awaited<ReturnType<typeof getCachedPageTitleService>>,
    TServicesCategoryWithServicesAndRessources[],
    Ressource[],
    Awaited<ReturnType<typeof getSiteSettingsService>>,
    BookingSettings | null,
  ] = await Promise.all([
    getCachedPageTitleService({ slug: 'prestations' }),
    getAllServicesWithRessourcesAndCategoriesService(),
    getRessourcesService(),
    getSiteSettingsService(),
    getPublicBookingSettingsService(),
  ]);

  return (
    <section className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <PageTitle pageTitle={page} />
        <div className="my-3">
          <CreateServiceCategoryAdminButton />
        </div>
        {isAdmin && bookingSettings && (
          <BookingSettingsAdmin settings={bookingSettings} />
        )}
        <RessourcesAdmin ressources={ressources} />
        <div className="flex flex-col gap-4">
          {categoriesWithServices.map((cat, index) => {
            const id = String(cat.id);
            return (
              <Category
                key={id}
                servicesCategory={cat}
                ressources={ressources}
                imagePriority={index === 0}
                reservationPhone={siteSettings.tel ?? null}
                onlineBookingEnabled={
                  bookingSettings?.onlineBookingEnabled ?? false
                }
              />
            );
          })}
        </div>
      </div>
      <MoreInfos />
      <ScrollReveal />
    </section>
  );
}
