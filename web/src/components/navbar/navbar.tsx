'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
	CalendarDays,
	Newspaper,
	Home,
	ImageIcon,
	Info,
	LayoutDashboard,
	Menu,
	MapPin,
	QrCode,
	UtensilsCrossed,
	UserRound,
	Users,
	LogIn,
	LucideIcon,
} from 'lucide-react';
import { ThemeSwitcher } from './theme-switcher';
import { LogoLink } from '@/components/custom-ui/logo-link';
import { useUser } from '@/features/auth/auth.context';
import { Button } from '@/components/ui/button';
import { useEditMode } from '@/features/core';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { LoginButton } from './login-button';
import { LogoutButton } from './logout-button';

import {
	isHorairesEnabled,
	isMenuEnabled,
	isActualitesEnabled,
	isPrestationsEnabled,
	isLoginEnabled,
	isSignUpEnabled,
} from '@/settings/settings.helpers';


type Props = {
	initialUnreadNotificationsCount?: number;
	siteName?: string;
};

type NavigationLink = {
	href: string;
	label: string;
	icon: LucideIcon;
};

const PUBLIC_NAVIGATION_LINKS = [
	{ href: '/', label: 'Accueil', icon: Home },
	isHorairesEnabled() && { href: '/#horaires', label: 'Nos horaires', icon: MapPin },
	isActualitesEnabled() && { href: '/actualites', label: 'Actualités', icon: Newspaper },
	isMenuEnabled() && { href: '/menu', label: 'Nos menus', icon: UtensilsCrossed },
	isPrestationsEnabled() && { href: '/prestations', label: 'Réserver une prestation', icon: Users },
].filter((link): link is NavigationLink => Boolean(link));

const AUTH_NAVIGATION_LINKS = [
	{ href: '/dashboard', label: 'Tableau de bord', icon: UserRound },
].filter((link): link is NavigationLink => Boolean(link));

const STAFF_NAVIGATION_LINKS = [
	{ href: '/staff', label: 'Espace Staff', icon: LayoutDashboard },
	{ href: '/staff/calendrier', label: 'Calendrier Staff', icon: CalendarDays },
	{ href: '/staff/utilisateurs', label: 'Gestion des utilisateurs', icon: Users },
	{ href: '/staff/images', label: 'Gestion des images', icon: ImageIcon },
	{ href: '/staff/mail-maketing', label: 'Emails marketing', icon: Newspaper },
	{ href: '/staff/qrcode', label: 'QR code', icon: QrCode },
].filter((link): link is NavigationLink => Boolean(link));

type MenuProps = {
	mode?: 'desktop' | 'mobile';
	href: string;
	label: string;
	Icon?: LucideIcon;
	onClick?: () => void;
};

export function MenuLink({ mode = 'desktop', href, label, Icon, onClick }: MenuProps) {
	const className = mode === 'desktop'
		? "flex items-center gap-3 border-b-2 border-transparent px-2 py-2.5 text-xs font-semibold text-foreground transition hover:border-accent hover:text-accent"
		: "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";
	return (
		<Link
			href={href}
			onClick={onClick}
			className={className}
		>
			{Icon && <Icon className="size-4 text-accent" />}
			{label}
		</Link>
	);
}

export function Navbar({
	initialUnreadNotificationsCount = 0,
	siteName,
}: Props) {
	const { user } = useUser();
	const { editMode, toggleEditMode } = useEditMode();
	const hasStaffAreaAccess = user?.role === 'ADMIN' || user?.role === 'STAFF';
	const isAdmin = user?.role === 'ADMIN';
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	function closeMenu() {
		setIsMenuOpen(false);
	}

	return (
		<nav className="sticky top-0 z-50 flex h-20 w-full items-center border-b border-border bg-card px-4 before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-[linear-gradient(90deg,var(--heritage-ink)_0_33.33%,var(--heritage-paper)_33.33%_66.66%,var(--heritage-red)_66.66%)] sm:px-8">
			<div className="mr-auto">
				<LogoLink size={170} name={siteName} />
			</div>

			<div className="mr-5 hidden items-center gap-5 lg:flex">
				{PUBLIC_NAVIGATION_LINKS.filter(Boolean).map((link) => (
					<MenuLink
						key={link.href}
						href={link.href}
						label={link.label}
						Icon={link.icon}
					/>
				))}
				{user && AUTH_NAVIGATION_LINKS.filter(Boolean).map((link) => (
					<MenuLink
						key={link.href}
						href={link.href}
						label={link.label}
						Icon={link.icon}
					/>
				))}
			</div>

			<Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
				<SheetTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="border-2 border-primary bg-background transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground"
						aria-label="Ouvrir le menu de navigation"
					>
						<Menu className="size-5" />
					</Button>
				</SheetTrigger>
				<SheetContent className="w-[min(22rem,calc(100vw-1rem))] border-l-4 border-l-secondary bg-card">
					<SheetHeader>
						<SheetTitle className="font-brand text-3xl">Navigation</SheetTitle>
						<SheetDescription className="sr-only">
							Liens de navigation du site
						</SheetDescription>
					</SheetHeader>

					<div className="flex flex-col gap-1 border-t border-border pt-4">
						{PUBLIC_NAVIGATION_LINKS.filter(Boolean).map((link) => (
							<MenuLink
								key={link.href}
								href={link.href}
								label={link.label}
								Icon={link.icon}
								onClick={closeMenu}
							/>
						))}
						{user && AUTH_NAVIGATION_LINKS.filter(Boolean).map((link) => (
							<MenuLink
								key={link.href}
								href={link.href}
								label={link.label}
								Icon={link.icon}
								onClick={closeMenu}
							/>
						))}

						{hasStaffAreaAccess && (
							<>
								<div className="my-2 h-px bg-border" />
								<div className="px-3 py-1 text-xs font-medium text-muted-foreground">
									Espace Staff
								</div>
								{isAdmin && (
									<button
										type="button"
										role="switch"
										aria-checked={editMode}
										onClick={toggleEditMode}
										className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
									>
										<span>Mode édition</span>
										<span
											className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors ${editMode
												? 'border-primary bg-primary'
												: 'border-input bg-muted'
												}`}
										>
											<span
												className={`inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform ${editMode ? 'translate-x-4' : 'translate-x-0.5'
													}`}
											/>
										</span>
									</button>
								)}
								{STAFF_NAVIGATION_LINKS.filter(Boolean).map((link) => (
									<MenuLink
										key={link.href}
										href={link.href}
										label={link.label}
										Icon={link.icon}
										onClick={closeMenu}
									/>
								))}
							</>
						)}
					</div>
				</SheetContent>
			</Sheet>

			<div
				key={user ? `auth-${user.id}` : 'guest'}
				className="ml-2 flex items-center gap-1 sm:gap-2"
			>
				<NotificationBell
					key={`${user?.id ?? 'guest'}-${initialUnreadNotificationsCount}`}
					initialUnreadCount={initialUnreadNotificationsCount}
				/>
				{isLoginEnabled() && !user && <LoginButton />}
				{user && <LogoutButton email={user.email} />}
			</div>
			<ThemeSwitcher />
		</nav >
	);
}
