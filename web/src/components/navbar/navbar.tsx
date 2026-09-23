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

type Props = {
  initialUnreadNotificationsCount?: number;
  siteName?: string;
};

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
        <Link
          href="/#horaires"
          className="border-b-2 border-transparent px-2 py-2.5 text-xs font-semibold text-foreground transition hover:border-accent hover:text-accent"
        >
          Nous retrouver
        </Link>
        <Link
          href="/menu"
          className="border-b-2 border-transparent px-2 py-2.5 text-xs font-semibold text-foreground transition hover:border-accent hover:text-accent"
        >
          À la table
        </Link>
        {/* <Link
					href="/prestations"
					className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/75 transition hover:text-accent"
				>
					Réserver
				</Link> */}
        <Link
          href="/actualites"
          className="border-b-2 border-transparent px-2 py-2.5 text-xs font-semibold text-foreground transition hover:border-accent hover:text-accent"
        >
          Rendez-vous
        </Link>
        <Link
          href="/"
          className="border-b-2 border-transparent px-2 py-2.5 text-xs font-semibold text-foreground transition hover:border-accent hover:text-accent"
        >
          L’association
        </Link>
      </div>

      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="border-2 border-primary bg-background transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground lg:hidden"
            aria-label="Ouvrir le menu de navigation"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[min(22rem,calc(100vw-1rem))] border-l-4 border-l-secondary bg-card">
          <SheetHeader>
            <SheetTitle className="font-brand text-3xl">Le sommaire</SheetTitle>
            <SheetDescription className="sr-only">
              Liens de navigation du site
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-1 border-t border-border pt-4">
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <Home className="size-4 text-accent" />
              L’association
            </Link>
            <Link
              href="/menu"
              onClick={closeMenu}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <UtensilsCrossed className="size-4 text-accent" />À la table
            </Link>
            <Link
              href="/#horaires"
              onClick={closeMenu}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <MapPin className="size-4 text-accent" />
              Nous retrouver
            </Link>
            <Link
              href="/actualites"
              onClick={closeMenu}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <Newspaper className="size-4 text-accent" />
              Nos rendez-vous
            </Link>
            <Link
              href="/cgu"
              onClick={closeMenu}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <Info className="size-4 text-accent" />
              Informations légales
            </Link>

            {/* {isLoginEnabled() && !user && (
							<Link
								href="/auth/sign-in"
								onClick={closeMenu}
								className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
							>
								<LogIn className="size-4 text-accent" />
								Connexion
							</Link>
						)} */}

            {user && (
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <UserRound className="size-4 text-accent" />
                Tableau de bord client
              </Link>
            )}

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
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors ${
                        editMode
                          ? 'border-primary bg-primary'
                          : 'border-input bg-muted'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform ${
                          editMode ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </span>
                  </button>
                )}
                <Link
                  href="/staff"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <LayoutDashboard className="size-4 text-accent" />
                  Espace Staff
                </Link>
                <Link
                  href="/staff/calendrier"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <CalendarDays className="size-4 text-accent" />
                  Calendrier Staff
                </Link>
                <Link
                  href="/staff/utilisateurs"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <Users className="size-4 text-accent" />
                  Gestion des utilisateurs
                </Link>
                <Link
                  href="/staff/images"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <ImageIcon className="size-4 text-accent" />
                  Gestion des images
                </Link>
                <Link
                  href="/staff/mail-maketing"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <Newspaper className="size-4 text-accent" />
                  Emails marketing
                </Link>
                <Link
                  href="/staff/qrcode"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <QrCode className="size-4 text-accent" />
                  QR code
                </Link>
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
        {/* {isLoginEnabled() && !user && <LoginButton />}
				{isSignUpEnabled() && user && <LogoutButton email={user.email} />} */}
      </div>
      <ThemeSwitcher />
    </nav>
  );
}
