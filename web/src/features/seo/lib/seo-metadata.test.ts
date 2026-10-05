import nextConfig from '../../../../next.config';
import { SeoPagination } from '../components/seo-pagination';
import { parseSeoPage, getCollectionPath } from './seo-pagination';
import {
  createCollectionMetadata,
  createContentMetadata,
  createContentJsonLd,
  createBreadcrumbJsonLd,
  getContentDescription,
} from './seo-metadata';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SeoJsonLd } from '../components/seo-json-ld';
import assert from 'node:assert/strict';
import test from 'node:test';
import { SEO_SETTINGS } from '@/settings/settings.seo';
import { SETTINGS } from '@/settings/settings.current';
import {
  createPublicPageMetadata,
  createPrivateMetadata,
  createSiteJsonLd,
  getMetadataBase,
} from './seo-metadata';
import { createSeoSitemap as sitemap } from './seo-sitemap';
import robots from '@/app/robots';

// Les modules partagent la même configuration ; restaurer les valeurs après le test.
test('SEO : URLs, pages actives, robots, données structurées et exclusion privée', () => {
  const originalUrl = SEO_SETTINGS.siteUrl;
  const originalIndexing = SEO_SETTINGS.indexingEnabled;
  const originalBlog = SETTINGS.features.blog;
  try {
    SEO_SETTINGS.siteUrl = 'https://association.example/';
    SEO_SETTINGS.indexingEnabled = true;
    assert.equal(getMetadataBase().origin, 'https://association.example');
    const blog = createPublicPageMetadata('blog');
    assert.equal(blog.alternates?.canonical, '/blog');
    assert.equal(blog.description, SEO_SETTINGS.pages.blog.description);
    assert.equal((blog.openGraph as { url: string }).url, '/blog');
    assert.equal(
      (blog.twitter as { title: string }).title,
      (blog.title as { absolute: string }).absolute,
    );
    assert.deepEqual(
      sitemap().map((entry) => entry.url),
      [
        'https://association.example/',
        'https://association.example/blog',
        'https://association.example/evenements',
        'https://association.example/cgu',
      ],
    );
    assert.ok(sitemap().every((entry) => !entry.lastModified));
    assert.equal(robots().sitemap, 'https://association.example/sitemap.xml');
    SETTINGS.features.blog = false;
    assert.ok(!sitemap().some((entry) => entry.url.endsWith('/blog')));
    assert.equal(
      (createPublicPageMetadata('blog').robots as { index: boolean }).index,
      false,
    );
    assert.ok(
      (robots().rules as { disallow: string[] }).disallow.includes('/blog'),
    );
    const privateMetadata = createPrivateMetadata('auth');
    assert.equal((privateMetadata.robots as { index: boolean }).index, false);
    assert.equal(privateMetadata.alternates?.canonical, null);
    assert.equal(privateMetadata.openGraph, null);
    const graph = createSiteJsonLd()['@graph'];
    assert.deepEqual(
      graph.map((entry) => entry['@type']),
      ['Organization', 'WebSite'],
    );
    assert.ok(!JSON.stringify(graph).includes('LocalBusiness'));
    SEO_SETTINGS.indexingEnabled = false;
    assert.deepEqual(sitemap(), []);
    assert.deepEqual((robots().rules as { disallow: string[] }).disallow, [
      '/',
    ]);
    assert.equal(
      (createPublicPageMetadata('home').robots as { index: boolean }).index,
      false,
    );
    SEO_SETTINGS.indexingEnabled = true;
    SEO_SETTINGS.siteUrl = 'http://localhost:3000';
    assert.deepEqual(sitemap(), []);
    assert.equal(robots().sitemap, undefined);
    SEO_SETTINGS.siteUrl = 'not-a-url';
    assert.throws(() => getMetadataBase());
  } finally {
    SEO_SETTINGS.siteUrl = originalUrl;
    SEO_SETTINGS.indexingEnabled = originalIndexing;
    SETTINGS.features.blog = originalBlog;
  }
});

test('JSON-LD : échappe les balises sans altérer les données structurées', () => {
  const data = { name: '</script><script>alert(1)</script>' };
  const html = renderToStaticMarkup(createElement(SeoJsonLd, { data }));
  const payload = html.slice(
    html.indexOf('>') + 1,
    html.lastIndexOf('</script>'),
  );
  assert.ok(!payload.includes('<'));
  assert.deepEqual(JSON.parse(payload), data);
});

