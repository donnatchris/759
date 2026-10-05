import {
  isBlogEnabled,
  isEventsEnabled,
  isHorairesEnabled,
  isMenuEnabled,
  isPrestationsEnabled,
} from '@/settings/settings.helpers';
import { HomeEventsCalendar } from '@/features/events/components/home-events-calendar';
import { Hero } from '@/components/landing-page/hero';
import { OfferingsSummary } from '@/features/services/components/offerings-summary';
import { getCachedAllServicesCategoriesService } from '@/features/services/lib/services.service';
import { getCachedSiteSettingsService } from '@/features/site-settings/lib/site-settings.service';
import { getCachedAllSocialMediasService } from '@/features/social-media/lib/social-media.service';
import { getCachedAllCarouselImagesService } from '@/features/carousel/lib/carousel.service';
import {
  getCachedOpeningSlotsPresentationService,
  getCachedPresentationService,
} from '@/features/presentation/lib/presentation.service';
import { getCachedAllDishCategoriesService } from '@/features/dishes/lib/dishes.service';
import { getGoogleRatingsService } from '@/features/google-ratings/lib/google-ratings.service';
import { getLatestBlogPostService } from '@/features/blog/lib/blog.service';
import { Carousel } from '@/features/carousel/components/carousel';
import { Presentation } from '@/features/presentation';
import { ScrollReveal } from '@/components/system/scroll-reveal';
import { EventsPreview } from '@/features/events/components/events-preview';
import { getMaxFiveEventsToDisplayService } from '@/features/events/lib/events.service';
import { LatestBlogPost } from '@/features/blog/components/latest-blog-post';
import { CTAButton } from '@/components/landing-page/CTAButton';
import {
  getCachedAllOpeningSlotsService,
  getCachedNextOpeningClosurePeriodsService,
} from '@/features/opening-slots/lib/opening-slots.service';
import { OpeningSlots } from '@/features/opening-slots';
import { DishesSummary } from '@/features/dishes';
import { MoreInfos } from '@/components/landing-page/more-infos';

export default async function HomePage() {
  const [
    siteSettings,
    servicesCategories,
    socialMedias,
    carouselImages,
    presentation,
    featuredEvents,
    latestBlogPost,
    googleRatings,
    openingSlots,
    openingClosures,
    openingSlotsPresentation,
    dishCategories,
  ] = await Promise.all([
    getCachedSiteSettingsService(),
    isPrestationsEnabled()
      ? getCachedAllServicesCategoriesService()
      : Promise.resolve([]),
    getCachedAllSocialMediasService(),
    getCachedAllCarouselImagesService(),
    getCachedPresentationService(),
    isEventsEnabled()
      ? getMaxFiveEventsToDisplayService().catch(() => [])
      : Promise.resolve([]),
    isBlogEnabled()
      ? getLatestBlogPostService().catch(() => null)
      : Promise.resolve(null),
    getGoogleRatingsService().catch(() => null),
    isHorairesEnabled()
      ? getCachedAllOpeningSlotsService()
      : Promise.resolve([]),
    isHorairesEnabled()
      ? getCachedNextOpeningClosurePeriodsService().catch(() => [])
      : Promise.resolve([]),
    isHorairesEnabled()
      ? getCachedOpeningSlotsPresentationService()
      : Promise.resolve(null),
    isMenuEnabled()
      ? getCachedAllDishCategoriesService().catch(() => [])
      : Promise.resolve([]),
  ]);

  return (
    <section className="relative overflow-hidden bg-background">
      {isBlogEnabled() && (
        <div className="fixed bottom-5 right-4 z-50 sm:bottom-12 sm:right-12">
          <CTAButton />
        </div>
      )}
      <EventsPreview events={featuredEvents} />
      <Hero siteSettings={siteSettings} socialMedias={socialMedias} />
      <Carousel images={carouselImages} />
      <Presentation presentation={presentation} />
      <DishesSummary dishCategories={dishCategories} />
      <OfferingsSummary servicesCategories={servicesCategories} />
      {/* <MoreInfos /> */}
      {openingSlotsPresentation && (
        <OpeningSlots
          openingSlots={openingSlots}
          openingClosures={openingClosures}
          presentation={openingSlotsPresentation}
        />
      )}
      <HomeEventsCalendar />
      <LatestBlogPost blogPost={latestBlogPost} />
      <ScrollReveal />
    </section>
  );
}
