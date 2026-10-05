/* eslint-disable @typescript-eslint/no-require-imports -- Mock the database boundary before loading the server query. */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const Module = require('node:module');
const originalLoad = Module._load;
let calls = [];
let failDatabase = false;
const prisma = Object.fromEntries(
  ['blogPost', 'event'].map((model) => [
    model,
    {
      findUnique: async ({ where }) => {
        calls.push([model, 'findUnique', where.id]);
        return where.id === 'known'
          ? { id: 'known', title: 'Contenu public' }
          : null;
      },
      findMany: async (query) => {
        calls.push([model, 'findMany', query]);
        if (failDatabase) throw new Error('database unavailable');
        return [{ id: 'known', updatedAt: new Date('2026-01-01') }];
      },
    },
  ]),
);
Module._load = function (request, parent, isMain) {
  if (request === '@/lib/prisma/prisma') return { prisma };
  return originalLoad.call(this, request, parent, isMain);
};
const { SETTINGS } = require('../src/settings/settings.current.ts');
const {
  getPublicBlogPost,
  getPublicEvent,
  getPublicSitemapContent,
} = require('../src/features/seo/lib/seo-content.ts');
const sitemap = require('../src/app/sitemap.ts').default;

test('Public SEO queries respect feature flags and never request reservation or user data', async () => {
  const original = { ...SETTINGS.features };
  try {
    for (let mask = 0; mask < 4; mask++) {
      SETTINGS.features.blog = Boolean(mask & 1);
      SETTINGS.features.events = Boolean(mask & 2);
      calls = [];
      const content = await getPublicSitemapContent();
      assert.equal(content.blog.length, SETTINGS.features.blog ? 1 : 0);
      assert.equal(content.events.length, SETTINGS.features.events ? 1 : 0);
      assert.equal(
        calls.length,
        Number(SETTINGS.features.blog) + Number(SETTINGS.features.events),
      );
      for (const [, , query] of calls)
        assert.deepEqual(query.select, { id: true, updatedAt: true });
      calls = [];
      assert.equal(
        (await getPublicBlogPost('known'))?.id ?? null,
        SETTINGS.features.blog ? 'known' : null,
      );
      assert.equal(
        (await getPublicEvent('known'))?.id ?? null,
        SETTINGS.features.events ? 'known' : null,
      );
      assert.equal(
        calls.length,
        Number(SETTINGS.features.blog) + Number(SETTINGS.features.events),
      );
    }
    SETTINGS.features.blog = true;
    assert.equal(await getPublicBlogPost('missing'), null);
    const entries = await sitemap();
    assert.ok(entries.some((entry) => entry.url.endsWith('/blog/known')));
    failDatabase = true;
    await assert.rejects(() => sitemap(), /database unavailable/);
  } finally {
    Object.assign(SETTINGS.features, original);
    failDatabase = false;
    Module._load = originalLoad;
  }
});
