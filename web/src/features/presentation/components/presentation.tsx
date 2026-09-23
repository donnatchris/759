import type { TPresentation } from '../lib/presentation.types';
import { EditPresentationAdminButton } from './edit-presentation-admin-button';

type Props = {
  presentation: TPresentation;
};

export function Presentation({ presentation }: Props) {
  const { title, subTitle, content, footer } = presentation;

  return (
    <section className="relative px-6 py-20 sm:py-28">
      <div className="absolute right-5 top-8 z-20">
        <EditPresentationAdminButton presentation={presentation} />
      </div>
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
        <div>
          <p className="section-kicker mb-6">Un lieu, des liens, des racines</p>
          {title && <h2 className="section-title">{title}</h2>}
          {footer && (
            <p className="mt-8 border-l-2 border-heritage-gold pl-5 text-xs font-semibold uppercase leading-6 tracking-widest text-muted-foreground">
              {footer}
            </p>
          )}
        </div>
        <div className="relative border-t border-border pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
          {subTitle && (
            <h3 className="font-heading text-3xl italic leading-tight text-accent sm:text-4xl">
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
