import { SEO_SETTINGS } from '@/settings/settings.seo';
import { isHorairesEnabled, isBlogEnabled } from '@/settings/settings.helpers';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowDownRight,
  MapPin,
  Phone,
  Mail,
  CalendarDays,
} from 'lucide-react';
import { SiteSettings } from '@prisma/client';
import type { SocialMedia } from '@/features/social-media/lib/social-media.types';
import { SocialMediaList } from '../../features/social-media/components/social-media-list';
import { LinkWithIcon } from '@/components/custom-ui/link-with-icon';
import { EditSiteSettingsAdminButton } from '@/features/site-settings/components/edit-site-settings-admin-button';
import {
  GoogleRatingsCard,
  type TGoogleRatings,
} from '@/features/google-ratings';

type Props = {
  siteSettings: SiteSettings;
  socialMedias: SocialMedia[];
  googleRatings?: TGoogleRatings | null | undefined;
};

export function Hero({ siteSettings, socialMedias, googleRatings }: Props) {
  const {
    fullName,
    activities,
    sloganHead,
    sloganAccent,
    sloganTail,
    address,
    tel,
    mail,
  } = siteSettings;
  const phoneLink = tel
    ? `tel:+33${tel.replace(/\s+/g, '').replace(/^0/, '')}`
    : null;
  const addressLink = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null;
  const mailLink = mail ? `mailto:${mail}` : null;

  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden bg-heritage-ink text-heritage-paper"
    >
      <div className="absolute right-4 top-4 z-20">
        <EditSiteSettingsAdminButton siteSettings={siteSettings} />
      </div>
      <div className="relative min-h-full">
        <Image
          src="/uploads/tchin.png"
          alt="Un moment de convivialité autour d’une table au 7.59"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[65%_center]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-heritage-ink via-heritage-ink/90 to-heritage-ink/10"
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:px-10 sm:py-24 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
          <div className="relative z-10">
            <p className="mb-8 flex items-center gap-4 text-4xl font-bold uppercase tracking-[.24em] text-heritage-paper/80">
              <span
                aria-hidden="true"
                className="flex h-4 w-9 overflow-hidden border border-white/30"
              >
                <span className="flex-1 bg-heritage-ink" />
                <span className="flex-1 bg-heritage-paper" />
                <span className="flex-1 bg-heritage-red" />
              </span>
              {fullName}
            </p>
            <h1 className="mb-6 max-w-2xl text-xl font-semibold leading-snug sm:text-2xl">
              {SEO_SETTINGS.identity.heading}
            </h1>
            <p className="max-w-2xl font-heading text-[clamp(3rem,5.8vw,5.5rem)] font-semibold leading-[1.02] tracking-[-.04em]">
              {sloganHead}
              {sloganAccent && (
                <span className="mt-1 block italic text-heritage-gold">
                  {sloganAccent}
                </span>
              )}
              {sloganTail && <span className="mt-2 block">{sloganTail}</span>}
            </p>
            <p className="mt-7 max-w-xl text-sm leading-7 text-heritage-paper/80">
              {SEO_SETTINGS.identity.introduction}
            </p>
            <div className="mt-7 max-w-md space-y-2 text-sm leading-7 text-heritage-paper/80">
              {activities.map((activity, index) => (
                <p key={index}>{activity}</p>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-4">
              {isBlogEnabled() && (
                <Link
                  href="/#calendrier"
                  className="inline-flex min-h-12 items-center gap-3 rounded-sm border border-heritage-red bg-heritage-red px-6 py-3 text-sm font-semibold text-heritage-paper transition hover:bg-heritage-paper hover:text-heritage-ink focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  <CalendarDays className="size-4" />
                  Calendrier des événements
                </Link>
              )}
              {isHorairesEnabled() && (
                <a
                  href="#horaires"
                  className="inline-flex min-h-12 items-center gap-3 border-b border-heritage-paper/40 py-3 text-sm font-semibold transition hover:text-heritage-gold focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  Nos horaires
                  <ArrowDownRight className="size-4" />
                </a>
              )}
            </div>
          </div>
          {/* <aside className="relative ml-auto w-full max-w-xs border-l border-heritage-paper/30 pl-6 lg:mb-2">
						<p className="text-[.65rem] font-semibold uppercase tracking-[.2em] text-heritage-gold">
							Notre maison, nos racines
						</p>
						<p className="mt-4 font-brand text-3xl leading-tight">
							L’esprit français.
							<br />
							Le cœur catalan.
						</p>
						<p className="mt-4 text-sm leading-6 text-heritage-paper/75">
							Une table, des rencontres, des traditions à faire vivre ensemble.
						</p>
						<div
							aria-hidden="true"
							className="mt-6 flex h-1.5 w-36 bg-heritage-gold"
						>
							<span className="ml-4 w-4 bg-heritage-red" />
							<span className="ml-4 w-4 bg-heritage-red" />
							<span className="ml-4 w-4 bg-heritage-red" />
							<span className="ml-4 w-4 bg-heritage-red" />
						</div>
					</aside> */}
        </div>
      </div>
      <div className="border-b border-border bg-heritage-paper text-heritage-ink">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-6 py-5 sm:px-8">
          <p className="font-brand text-xl font-semibold text-heritage-ink sm:text-2xl">
            Un lieu pour se retrouver. Des racines à partager.
          </p>
          <p className="text-[.65rem] font-bold uppercase tracking-[.18em] text-heritage-red">
            Terroir · Amitié · Transmission
          </p>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-6 sm:px-8">
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs [&_a]:text-heritage-paper/80 [&_a]:no-underline [&_a:hover]:text-heritage-gold">
          {addressLink && (
            <LinkWithIcon href={addressLink} Icon={MapPin} text={address} />
          )}
          {phoneLink && (
            <LinkWithIcon href={phoneLink} Icon={Phone} text={tel} />
          )}
          {mailLink && <LinkWithIcon href={mailLink} Icon={Mail} text={mail} />}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SocialMediaList socialMedias={socialMedias} />
          {googleRatings && (
            <GoogleRatingsCard
              ratings={googleRatings}
              className="rounded-sm border border-heritage-paper/30 bg-heritage-paper text-heritage-ink shadow-none [&_*]:text-heritage-ink"
            />
          )}
        </div>
      </div>
    </section>
  );
}
