/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS is required to mock module loading before importing server modules. */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const Module = require('node:module');
const originalLoad = Module._load;
let databaseCalls = 0;
let cacheCalls = 0;
let invalidations = 0;
let authCalls = 0;
const prisma = new Proxy(
  {},
  {
    get: (_, model) =>
      new Proxy(
        {},
        {
          get: (_, operation) => async () => {
            databaseCalls++;
            if (operation === 'aggregate')
              return { _count: { id: 0 }, _max: { updatedAt: null } };
            if (operation === 'findMany') return [];
            if (operation === 'findFirst') return null;
            if (model === 'openingException' && operation === 'findUnique')
              return null;
            return {};
          },
        },
      ),
  },
);
// Replace external boundaries; exercise the actual guards, repositories,
// services, action wrappers, sitemap and metadata generators.
Module._load = function (request, parent, isMain) {
  if (request === '@/lib/prisma/prisma') return { prisma };
  if (request === '@/lib/resend/resend') return { resend: {} };
  if (request === 'server-only') return {};
  if (request === 'next/cache')
    return {
      unstable_cache: () => async () => {
        cacheCalls++;
        return ['cached'];
      },
      updateTag: () => {
        invalidations++;
      },
      revalidatePath: () => {
        invalidations++;
      },
    };
  if (request === '@/features/core')
    return {
      ...require('../src/features/core/error/error.AppError.ts'),
      ...require('../src/features/core/error/error.handling.ts'),
      ...require('../src/features/core/server/server.service.ts'),
      ...require('../src/features/core/server/server.action.ts'),
      ...require('../src/features/core/validation/zod-helpers.ts'),
    };
  if (request.startsWith('@/features/auth/server/require-'))
    return {
      requireAdminOrThrow: async () => {
        authCalls++;
        return { user: { id: 'admin', role: 'ADMIN' } };
      },
      requireStaffOrThrow: async () => {
        authCalls++;
      },
    };
  if (
    [
      '@/features/auth/auth',
      '@/features/permission/lib/permission.service',
      '@/features/legal-terms/lib/legal-terms.service',
      '@/features/notifications/lib/notifications.service',
    ].includes(request)
  )
    return {};
  if (request === '@/features/pages/lib/page-title.service')
    return {
      getCachedPageTitleService: async () => {
        databaseCalls++;
        return { title: 'Test' };
      },
    };
  if (request === '@/features/seo/lib/seo-metadata')
    return {
      getSeoSiteSettings: async () => {
        databaseCalls++;
        return { fullName: 'Test' };
      },
      createPublicPageMetadata: (_, data) => data,
    };
  return originalLoad.call(this, request, parent, isMain);
};
const { SETTINGS } = require('../src/settings/settings.current.ts');
const { AppError } = require('../src/features/core/error/error.AppError.ts');
const modules = [
  ['prestations', 'services'],
  ['menu', 'dishes'],
  ['blog', 'blog'],
  ['events', 'events'],
].map(([flag, feature]) => ({
  flag,
  route: flag === 'events' ? 'evenements' : flag,
  repository: require(
    `../src/features/${feature}/lib/${feature}.repository.ts`,
  ),
  service: require(`../src/features/${feature}/lib/${feature}.service.ts`),
  action: require(`../src/features/${feature}/lib/${feature}.action.ts`),
  metadata: require(
    `../src/app/(public)/${flag === 'events' ? 'evenements' : flag}/layout.tsx`,
  ).generateMetadata,
}));
const reservations = require('../src/features/reservations/lib/reservations.service.ts');
const reservationRepository = require('../src/features/reservations/lib/reservations.repository.ts');
const sitemap = require('../src/app/sitemap.ts').default;
const { proxy } = require('../src/proxy.ts');
const { NextRequest } = require('next/server');
const {
  getNotificationAction,
} = require('../src/features/notifications/lib/notifications.ui.ts');
const disabled = (error) =>
  error instanceof AppError && error.code === 'FEATURE_DISABLED';
