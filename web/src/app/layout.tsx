import { SeoJsonLd } from '@/features/seo/components/seo-json-ld';
import './globals.css';
import type { Metadata } from 'next';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { Navbar } from '@/components/navbar/navbar';
import { Footer } from '@/components/footer/footer';
import { auth } from '@/features/auth/auth';
import { headers } from 'next/headers';
import type { TAuthSession, TAuthUser } from '@/features/auth/auth.types';
import { ThemeProvider } from '@teispace/next-themes';
import { UserProvider } from '@/features/auth/auth.context';
import { EditModeProvider } from '@/features/core';
import { getSiteSettingsService } from '@/features/site-settings/lib/site-settings.service';
import { countUnreadNotificationsForUserService } from '@/features/notifications/lib/notifications.service';
import {
  createRootMetadata,
  createSiteJsonLd,
} from '@/features/seo/lib/seo-metadata';
import { SEO_SETTINGS } from '@/settings/settings.seo';
import { UmamiAnalytics } from '@/features/analytics/umami-analytics';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createRootMetadata();

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
  const siteSettingsPromise = getSiteSettingsService();

  let session: TAuthSession = null;

  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch {
    session = null;
  }

  const user: TAuthUser = session?.user ?? null;

  const unreadNotificationsCountPromise = user
    ? countUnreadNotificationsForUserService(user.id).catch(() => 0)
    : Promise.resolve(0);

  const [siteSettings, unreadNotificationsCount] = await Promise.all([
    siteSettingsPromise,
    unreadNotificationsCountPromise,
  ]);

  const siteJsonLd = createSiteJsonLd();

  return (
    <html
      lang={SEO_SETTINGS.language}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full">
        <SeoJsonLd data={siteJsonLd} />

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />

          <TooltipProvider>
            <UserProvider user={user}>
              <EditModeProvider>
                <Navbar
                  initialUnreadNotificationsCount={unreadNotificationsCount}
                  siteName={siteSettings.shortName}
                />
                {children}
                <Footer siteSettings={siteSettings} />
              </EditModeProvider>
            </UserProvider>
          </TooltipProvider>
        </ThemeProvider>
        <UmamiAnalytics />
      </body>
    </html>
  );
}
