import Link from 'next/link';
import {
	ArrowRight,
	CalendarDays,
	ImageIcon,
	Mail,
	QrCode,
	Users,
} from 'lucide-react';
import { isPrestationsEnabled } from '@/settings/settings.helpers';

const calendarDescription = isPrestationsEnabled()
	? 'Consultez et ajoutez des réservations, fermetures ou blocages de ressources.'
	: 'Consultez les événements à venir et déclarez des périodes de fermetures.';

const adminLinks = [
	{
		href: '/staff/calendrier',
		label: 'Calendrier',
		description: calendarDescription,
		Icon: CalendarDays,
	},
	{
		href: '/staff/images',
		label: 'Images',
		description:
			'Ajoutez, consultez et supprimez les images utilisées dans les contenus du site.',
		Icon: ImageIcon,
	},
	{
		href: '/staff/utilisateurs',
		label: 'Utilisateurs',
		description:
			'Gérez les comptes utilisateurs, leurs accès et les adresses email bannies.',
		Icon: Users,
	},
	{
		href: '/staff/mail-maketing',
		label: 'Mail marketing',
		description:
			'Rédigez les emails marketing et consultez les envois programmés ou précédents.',
		Icon: Mail,
	},
	{
		href: '/staff/qrcode',
		label: 'QR code',
		description:
			'Téléchargez un QR code pointant vers la page d’accueil du site pour vos supports publicitaires.',
		Icon: QrCode,
	},
];

export default function AdminPage() {
	return (
		<main className="container mx-auto px-4 py-10">
			<div className="mx-auto flex max-w-4xl flex-col gap-8">
				<header className="space-y-3">
					<h1 className="font-brand text-4xl font-bold tracking-wide text-primary sm:text-6xl">
						Espace Staff
					</h1>
					<p className="text-lg font-medium">
						Gérez votre activité depuis votre Espace Staff.
					</p>
					<p className="max-w-2xl text-sm leading-6 text-muted-foreground">
						Accédez aux outils principaux pour organiser les réservations,
						maintenir vos contenus visuels et administrer les comptes.
					</p>
				</header>

				<nav className="grid gap-3" aria-label="Pages de l’Espace Staff">
					{adminLinks.map(({ href, label, description, Icon }) => (
						<Link
							key={href}
							href={href}
							className="group flex items-start justify-between gap-4 rounded-lg border border-border bg-background/70 p-4 transition-colors hover:border-primary/60 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
						>
							<span className="flex min-w-0 gap-3">
								<span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<Icon className="size-5" aria-hidden="true" />
								</span>
								<span className="min-w-0">
									<span className="block font-semibold text-primary">
										{label}
									</span>
									<span className="mt-1 block text-sm leading-6 text-muted-foreground">
										{description}
									</span>
								</span>
							</span>
							<ArrowRight
								className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
								aria-hidden="true"
							/>
						</Link>
					))}
				</nav>
			</div>
		</main>
	);
}