const originalFlags = { ...SETTINGS.features };

test('all sixteen combinations enforce disabled modules before database, cache and validation', async (t) => {
  t.mock.method(console, 'error', () => {});
  try {
    for (let mask = 0; mask < 16; mask++) {
      modules.forEach(({ flag }, index) => {
        SETTINGS.features[flag] = Boolean(mask & (1 << index));
      });
      const routes = sitemap().map((route) => new URL(route.url).pathname);
      for (const featureModule of modules) {
        assert.equal(
          routes.includes('/' + featureModule.route),
          SETTINGS.features[featureModule.flag],
        );
        const response = proxy(
          new NextRequest('http://localhost/' + featureModule.route),
        );
        assert.equal(
          response.status,
          SETTINGS.features[featureModule.flag] ? 200 : 404,
        );
        if (SETTINGS.features[featureModule.flag]) {
          const before = databaseCalls;
          await featureModule.metadata();
          assert.equal(databaseCalls, before + 2);
          const read = Object.entries(featureModule.service).find(
            ([name]) =>
              name.startsWith('getAll') ||
              name.startsWith('getMaxFive') ||
              (featureModule.flag === 'blog' && name.startsWith('getLatest')),
          )[1];
          assert.deepEqual(
            await read(),
            featureModule.flag === 'blog' ? null : [],
          );
          assert.equal(databaseCalls, before + 3);
          continue;
        }
        const before = [databaseCalls, cacheCalls, authCalls, invalidations];
        for (const layer of ['repository', 'service']) {
          for (const [name, fn] of Object.entries(featureModule[layer])) {
            if (typeof fn !== 'function' || name.includes('Ressources'))
              continue;
            await assert.rejects(() => fn(undefined), disabled, name);
          }
        }
        for (const [name, fn] of Object.entries(featureModule.action)) {
          if (typeof fn !== 'function' || name.includes('Ressources')) continue;
          assert.deepEqual(
            await fn(undefined),
            { success: false, error: 'FEATURE_DISABLED' },
            name,
          );
        }
        await assert.rejects(
          featureModule.metadata,
          (error) => error.digest === 'NEXT_HTTP_ERROR_FALLBACK;404',
        );
        assert.deepEqual(
          [databaseCalls, cacheCalls, authCalls, invalidations],
          before,
        );
      }
      assert.equal(
        getNotificationAction('BLOG_POST_ANNOUNCEMENT', 'ADMIN') === null,
        !SETTINGS.features.blog,
      );
    }
  } finally {
    Object.assign(SETTINGS.features, originalFlags);
  }
});

test('cached reads work when enabled and are rejected after disabling, without touching cache', async () => {
  try {
    for (const featureModule of modules.slice(0, 2)) {
      const cached = Object.entries(featureModule.service).find(([name]) =>
        name.startsWith('getCached'),
      )[1];
      SETTINGS.features[featureModule.flag] = true;
      assert.deepEqual(await cached(), ['cached']);
      SETTINGS.features[featureModule.flag] = false;
      const before = cacheCalls;
      await assert.rejects(cached, disabled);
      assert.equal(cacheCalls, before);
    }
  } finally {
    Object.assign(SETTINGS.features, originalFlags);
  }
});

test('new bookings and preparation are blocked but existing reservation and shared resource reads remain available', async () => {
  try {
    SETTINGS.features.prestations = false;
    const before = databaseCalls;
    for (const name of [
      'getReservationAvailabilityService',
      'getReservationWeekAvailabilityService',
      'getReservableServiceOptionsService',
      'createReservationService',
      'createAdminReservationService',
    ]) {
      await assert.rejects(() => reservations[name](undefined), disabled);
    }
    for (const name of [
      'getReservableServiceFromPrismaRepository',
      'getReservableServiceOptionsFromPrismaRepository',
      'createReservationInPrismaRepository',
      'createAdminReservationInPrismaRepository',
    ]) {
      await assert.rejects(
        () => reservationRepository[name](undefined),
        disabled,
      );
    }
    assert.equal(databaseCalls, before);
    await reservationRepository.getReservationsCalendarFromPrismaRepository({
      start: new Date(),
      end: new Date(),
    });
    await modules[0].repository.getRessourcesFromPrismaRepository();
    assert.equal(databaseCalls, before + 2);
  } finally {
    Object.assign(SETTINGS.features, originalFlags);
  }
});