test('Noms 759 et 7.59 : texte visible, titre, aliases et localisation cohérents', () => {
  const graph = createSiteJsonLd()['@graph'];
  for (const name of ['759', '7.59']) {
    assert.ok(SEO_SETTINGS.pages.home.title.includes(name));
    assert.ok(SEO_SETTINGS.identity.heading.includes(name));
    assert.ok(SEO_SETTINGS.siteAlternateNames.includes(name));
    assert.ok(SEO_SETTINGS.organization.alternateName.includes(name));
  }
  assert.ok(
    SEO_SETTINGS.pages.home.description.includes('Pyrénées-Orientales (66)'),
  );
  assert.ok(SEO_SETTINGS.identity.introduction.includes('Canohès'));
  assert.deepEqual(graph[1].alternateName, SEO_SETTINGS.siteAlternateNames);
});

test('Pagination : liens HTML, canonique propre et paramètres invalides', () => {
  assert.equal(parseSeoPage(), 1);
  assert.equal(parseSeoPage('2'), 2);
  for (const value of [
    '0',
    '-1',
    '1.5',
    '2abc',
    '',
    '01',
    '1000001',
    ['2', '3'],
  ]) {
    assert.equal(parseSeoPage(value), null);
  }
  assert.equal(getCollectionPath('blog', 1), '/blog');
  assert.equal(
    createCollectionMetadata('blog', 2).alternates?.canonical,
    '/blog?page=2',
  );
  const html = renderToStaticMarkup(
    createElement(SeoPagination, {
      collection: 'blog',
      page: 2,
      hasNext: true,
    }),
  );
  assert.ok(html.includes('href="/blog"'));
  assert.ok(html.includes('href="/blog?page=3"'));
  assert.equal(
    renderToStaticMarkup(
      createElement(SeoPagination, {
        collection: 'blog',
        page: 1,
        hasNext: false,
      }),
    ),
    '',
  );
});

test('Fiches publiques : image propre, canonique, dates réelles, fil et sitemap', () => {
  const content = {
    id: 'article-759',
    title: 'Une rencontre du 7.59',
    subTitle: null,
    content: 'Une rencontre à Canohès. '.repeat(20),
    author: null,
    imageUrl: '/uploads/rencontre.png',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-02-01'),
  };
  const metadata = createContentMetadata('blog', content);
  assert.equal(metadata.alternates?.canonical, '/blog/article-759');
  assert.ok(
    getContentDescription(content).length <=
      SEO_SETTINGS.collections.descriptionMaxLength,
  );
  assert.deepEqual((metadata.openGraph as { images: unknown }).images, [
    { url: content.imageUrl, alt: content.title },
  ]);
  const article = createContentJsonLd('blog', content);
  assert.equal(article.dateModified, content.updatedAt.toISOString());
  assert.equal(article.articleBody, content.content);
  assert.ok(article.url.endsWith('/blog/article-759'));
  const crumbs = createBreadcrumbJsonLd('blog', {
    title: content.title,
    path: '/blog/article-759',
  });
  assert.equal(crumbs.itemListElement.length, 3);
  const entries = sitemap({ blog: [content], events: [] });
  assert.equal(
    entries.find((entry) => entry.url.endsWith('/blog/article-759'))
      ?.lastModified,
    content.updatedAt,
  );
  const originalBlog = SETTINGS.features.blog;
  try {
    SETTINGS.features.blog = false;
    assert.ok(
      !sitemap({ blog: [content], events: [] }).some((entry) =>
        entry.url.includes('/blog'),
      ),
    );
  } finally {
    SETTINGS.features.blog = originalBlog;
  }
});

test('Redirection www : même domaine que les métadonnées, auth lisible pour noindex', async () => {
  const redirects = await nextConfig.redirects!();
  assert.ok(
    redirects.some(
      (rule) => rule.destination === `${SEO_SETTINGS.siteUrl}/:path*`,
    ),
  );
  assert.ok(
    !(robots().rules as { disallow: string[] }).disallow.includes('/auth'),
  );
  assert.equal(
    (createPrivateMetadata('auth').robots as { index: boolean }).index,
    false,
  );
});
