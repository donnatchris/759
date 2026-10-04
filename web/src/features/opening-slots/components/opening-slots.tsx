import { CalendarX, Clock } from 'lucide-react';
import {
	createLocalDate,
	formatOpeningSlotTime,
	OPENING_SLOT_DAY_LABELS,
	type OpeningSlot,
	type TOpeningClosurePeriod,
} from '../lib/opening-slots.types';
import { EditOpeningSlotsAdminButton } from './edit-opening-slots-admin-button';
import { EditOpeningSlotsPresentationAdminButton } from './edit-opening-slots-presentation-admin-button';
import { getSiteIcon, isHorairesEnabled } from '@/settings/settings.helpers';
import type { TPresentation } from '@/features/presentation';

type Props = {
	openingSlots: OpeningSlot[];
	openingClosures: TOpeningClosurePeriod[];
	presentation: TPresentation;
};

const Icon = getSiteIcon();

export function OpeningSlots({
	openingSlots,
	openingClosures,
	presentation,
}: Props) {
	if (!isHorairesEnabled()) return null;

	const slotsByDay = new Map<number, OpeningSlot[]>();
	const { title, subTitle, content, footer } = presentation;

	for (const slot of openingSlots) {
		const current = slotsByDay.get(slot.dayOfWeek) ?? [];
		slotsByDay.set(slot.dayOfWeek, [...current, slot]);
	}

	return (
		<section id="horaires" className="scroll-mt-20 relative overflow-hidden border-y-2 border-heritage-ink bg-heritage-ink px-6 py-16 text-heritage-paper sm:px-10 sm:py-24">
			<div
				className="absolute inset-y-0 right-0 w-2 bg-[repeating-linear-gradient(0deg,var(--heritage-gold)_0_20px,var(--heritage-red)_20px_36px)]"
				aria-hidden="true"
			/>
			<div className="absolute right-4 top-4 z-20 flex items-center gap-1">
				<EditOpeningSlotsPresentationAdminButton presentation={presentation} />
				<EditOpeningSlotsAdminButton openingSlots={openingSlots} />
			</div>

			<div className="container mx-auto max-w-6xl  animate-fade-in-on-scroll">
				<div className="relative grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
					<div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
						{subTitle && (
							<div className="mb-5 flex items-center justify-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-heritage-gold lg:justify-start">
								<Icon className="h-5 w-5" aria-hidden="true" />
								<span>{subTitle}</span>
							</div>
						)}

						{title && (
							<h2 className="font-heading text-5xl font-semibold leading-[.95] tracking-tight text-heritage-paper sm:text-6xl">
								{title}
							</h2>
						)}

						{content && (
							<p className="mt-5 text-base leading-7 text-heritage-paper/75 sm:text-lg">
								{content}
							</p>
						)}

						{openingClosures.length > 0 && (
							<div className="mt-6 space-y-3 text-left">
								<p className="flex items-center justify-center gap-2 text-sm font-medium text-heritage-gold lg:justify-start">
									<CalendarX className="h-4 w-4" aria-hidden="true" />
									Prochaines fermetures
								</p>
								<div className="space-y-2">
									{openingClosures.map((closure) => (
										<div
											key={closure.id}
											className="border-l-2 border-heritage-gold bg-white/5 px-4 py-3 text-sm text-heritage-paper/75"
										>
											<p className="font-medium text-white">{closure.label}</p>
											<p>{formatOpeningClosurePeriod(closure)}</p>
										</div>
									))}
								</div>
							</div>
						)}

						<div className="mt-9 flex items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-heritage-paper/60">
							<span>Midi</span>
							<span className="route-line h-0.5 flex-1 text-heritage-gold/60" />
							<span>Soir</span>
						</div>
					</div>

					<div className="relative">
						<div className="divide-y divide-heritage-ink/15 border-t-4 border-heritage-gold bg-heritage-paper px-5 sm:px-8">
							{OPENING_SLOT_DAY_LABELS.map((label, dayOfWeek) => {
								const daySlots = (slotsByDay.get(dayOfWeek) ?? []).sort(
									(a, b) => a.slotIndex - b.slotIndex,
								);

								return (
									<div
										key={label}
										className="grid min-h-16 grid-cols-[6rem_1fr] items-center gap-4 py-5 sm:grid-cols-[9rem_1fr]"
									>
										<span className="text-sm font-extrabold uppercase text-heritage-ink">
											{label}
										</span>
										<div className="flex flex-wrap justify-end gap-x-3 gap-y-1 text-sm text-heritage-ink font-semibold">
											{daySlots.length === 0 ? (
												<span className="text-heritage-ink/50 font-medium">
													Sur événement
												</span>
											) : (
												daySlots.map((slot) => (
													<span key={slot.id} className="whitespace-nowrap">
														{formatOpeningSlotTime(slot.opensAtMinute)}
														<span className="mx-2 text-heritage-red">-</span>
														{formatOpeningSlotTime(slot.closesAtMinute)}
													</span>
												))
											)}
										</div>
									</div>
								);
							})}
						</div>

						{footer && (
							<div className="mt-6 flex items-center justify-center gap-2 text-sm text-heritage-paper/75">
								<Clock
									className="h-4 w-4 text-heritage-gold"
									aria-hidden="true"
								/>
								<span>{footer}</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}

function formatOpeningClosurePeriod(closure: TOpeningClosurePeriod): string {
	const start = formatOpeningClosureDate(closure.startDate);
	const end = formatOpeningClosureDate(closure.endDate);

	if (closure.startDate === closure.endDate) {
		return `Le ${start}`;
	}

	return `Du ${start} au ${end}`;
}

function formatOpeningClosureDate(value: string): string {
	return new Intl.DateTimeFormat('fr-FR', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
	}).format(createLocalDate(value));
}