test('MoreInfos renders only enabled links and no empty section across all combinations', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const {
    MoreInfos,
  } = require('../src/components/landing-page/more-infos.tsx');
  try {
    for (let mask = 0; mask < 16; mask++) {
      modules.forEach(({ flag }, index) => {
        SETTINGS.features[flag] = Boolean(mask & (1 << index));
      });
      const html = renderToStaticMarkup(React.createElement(MoreInfos));
      assert.equal(
        html.includes('href="/prestations"'),
        SETTINGS.features.prestations,
      );
      assert.equal(html.includes('href="/blog"'), SETTINGS.features.blog);
      assert.equal(
        html.includes('h-5 w-px shrink-0'),
        SETTINGS.features.prestations && SETTINGS.features.blog,
      );
      if (!SETTINGS.features.prestations && !SETTINGS.features.blog)
        assert.equal(html, '');
    }
  } finally {
    Object.assign(SETTINGS.features, originalFlags);
  }
});

test('horaires blocks reads, writes, caches and presentation while preserving shared reservation data', async (t) => {
  t.mock.method(console, 'error', () => {});
  const openingRepository = require('../src/features/opening-slots/lib/opening-slots.repository.ts');
  const openingService = require('../src/features/opening-slots/lib/opening-slots.service.ts');
  const openingActions = require('../src/features/opening-slots/lib/opening-slots.action.ts');
  const presentationRepository = require('../src/features/presentation/lib/presentation.repository.ts');
  const presentationService = require('../src/features/presentation/lib/presentation.service.ts');
  const presentationActions = require('../src/features/presentation/lib/presentation.action.ts');
  try {
    SETTINGS.features.horaires = true;
    assert.deepEqual(await openingService.getAllOpeningSlotsService(), []);
    assert.deepEqual(await openingService.getCachedAllOpeningSlotsService(), [
      'cached',
    ]);
    assert.deepEqual(
      await openingService.getCachedNextOpeningClosurePeriodsService(),
      ['cached'],
    );
    assert.deepEqual(
      await presentationService.getCachedOpeningSlotsPresentationService(),
      ['cached'],
    );
    assert.deepEqual(
      await presentationService.getCachedPresentationService('opening-slots'),
      ['cached'],
    );

    SETTINGS.features.horaires = false;
    const before = [databaseCalls, cacheCalls, authCalls, invalidations];
    for (const layer of [openingRepository, openingService]) {
      for (const [name, fn] of Object.entries(layer)) {
        if (typeof fn === 'function')
          await assert.rejects(() => fn(undefined), disabled, name);
      }
    }
    for (const [name, fn] of Object.entries(openingActions)) {
      assert.deepEqual(
        await fn(undefined),
        { success: false, error: 'FEATURE_DISABLED' },
        name,
      );
    }
    for (const name of [
      'getOpeningSlotsPresentationService',
      'getCachedOpeningSlotsPresentationService',
      'updateOpeningSlotsPresentationService',
    ]) {
      await assert.rejects(
        () => presentationService[name](undefined),
        disabled,
        name,
      );
    }
    await assert.rejects(
      () => presentationService.getPresentationService('opening-slots'),
      disabled,
    );
    await assert.rejects(
      () => presentationService.getCachedPresentationService('opening-slots'),
      disabled,
    );
    await assert.rejects(
      () =>
        presentationRepository.getPresentationFromPrismaRepository(
          'opening-slots',
        ),
      disabled,
    );
    await assert.rejects(
      () =>
        presentationRepository.updatePresentationInPrismaRepository(
          undefined,
          'opening-slots',
        ),
      disabled,
    );
    assert.deepEqual(
      await presentationActions.updateOpeningSlotsPresentation(undefined),
      { success: false, error: 'FEATURE_DISABLED' },
    );
    assert.deepEqual(
      [databaseCalls, cacheCalls, authCalls, invalidations],
      before,
    );

    // The unrelated presentation and persisted booking rules remain accessible.
    await presentationService.getPresentationService();
    await presentationService.getCachedPresentationService();
    await reservationRepository.getOpeningWindowsFromPrismaRepository(
      '2026-10-05',
      1,
    );
    await reservationRepository.getReservationsCalendarFromPrismaRepository({
      start: new Date(),
      end: new Date(),
    });
    assert.ok(databaseCalls > before[0]);
  } finally {
    Object.assign(SETTINGS.features, originalFlags);
  }
});

