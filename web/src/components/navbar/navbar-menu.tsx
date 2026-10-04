import Link from 'next/link';
import {
  CalendarDays,
  Newspaper,
  Home,
  ImageIcon,
  LayoutDashboard,
  Menu,
  MapPin,
  QrCode,
  UtensilsCrossed,
  UserRound,
  Users,
  LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import {
  isHorairesEnabled,
  isMenuEnabled,
  isBlogEnabled,
  isEventsEnabled,
  isPrestationsEnabled,
} from '@/settings/settings.helpers';
import { TAuthUser } from '@/features/auth/auth.types';

type NavigationLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const PUBLIC_NAVIGATION_LINKS = [
  { href: '/', label: 'Accueil', icon: Home },
  isHorairesEnabled() && {
    href: '/#horaires',
    label: 'Nos horaires',
    icon: MapPin,
  },
  isEventsEnabled() && {
    href: '/evenements',
    label: 'Événements',
    icon: CalendarDays,
  },
  isBlogEnabled() && { href: '/blog', label: 'Blog', icon: Newspaper },
  isMenuEnabled() && {
    href: '/menu',
    label: 'Nos menus',
    icon: UtensilsCrossed,
  },
  isPrestationsEnabled() && {
    href: '/prestations',
    label: 'Réserver une prestation',
    icon: Users,
  },
].filter((link): link is NavigationLink => Boolean(link));

const AUTH_NAVIGATION_LINKS = [
  { href: '/dashboard', label: 'Mon compte', icon: UserRound },
].filter((link): link is NavigationLink => Boolean(link));

const STAFF_NAVIGATION_LINKS = [
  { href: '/staff', label: 'Espace Staff', icon: LayoutDashboard },
  { href: '/staff/calendrier', label: 'Calendrier Staff', icon: CalendarDays },
  {
    href: '/staff/utilisateurs',
    label: 'Gestion des utilisateurs',
    icon: Users,
  },
  { href: '/staff/images', label: 'Gestion des images', icon: ImageIcon },
  { href: '/staff/mail-maketing', label: 'Emails marketing', icon: Newspaper },
  { href: '/staff/qrcode', label: 'QR code', icon: QrCode },
].filter((link): link is NavigationLink => Boolean(link));

type Props = {
  user?: TAuthUser;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  editMode: boolean;
  toggleEditMode: () => void;
  closeMenu: () => void;
};

export function NavbarMenu({
  user,
  isMenuOpen,
  setIsMenuOpen,
  editMode,
  toggleEditMode,
  closeMenu,
}: Props) {
  const isAdmin = user?.role === 'ADMIN';
  const hasStaffAreaAccess = user?.role === 'ADMIN' || user?.role === 'STAFF';

  return (
    <>
      <div className="mr-5 hidden items-center gap-5 lg:flex">
        {PUBLIC_NAVIGATION_LINKS.filter(Boolean).map((link) => (
          <MenuLink
            key={link.href}
            href={link.href}
            label={link.label}
            Icon={link.icon}
          />
        ))}
        {user &&
          AUTH_NAVIGATION_LINKS.filter(Boolean).map((link) => (
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
            {user &&
              AUTH_NAVIGATION_LINKS.filter(Boolean).map((link) => (
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
    </>
  );
}

type MenuProps = {
  mode?: 'desktop' | 'mobile';
  href: string;
  label: string;
  Icon?: LucideIcon;
  onClick?: () => void;
};

function MenuLink({ mode = 'desktop', href, label, Icon, onClick }: MenuProps) {
  const className =
    mode === 'desktop'
      ? 'flex items-center gap-3 border-b-2 border-transparent px-2 py-2.5 text-xs font-semibold text-foreground transition hover:border-accent hover:text-accent'
      : 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none';
  return (
    <Link href={href} onClick={onClick} className={className}>
      {Icon && <Icon className="size-4 text-accent" />}
      {label}
    </Link>
  );
}
