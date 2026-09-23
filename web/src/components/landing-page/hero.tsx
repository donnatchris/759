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
      className="relative overflow-hidden bg-heritage-gold text-heritage-ink"
    >
      <div className="absolute right-4 top-4 z-20">
        <EditSiteSettingsAdminButton siteSettings={siteSettings} />
      </div>
      <div className="mx-auto grid max-w-[1440px] items-center gap-2 px-6 py-10 sm:px-10 lg:min-h-[680px] lg:grid-cols-[1fr_1fr] lg:py-14">
        <div className="relative z-10 pt-4 lg:pl-8">
          <p className="mb-7 flex w-fit items-center gap-3 rounded-full border-2 border-current px-4 py-2 text-[.65rem] font-bold uppercase tracking-[.14em]">
            <span className="h-px w-8 bg-current" />
            Le 7.59 · Pays catalan
          </p>
          <h1 className="max-w-2xl font-heading text-[clamp(3.5rem,6.7vw,6.8rem)] uppercase leading-[.94] tracking-[-.025em]">
            {sloganHead}
            {sloganAccent && (
              <span className="mt-1 block text-heritage-red">
                {sloganAccent}
              </span>
            )}
            {sloganTail && <span className="mt-2 block">{sloganTail}</span>}
          </h1>
          <div className="mt-7 max-w-md space-y-2 text-sm font-medium leading-6">
            {activities.map((activity, index) => (
              <p key={index}>{activity}</p>
            ))}
          </div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-4">
            <Link
              href="/actualites"
              className="inline-flex min-h-12 items-center gap-3 rounded-full border-2 border-heritage-ink bg-heritage-ink px-6 py-3 text-sm font-bold text-heritage-paper shadow-[4px_4px_0_var(--heritage-red)] transition hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <CalendarDays className="size-4" />
              Nos rendez-vous
            </Link>
            <a
              href="#horaires"
              className="inline-flex min-h-12 items-center gap-3 border-b-2 border-heritage-ink py-3 text-sm font-bold transition hover:text-heritage-red focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Nous retrouver
              <ArrowDownRight className="size-4" />
            </a>
          </div>
        </div>
        <figure className="relative m-0 mx-auto w-full max-w-[640px]">
          <Image
            src="/banquet-pop.svg"
            alt="Une tablée illustrée : nappe à carreaux, pain, fromage et vin à partager"
            width={720}
            height={720}
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="block h-auto w-full"
          />
        </figure>
      </div>
      <div className="border-y-2 border-heritage-ink bg-heritage-ink text-heritage-paper">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-6 py-5 sm:px-8">
          <p className="font-brand text-xl text-heritage-gold sm:text-2xl">
            Du pays. Du pain. Des copains.
          </p>
          <p className="text-[.65rem] font-bold uppercase tracking-[.18em] text-heritage-paper">
            Racines françaises · Cœur catalan
          </p>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-6 sm:px-8">
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs [&_a]:text-heritage-ink [&_a]:no-underline [&_a:hover]:text-heritage-red">
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
              className="rounded-full border-2 border-heritage-ink bg-heritage-paper text-heritage-ink shadow-none [&_*]:text-heritage-ink"
            />
          )}
        </div>
      </div>
    </section>
  );
}
