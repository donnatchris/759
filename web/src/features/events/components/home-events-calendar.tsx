import Link from 'next/link';
import { isEventsEnabled } from '@/settings/settings.helpers';
import { EventsCalendar } from './events-calendar';

export function HomeEventsCalendar() {
	if (!isEventsEnabled()) return null;
	return (
		<section
			id="agenda"
			aria-labelledby="agenda-title"
			className="relative scroll-mt-20 overflow-hidden bg-heritage-ink px-6 py-16 text-heritage-paper sm:px-10 sm:py-24"
		>
			<div
				className="absolute inset-y-0 right-0 w-2 bg-[repeating-linear-gradient(0deg,var(--heritage-gold)_0_20px,var(--heritage-red)_20px_36px)]"
				aria-hidden="true"
			/>
			<div className="container mx-auto max-w-6xl">
				<div className="mb-10 flex flex-wrap items-end justify-between gap-6">
					<div>
						<p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-heritage-gold">
							À vos agendas
						</p>
						<h2
							id="agenda-title"
							className="font-heading text-5xl font-semibold leading-tight tracking-tight sm:text-6xl"
						>
							Nos événements
						</h2>
						<p className="mt-5 text-base leading-7 text-heritage-paper/75">
							Retrouvez les prochains rendez-vous et découvrez leur programme.
						</p>
					</div>
					<Link
						href="/evenements"
						className="font-semibold text-heritage-gold underline underline-offset-4"
					>
						Voir tous les événements
					</Link>
				</div>
				<EventsCalendar />
			</div>
		</section>
	);
}
