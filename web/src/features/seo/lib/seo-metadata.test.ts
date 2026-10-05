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
import sitemap from '@/app/sitemap';
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
