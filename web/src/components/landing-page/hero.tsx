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
      className="relative overflow-hidden bg-heritage-ink text-heritage-paper"
    >
      <div className="absolute right-4 top-4 z-20">
        <EditSiteSettingsAdminButton siteSettings={siteSettings} />
      </div>
      <div className="mx-auto grid max-w-[1600px] items-center lg:min-h-[620px] lg:grid-cols-[.85fr_1.15fr]">
        <div className="order-2 px-6 pb-12 pt-6 sm:px-12 lg:order-1 lg:py-20 lg:pl-16 xl:pl-24">
          <p className="mb-6 flex items-center gap-3 text-[.65rem] font-semibold uppercase tracking-[.24em] text-heritage-gold">
            <span className="h-px w-8 bg-current" />
            Le 7.59 · Pays catalan
          </p>
          <h1 className="max-w-xl font-heading text-[clamp(2.6rem,4.7vw,5rem)] leading-[1.02] tracking-[-.035em]">
            {sloganHead}
            {sloganAccent && (
              <span className="mt-2 block italic text-heritage-gold">
                {sloganAccent}
              </span>
            )}
            {sloganTail && <span className="mt-2 block">{sloganTail}</span>}
          </h1>
          <div className="mt-7 space-y-2 text-sm leading-6 text-heritage-paper/70">
            {activities.map((activity, index) => (
              <p key={index}>{activity}</p>
            ))}
          </div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-4">
            <Link
              href="/actualites"
              className="inline-flex min-h-12 items-center gap-3 rounded-sm border border-heritage-gold bg-heritage-gold px-5 py-3 text-xs font-semibold uppercase tracking-wider text-heritage-ink transition hover:bg-heritage-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-heritage-gold"
            >
              <CalendarDays className="size-4" />
              Nos rendez-vous
            </Link>
            <a
              href="#horaires"
              className="inline-flex min-h-12 items-center gap-3 border-b border-heritage-gold/40 py-3 text-sm text-heritage-paper transition hover:border-heritage-gold hover:text-heritage-gold focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Nous retrouver
              <ArrowDownRight className="size-4" />
            </a>
          </div>
        </div>
        <figure className="relative order-1 m-0 lg:order-2">
          <Image
            src="/hero.png"
            alt="Emblème doré réunissant fleur de lys et croix occitane, entre les couleurs françaises et catalanes"
            width={1672}
            height={941}
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="block h-auto w-full"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-heritage-ink via-transparent to-transparent lg:bg-gradient-to-r"
          />
        </figure>
      </div>
      <div className="border-y border-heritage-gold/25">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-6 py-5 sm:px-8">
          <p className="font-heading text-lg italic text-heritage-gold">
            Le goût du partage. La force des racines.
          </p>
          <p className="text-[.6rem] uppercase tracking-[.22em] text-heritage-paper/60">
            Terroir · Amitié · Transmission
          </p>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-6 sm:px-8">
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs [&_a]:text-heritage-paper/70 [&_a]:no-underline [&_a:hover]:text-heritage-gold">
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
              className="rounded-sm border border-heritage-gold/20 bg-transparent text-heritage-paper shadow-none [&_*]:text-heritage-paper/80"
            />
          )}
        </div>
      </div>
    </section>
  );
}
