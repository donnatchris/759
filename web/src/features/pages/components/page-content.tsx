import ReactMarkdown from 'react-markdown';
import type { SitePage } from '../lib/page-title.types';
import { EditPageContentAdminButton } from './edit-page-content-admin-button';

type Props = {
  page: Pick<SitePage, 'slug' | 'content'>;
};

export function PageContent({ page }: Props) {
  const markdown = page.content?.trim();

  return (
    <section className="relative">
      <div className="absolute top-2 right-2 z-10">
        <EditPageContentAdminButton
          pageContent={{ slug: page.slug, content: page.content }}
        />
      </div>
      {markdown && (
        <article className="mx-auto text-base leading-8 text-muted-foreground sm:text-lg">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h2 className="mb-6 font-brand text-4xl font-bold tracking-wide text-primary sm:text-5xl">
                  {children}
                </h2>
              ),
              h2: ({ children }) => (
                <h3 className="mt-10 text-2xl font-semibold text-primary">
                  {children}
                </h3>
              ),
              h3: ({ children }) => (
                <h4 className="mt-8 text-xl font-semibold text-foreground">
                  {children}
                </h4>
              ),
              p: ({ children }) => <p className="mt-4">{children}</p>,
              ul: ({ children }) => (
                <ul className="mt-4 list-disc space-y-2 pl-6">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="mt-4 list-decimal space-y-2 pl-6">{children}</ol>
              ),
              li: ({ children }) => <li>{children}</li>,
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground">
                  {children}
                </strong>
              ),
              a: ({ children, href }) => (
                <a
                  href={href}
                  className="mt-6 inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  {children}
                </a>
              ),
            }}
          >
            {markdown}
          </ReactMarkdown>
        </article>
      )}
    </section>
  );
}
