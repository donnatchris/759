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
	createIconsMetadata,
	createLocalBusinessJsonLd,
	DEFAULT_SEO_DESCRIPTION,
	DEFAULT_SEO_TITLE,
	getMetadataBase,
	getSeoSiteSettings,
} from '@/features/seo/lib/seo-metadata';
import { UmamiAnalytics } from '@/features/analytics/umami-analytics';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
	const siteSettings = await getSeoSiteSettings();
	const title = siteSettings.seoTitle || DEFAULT_SEO_TITLE;
	const description = siteSettings.seoDescription || DEFAULT_SEO_DESCRIPTION;
	const metadataBase = getMetadataBase();
	const ogImage = siteSettings.ogImageUrl || '/placeholder.svg';

	return {
		...(metadataBase ? { metadataBase } : {}),

		title: {
			default: title,
			template: `%s | ${siteSettings.fullName}`,
		},

		alternates: {
			canonical: '/',
		},

		icons: createIconsMetadata(),

		description,
		applicationName: siteSettings.fullName,
		authors: [{ name: siteSettings.fullName }],
		creator: siteSettings.fullName,
		publisher: siteSettings.fullName,
		category: 'services',

		openGraph: {
			type: 'website',
			locale: 'fr_FR',
			siteName: siteSettings.fullName,
			title,
			description,
			url: '/',
			images: [
				{
					url: ogImage,
					width: 1200,
					height: 630,
					alt: `${siteSettings.seoTitle || DEFAULT_SEO_TITLE}`,
				},
			],
		},

		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [ogImage],
		},

		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				'max-image-preview': 'large',
				'max-snippet': -1,
				'max-video-preview': -1,
			},
		},
	};
}

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

	const localBusinessJsonLd = createLocalBusinessJsonLd(siteSettings);

	return (
		<html lang="fr" suppressHydrationWarning data-scroll-behavior="smooth">
			<body className="min-h-full">
				<script
					type="application/ld+json"
					suppressHydrationWarning
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(localBusinessJsonLd).replace(
							/</g,
							'\\u003c',
						),
					}}
				/>

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
