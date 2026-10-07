import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import type { TAuthUser } from '@/features/auth/auth.types';
import { isSignUpEnabled } from '@/settings/settings.helpers';

type Props = {
  user: TAuthUser;
};

export function SignupInvitation({ user }: Props) {
  if (!isSignUpEnabled() || user) return null;

  return (
    <section className="px-4 py-4" aria-labelledby="signup-invitation-title">
      <div className="container relative mx-auto flex max-w-6xl flex-col gap-6 overflow-hidden rounded-lg border-l-4 border-heritage-red bg-heritage-ink px-6 py-6 text-heritage-paper sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8">
        <div className="flex items-start gap-5 sm:items-center">
          <div
            className="hidden size-16 shrink-0 -rotate-6 items-center justify-center rounded-sm border-2 border-dashed border-heritage-paper/30 text-heritage-paper/70 sm:flex"
            aria-hidden="true"
          >
            <Mail className="size-8" strokeWidth={1.5} />
          </div>
          <div>
            <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-heritage-paper/70">
              Gardons le contact
            </p>
            <h2
              id="signup-invitation-title"
              className="font-heading text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
            >
              Les nouvelles du 7.59,
              <br />
              <span className="italic">directement chez vous.</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-heritage-paper/80">
              Événements, rendez-vous, vie de l'association… Créez votre compte
              et acceptez de recevoir nos mails lors de l&apos;inscription pour
              être tenu informé de toutes nos actualités.
            </p>
          </div>
        </div>
        <Link
          href="/auth/sign-up"
          className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-4 self-start rounded-sm bg-heritage-red px-6 py-3 text-sm font-semibold text-heritage-paper transition-colors hover:bg-heritage-paper hover:text-heritage-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-heritage-paper sm:self-auto"
        >
          Créer mon compte
          <ArrowRight
            className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  );
}
