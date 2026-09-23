import type { TPresentation } from '../lib/presentation.types';
import { EditPresentationAdminButton } from './edit-presentation-admin-button';

type Props = {
  presentation: TPresentation;
};

export function Presentation({ presentation }: Props) {
  const { title, subTitle, content, footer } = presentation;

  return (
    <section className="relative bg-card px-6 py-20 sm:py-28">
      <div className="absolute right-5 top-8 z-20">
        <EditPresentationAdminButton presentation={presentation} />
      </div>
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <p className="section-kicker mb-6">L’association</p>
          {title && <h2 className="section-title">{title}</h2>}
          {footer && (
            <p className="mt-8 border-l-4 border-primary pl-5 text-xs font-semibold uppercase leading-6 tracking-widest text-muted-foreground">
              {footer}
            </p>
          )}
        </div>
        <div className="relative border-l-4 border-heritage-gold py-3 pl-7 sm:pl-10">
          {subTitle && (
            <h3 className="font-brand text-2xl leading-snug text-foreground sm:text-3xl">
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