test('opening-hours section disappears when disabled and renders again when enabled', () => {
  const loadWithBoundaries = Module._load;
  Module._load = function (request, parent, isMain) {
    if (request === './edit-opening-slots-admin-button')
      return { EditOpeningSlotsAdminButton: () => null };
    if (request === './edit-opening-slots-presentation-admin-button')
      return { EditOpeningSlotsPresentationAdminButton: () => null };
    return loadWithBoundaries.call(this, request, parent, isMain);
  };
  try {
    const {
      OpeningSlots,
    } = require('../src/features/opening-slots/components/opening-slots.tsx');
    const { renderToStaticMarkup } = require('react-dom/server');
    SETTINGS.features.horaires = false;
    assert.equal(OpeningSlots({}), null);
    SETTINGS.features.horaires = true;
    const html = renderToStaticMarkup(
      OpeningSlots({
        openingSlots: [],
        openingClosures: [],
        presentation: {
          title: 'Nos horaires',
          subTitle: null,
          content: null,
          footer: null,
        },
      }),
    );
    assert.ok(html.includes('Nos horaires'));
    assert.ok(html.includes('Sur événement'));
  } finally {
    Module._load = loadWithBoundaries;
    Object.assign(SETTINGS.features, originalFlags);
  }
});

test('public closure calendar requires no authentication, validates ranges and respects horaires', async (t) => {
  t.mock.method(console, 'error', () => {});
  const service = require('../src/features/opening-slots/lib/opening-slots.service.ts');
  const previous = SETTINGS.features.horaires;
  const beforeAuth = authCalls;
  try {
    SETTINGS.features.horaires = true;
    assert.deepEqual(
      await service.getPublicOpeningClosureCalendarEventsService({
        start: '2026-10-01T00:00:00.000Z',
        end: '2026-11-01T00:00:00.000Z',
      }),
      [],
    );
    assert.equal(authCalls, beforeAuth);
    const beforeDb = databaseCalls;
    for (const range of [
      { start: 'invalid', end: '2026-11-01T00:00:00.000Z' },
      { start: '2026-11-01T00:00:00.000Z', end: '2026-10-01T00:00:00.000Z' },
      { start: '2026-10-01T00:00:00.000Z', end: '2028-10-01T00:00:00.000Z' },
    ])
      await assert.rejects(() =>
        service.getPublicOpeningClosureCalendarEventsService(range),
      );
    SETTINGS.features.horaires = false;
    await assert.rejects(() =>
      service.getPublicOpeningClosureCalendarEventsService({
        start: '2026-10-01T00:00:00.000Z',
        end: '2026-11-01T00:00:00.000Z',
      }),
    );
    assert.equal(databaseCalls, beforeDb);
    assert.equal(authCalls, beforeAuth);
  } finally {
    SETTINGS.features.horaires = previous;
  }
});
