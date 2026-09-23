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
import { getGoogleRatingsService } from '@/features/google-ratings/lib/google-ratings.service';
import {
	getLatestCurrentEventService,
	getMaxFiveCurrentEventsToDisplayService,
} from '@/features/current-events/lib/current-events.service';
import { Carousel } from '@/features/carousel/components/carousel';
import { Presentation } from '@/features/presentation';
import { ScrollReveal } from '@/components/system/scroll-reveal';
import { CurrentEventsPreview } from '@/features/current-events/components/current-events-preview';
import { LatestCurrentEvent } from '@/features/current-events/components/latest-current-event';
import { CTAButton } from '@/components/landing-page/CTAButton';
import {
	getCachedAllOpeningSlotsService,
	getCachedNextOpeningClosurePeriodsService,
} from '@/features/opening-slots/lib/opening-slots.service';
import { OpeningSlots } from '@/features/opening-slots';
import { MoreInfos } from '@/components/landing-page/more-infos';
import { DishesSummary } from '@/features/dishes/components/dishes-summary';
import { getCachedAllDishCategoriesService } from '@/features/dishes/lib/dishes.service';

export default async function HomePage() {
	const [
		siteSettings,
		servicesCategories,
		socialMedias,
		carouselImages,
		presentation,
		lastCurrentEvent,
		latestCurrentEvent,
		googleRatings,
		openingSlots,
		openingClosures,
		openingSlotsPresentation,
		dishCategories,
	] = await Promise.all([
		getCachedSiteSettingsService(),
		getCachedAllServicesCategoriesService(),
		getCachedAllSocialMediasService(),
		getCachedAllCarouselImagesService(),
		getCachedPresentationService(),
		getMaxFiveCurrentEventsToDisplayService().catch(() => []),
		getLatestCurrentEventService().catch(() => null),
		getGoogleRatingsService().catch(() => null),
		getCachedAllOpeningSlotsService(),
		getCachedNextOpeningClosurePeriodsService().catch(() => []),
		getCachedOpeningSlotsPresentationService(),
		getCachedAllDishCategoriesService(),
	]);

	return (
		<section className="relative overflow-hidden bg-background">
			<div className="fixed bottom-5 right-4 z-50 sm:bottom-8 sm:right-8">
				<CTAButton destination="menu" />
			</div>
			<CurrentEventsPreview events={lastCurrentEvent} />
			<Hero
				siteSettings={siteSettings}
				socialMedias={socialMedias}
				googleRatings={googleRatings}
			/>
			<Carousel images={carouselImages} />
			<Presentation presentation={presentation} />
			<DishesSummary dishCategories={dishCategories} />
			{/* <OfferingsSummary servicesCategories={servicesCategories} /> */}
			{/* <MoreInfos /> */}
			<div id="horaires" className="scroll-mt-20">
				<OpeningSlots
					openingSlots={openingSlots}
					openingClosures={openingClosures}
					presentation={openingSlotsPresentation}
				/>
			</div>
			<LatestCurrentEvent currentEvent={latestCurrentEvent} />
			<ScrollReveal />
		</section>
	);
}
