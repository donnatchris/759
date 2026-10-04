import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Mail, Phone } from 'lucide-react';
import { LinkWithIcon } from '@/components/custom-ui/link-with-icon';

type Props = {
	siteSettings: {
		fullName: string;
		sloganHead: string | null | undefined;
		sloganAccent: string | null | undefined;
		sloganTail: string | null | undefined;
		activities: string[];
		address: string | null | undefined;
		tel: string | null | undefined;
		mail: string | null | undefined;
	};
};

export function Footer({ siteSettings }: Props) {
	const {
		fullName,
		sloganHead,
		sloganAccent,
		sloganTail,
		activities,
		address,
		tel,
		mail,
	} = siteSettings;
	const slogan = [sloganHead, sloganAccent, sloganTail]
		.filter(Boolean)
		.join(' ')
		.trim();
	const cleanedActivities = activities
		.map((activity) => activity.trim())
		.filter(Boolean);
	const description =
		slogan ||
		(cleanedActivities.length > 0 ? cleanedActivities.join(' • ') : '');
	const phoneLink = tel
		? `tel:+33${tel.replace(/\s+/g, '').replace(/^0/, '')}`
		: null;
	const addressLink = address
		? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
		: null;
	const mailLink = mail ? `mailto:${mail}` : null;
	const hasContact = Boolean(addressLink || phoneLink || mailLink);
	const siteCreator = process.env.SITE_CREATOR || '';
	const siteCreatorMail = process.env.SITE_CREATOR_MAIL || '';
	const currentYear = new Date().getFullYear();

	return (
		<footer className="overflow-hidden border-t border-heritage-gold/30 bg-heritage-ink text-heritage-paper">
			<div className="container mx-auto flex flex-col gap-12 px-6 py-16 text-sm sm:grid sm:grid-cols-[1.35fr_1fr_1fr] sm:px-8 lg:py-20">
				<div>
					<div className="flex items-center gap-4">
						<span className="relative size-16 shrink-0 overflow-hidden rounded-full border-2 border-secondary bg-black">
							<Image
								src="/uploads/logo-noir.jpg"
								alt="Logo du 7.59"
								fill
								sizes="64px"
								className="object-cover"
							/>
						</span>
						<div>
							<p className="font-heading text-3xl font-semibold tracking-[-0.04em] text-heritage-paper">
								{fullName}
							</p>
							<p className="mt-1.5 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-heritage-gold">
								Association · Pyrénées-Orientales
							</p>
						</div>
					</div>
					{description && (
						<p className="mt-6 max-w-md text-sm leading-7 text-heritage-paper/60">
							{description}
						</p>
					)}
					<Link
						href="/cgu"
						className="mt-5 inline-block text-xs font-semibold uppercase tracking-[0.1em] text-heritage-paper/75 underline underline-offset-4 transition-colors hover:text-heritage-paper"
					>
						CGU et informations légales
					</Link>
				</div>
				{hasContact && (
					<div>
						<p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-heritage-gold">
							Nous retrouver
						</p>
						<div className="mt-5 flex flex-col gap-3 [&_a]:text-heritage-paper/65 [&_a:hover]:text-heritage-paper">
							{addressLink && (
								<LinkWithIcon href={addressLink} Icon={MapPin} text={address} />
							)}
							{phoneLink && (
								<LinkWithIcon href={phoneLink} Icon={Phone} text={tel} />
							)}
							{mailLink && (
								<LinkWithIcon href={mailLink} Icon={Mail} text={mail} />
							)}
						</div>
					</div>
				)}
				<div>
					<p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-heritage-gold">
						Crédits
					</p>
					<div className="mt-2 flex flex-col gap-2 text-xs sm:text-sm">
						<p className="text-heritage-paper/60">
							Site réalisé par {siteCreator}
						</p>
						<Link
							href={`mailto:${siteCreatorMail}`}
							className="text-heritage-paper/60 underline underline-offset-4 transition-colors hover:text-heritage-paper"
						>
							{siteCreatorMail}
						</Link>
					</div>
				</div>
			</div>
			<div className="border-t border-white/10 px-6 py-5 text-center text-[0.6rem] uppercase tracking-[0.16em] text-heritage-paper/70">
				© {currentYear} {fullName} · Délice et tradition du Roussillon · Tous
				droits réservés
			</div>
		</footer>
	);
}
