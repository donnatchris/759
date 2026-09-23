import Image from 'next/image';
import type { SitePage } from '../lib/page-title.types';
import { EditPageImageAdminButton } from './edit-page-image-admin-button';

type Props = {
  page: Pick<SitePage, 'slug' | 'title' | 'image'>;
};

export function PageImage({ page }: Props) {
  if (!page.image) {
    return (
      <EditPageImageAdminButton
        pageImage={{ slug: page.slug, image: page.image }}
      />
    );
  }

  return (
    <section className="relative mx-auto mt-6 max-w-4xl">
      <div className="absolute top-2 right-2 z-10">
        <EditPageImageAdminButton
          pageImage={{ slug: page.slug, image: page.image }}
        />
      </div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-primary/10 bg-muted shadow-sm">
        <Image
          src={page.image}
          alt={page.title}
          fill
          sizes="(max-width: 768px) 100vw, 896px"
          className="object-cover"
        />
      </div>
    </section>
  );
}
