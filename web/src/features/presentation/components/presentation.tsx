import type { TPresentation } from '../lib/presentation.types';
import { EditPresentationAdminButton } from './edit-presentation-admin-button';

type Props = {
  presentation: TPresentation;
};

export function Presentation({ presentation }: Props) {
  const { title, subTitle, content, footer } = presentation;

  return (
    <section className="relative bg-secondary px-6 py-16 sm:py-24">
      <div className="absolute right-5 top-8 z-20">
        <EditPresentationAdminButton presentation={presentation} />
      </div>
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <p className="section-kicker mb-6">L’esprit de la maison</p>
          {title && <h2 className="section-title">{title}</h2>}
          {footer && (
            <p className="mt-8 border-l-4 border-primary pl-5 text-xs font-semibold uppercase leading-6 tracking-widest text-muted-foreground">
              {footer}
            </p>
          )}
        </div>
        <div className="relative rounded-[2rem_2rem_2rem_.25rem] border-2 border-primary bg-card p-7 shadow-[7px_7px_0_var(--primary)] sm:p-10">
          {subTitle && (
            <h3 className="font-brand text-3xl leading-tight text-accent sm:text-4xl">
              {subTitle}
            </h3>
          )}
          {content && (
            <p className="mt-7 whitespace-pre-line text-base leading-8 text-muted-foreground">
              {content}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
