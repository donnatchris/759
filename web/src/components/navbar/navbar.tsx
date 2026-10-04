'use client';

import { useState } from 'react';
import { ThemeSwitcher } from './theme-switcher';
import { LogoLink } from '@/components/custom-ui/logo-link';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { LoginButton } from './login-button';
import { LogoutButton } from './logout-button';
import { isLoginEnabled } from '@/settings/settings.helpers';
import { NavbarMenu } from './navbar-menu';

type Props = {
  initialUnreadNotificationsCount?: number;
  siteName: string;
};

export function Navbar({
  initialUnreadNotificationsCount = 0,
  siteName,
}: Props) {
  const { user } = useUser();
  const { editMode, toggleEditMode } = useEditMode();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <nav className="sticky top-0 z-50 flex h-20 w-full items-center border-b border-border bg-card px-4 before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-[linear-gradient(90deg,var(--heritage-ink)_0_33.33%,var(--heritage-paper)_33.33%_66.66%,var(--heritage-red)_66.66%)] sm:px-8">
      <div className="mr-auto">
        <LogoLink size={170} name={siteName} />
      </div>

      <NavbarMenu
        user={user}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        editMode={editMode}
        toggleEditMode={toggleEditMode}
        closeMenu={closeMenu}
      />

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
    </nav>
  );
}
