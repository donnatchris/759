import { EditPageTitleAdminButton } from './edit-page-title-admin-button';
import type { SitePage } from '../lib/page-title.types';

type Props = {
  pageTitle: Pick<SitePage, 'slug' | 'title' | 'subTitle'>;
};

export function PageTitle({ pageTitle }: Props) {
  const { slug, title, subTitle } = pageTitle;
  return (
    <section className="relative mb-10 rounded-[2rem] border-2 border-heritage-ink bg-secondary px-6 py-12 text-secondary-foreground shadow-[6px_6px_0_var(--primary)] sm:py-16">
      <div className="absolute top-2 right-2 z-10">
        <EditPageTitleAdminButton pageTitle={{ slug, title, subTitle }} />
      </div>
      <div className="mx-auto mb-5 flex w-fit items-center gap-3 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-secondary-foreground">
        <span className="h-px w-8 bg-heritage-gold" />
        Le 7.59
        <span className="h-px w-8 bg-secondary" />
      </div>
      <h1 className="mb-6 text-center font-heading text-6xl font-normal uppercase leading-none tracking-tight sm:text-8xl">
        {title}
      </h1>
      {subTitle && (
        <p className="mx-auto max-w-3xl whitespace-pre-line px-4 text-center text-base leading-7 text-secondary-foreground sm:text-lg animate-fade-in-on-scroll">
          {subTitle}
        </p>
      )}
    </section>
  );
}
