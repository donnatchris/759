/* eslint-disable @typescript-eslint/no-require-imports -- Mock data boundaries before rendering the real page components. */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const Module = require('node:module');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const originalLoad = Module._load;
let calls = [];
let titleSuffix = '';
Module._load = function (request, parent, isMain) {
  if (request === '@/features/pages/lib/page-title.service')
    return {
      getCachedPageTitleService: async ({ slug }) => {
        calls.push(slug);
        return {
          slug,
          title: `Titre DB ${slug}${titleSuffix}`,
          subTitle: `Sous-titre DB ${slug}${titleSuffix}`,
        };
      },
    };
  if (request === '@/features/blog')
    return { CreateBlogPostAdminButton: () => null };
  if (request === '@/features/events')
    return { CreateEventAdminButton: () => null };
  if (request === '@/features/blog/lib/blog.service')
    return { getBlogPostsService: async () => ({ items: [], hasMore: false }) };
  if (request === '@/features/events/lib/events.service')
    return { getEventsService: async () => ({ items: [], hasMore: false }) };
  if (request === '@/features/blog/components/blog-post-card')
    return { BlogPostCard: () => null };
  if (request === '@/features/events/components/event-card')
    return { EventCard: () => null };
  if (request === '@/components/system/scroll-reveal')
    return { ScrollReveal: () => null };
  if (
    request === './edit-page-title-admin-button' &&
    parent.filename.endsWith('/page-title.tsx')
  )
    return {
      EditPageTitleAdminButton: ({ pageTitle }) =>
        React.createElement(
          'button',
          { 'data-edit-slug': pageTitle.slug },
          pageTitle.title,
        ),
    };
  return originalLoad.call(this, request, parent, isMain);
};
const { SETTINGS } = require('../src/settings/settings.current.ts');
const { SEO_SETTINGS } = require('../src/settings/settings.seo.ts');
for (const [slug, key] of [
  ['blog', 'blog'],
  ['evenements', 'events'],
]) {
  const page = require(`../src/app/(public)/${slug}/page.tsx`);
  test(`${slug}: DB headings and editing survive SEO configuration and DB title changes`, async () => {
    const originalFlag = SETTINGS.features[key];
    try {
      SETTINGS.features[key] = true;
      calls = [];
      const metadata = await page.generateMetadata({
        searchParams: Promise.resolve({}),
      });
      assert.equal(calls.length, 0);
      assert.equal(metadata.description, SEO_SETTINGS.pages[key].description);
      for (const suffix of ['', ' modifié']) {
        titleSuffix = suffix;
        const html = renderToStaticMarkup(
          await page.default({ searchParams: Promise.resolve({}) }),
        );
        assert.equal(
          html.match(/<h1[^>]*>(.*?)<\/h1>/)[1],
          `Titre DB ${slug}${suffix}`,
        );
        assert.ok(html.includes(`Sous-titre DB ${slug}${suffix}`));
        assert.ok(html.includes(`data-edit-slug="${slug}"`));
      }
      assert.deepEqual(calls, [slug, slug]);
      SETTINGS.features[key] = false;
      await assert.rejects(
        () => page.default({ searchParams: Promise.resolve({}) }),
        (error) => error.digest === 'NEXT_HTTP_ERROR_FALLBACK;404',
      );
      assert.deepEqual(calls, [slug, slug]);
    } finally {
      SETTINGS.features[key] = originalFlag;
      titleSuffix = '';
    }
  });
}
