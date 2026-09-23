import ReactMarkdown from 'react-markdown';

type Props = {
  content: string;
};

export function LegalTermsMarkdown({ content }: Props) {
  return (
    <article className="text-base leading-8 text-muted-foreground sm:text-lg">
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
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
