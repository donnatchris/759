/* eslint-disable @typescript-eslint/no-require-imports -- Mock external boundaries before loading server modules. */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const Module = require('node:module');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const originalLoad = Module._load;
let stored = [];
let exception = null;
const tx = {
  openingSlot: {
    deleteMany: async () => {
      stored = [];
    },
    createMany: async ({ data }) => {
      stored = data.map((slot, index) => ({ id: index + 1, ...slot }));
    },
    findMany: async () => stored,
  },
};
const prisma = {
  ...tx,
  $transaction: async (fn) => fn(tx),
  openingException: { findUnique: async () => exception },
};
Module._load = function (request, parent, isMain) {
  if (request === '@/lib/prisma/prisma') return { prisma };
  if (request === 'server-only') return {};
  if (request.endsWith('/edit-opening-slots-admin-button'))
    return { EditOpeningSlotsAdminButton: () => null };
  if (request.endsWith('/edit-opening-slots-presentation-admin-button'))
    return { EditOpeningSlotsPresentationAdminButton: () => null };
  if (request.endsWith('/opening-slots.action'))
    return {
      updateAllOpeningSlotsAction: async () => ({
        success: true,
        data: stored,
      }),
    };
  if (request === '@/features/core')
    return {
      ...require('../src/features/core/error/error.AppError.ts'),
      ...require('../src/features/core/error/error.handling.ts'),
      ...require('../src/features/core/validation/zod-helpers.ts'),
    };
  return originalLoad.call(this, request, parent, isMain);
};
const { SETTINGS } = require('../src/settings/settings.current.ts');
SETTINGS.features.horaires = true;
const {
  updateOpeningSlotsSchema: schema,
} = require('../src/features/opening-slots/lib/opening-slots.schema.ts');
const {
  getOpeningSlotFormRows: rows,
  formatOpeningSlot: format,
} = require('../src/features/opening-slots/lib/opening-slots.types.ts');
const {
  updateAllOpeningSlotsInPrismaRepository: save,
} = require('../src/features/opening-slots/lib/opening-slots.repository.ts');
const {
  getOpeningWindowsFromPrismaRepository: windows,
} = require('../src/features/reservations/lib/reservations.repository.ts');
const {
  OpeningSlots,
} = require('../src/features/opening-slots/components/opening-slots.tsx');
const {
  UpdateOpeningSlotsForm,
} = require('../src/features/opening-slots/components/update-opening-slots.form.tsx');
const payload = (first = {}, second = {}) => {
  const data = { slots: rows([]) };
  data.slots[1].slots = [first, second].map((slot) => ({
    isOpen: true,
    label: '',
    opensAt: '',
    closesAt: '',
    ...slot,
  }));
  return data;
};
const presentation = {
  title: 'Nos horaires',
  subTitle: '',
  content: 'Bienvenue',
  footer: 'Contactez-nous',
};
const render = (slots) =>
  renderToStaticMarkup(
    React.createElement(OpeningSlots, {
      openingSlots: slots,
      openingClosures: [],
      presentation,
    }),
  );

test('optional labels and paired hours validate limits, midnight, order and overlap', () => {
  assert.equal(
    schema.parse(payload({ label: '  Sur réservation  ' })).slots[1].slots[0]
      .label,
    'Sur réservation',
  );
  for (const slot of [
    {},
    { label: 'x'.repeat(30) },
    { label: '   ' },
    { opensAt: '00:00', closesAt: '01:00' },
    { opensAt: '19:00', closesAt: '24:00' },
  ]) {
    assert.equal(schema.safeParse(payload(slot)).success, true);
  }
  for (const slot of [
    { label: 'x'.repeat(31) },
    { opensAt: '12:00' },
    { closesAt: '14:00' },
    { opensAt: '14:00', closesAt: '12:00' },
    { opensAt: '12:00', closesAt: '12:00' },
    { opensAt: '24:00', closesAt: '24:00' },
    { opensAt: 'bad', closesAt: '14:00' },
  ]) {
    assert.equal(schema.safeParse(payload(slot)).success, false);
  }
  const lunch = { opensAt: '12:00', closesAt: '14:00' };
  assert.equal(
    schema.safeParse(payload(lunch, { opensAt: '13:00', closesAt: '15:00' }))
      .success,
    false,
  );
  for (const slot of [
    { label: 'Sur réservation' },
    { opensAt: '14:00', closesAt: '15:00' },
    { isOpen: false, opensAt: '13:00', closesAt: '15:00' },
  ]) {
    assert.equal(schema.safeParse(payload(lunch, slot)).success, true);
  }
});

test('save and reopen preserve labels, optional hours and positions; empty and disabled rows disappear', async () => {
  const saved = await save(
    schema.parse(
      payload(
        { label: '  Déjeuner  ', opensAt: '12:00', closesAt: '14:00' },
        { label: 'Sur réservation' },
      ),
    ),
  );
  assert.deepEqual(saved, [
    {
      id: 1,
      dayOfWeek: 1,
      slotIndex: 1,
      label: 'Déjeuner',
      opensAtMinute: 720,
      closesAtMinute: 840,
    },
    {
      id: 2,
      dayOfWeek: 1,
      slotIndex: 2,
      label: 'Sur réservation',
      opensAtMinute: null,
      closesAtMinute: null,
    },
  ]);
  assert.deepEqual(rows(saved)[1].slots, [
    { isOpen: true, label: 'Déjeuner', opensAt: '12:00', closesAt: '14:00' },
    { isOpen: true, label: 'Sur réservation', opensAt: '', closesAt: '' },
  ]);
  assert.deepEqual(rows(saved)[0].slots[0], {
    isOpen: false,
    label: '',
    opensAt: '',
    closesAt: '',
  });
  await save(
    schema.parse(
      payload(
        { label: '   ' },
        { isOpen: false, label: 'Masqué', opensAt: '12:00', closesAt: '14:00' },
      ),
    ),
  );
  assert.deepEqual(stored, []);
  const legacy = [
    {
      id: 9,
      dayOfWeek: 5,
      slotIndex: 1,
      label: null,
      opensAtMinute: 1140,
      closesAtMinute: 1440,
    },
  ];
  const preserved = await save(schema.parse({ slots: rows(legacy) }));
  assert.equal(preserved[0].opensAtMinute, 1140);
  assert.equal(preserved[0].closesAtMinute, 1440);
  assert.equal(preserved[0].label, null);
});

test('display supports three variants, preserves ordering and marks empty days closed', () => {
  const slots = [
    {
      id: 2,
      dayOfWeek: 1,
      slotIndex: 2,
      label: 'Sur réservation',
      opensAtMinute: null,
      closesAtMinute: null,
    },
    {
      id: 1,
      dayOfWeek: 1,
      slotIndex: 1,
      label: 'Déjeuner',
      opensAtMinute: 720,
      closesAtMinute: 840,
    },
    {
      id: 3,
      dayOfWeek: 2,
      slotIndex: 1,
      label: null,
      opensAtMinute: 0,
      closesAtMinute: 60,
    },
    {
      id: 4,
      dayOfWeek: 3,
      slotIndex: 1,
      label: '   ',
      opensAtMinute: null,
      closesAtMinute: null,
    },
  ];
  assert.equal(format(slots[0]), 'Sur réservation');
  assert.equal(format(slots[1]), 'Déjeuner - 12h00 - 14h00');
  assert.equal(format(slots[2]), '00h00 - 01h00');
  const html = render(slots);
  assert.ok(html.includes('Lundi') && html.includes('Mardi'));
  assert.ok(
    html.includes('Mercredi') &&
      html.includes('Dimanche') &&
      !html.includes('Sur événement'),
  );
  assert.ok(html.indexOf('Déjeuner') < html.indexOf('Sur réservation'));
  const empty = render([]);
  assert.ok(empty.includes('divide-y'));
  assert.equal((empty.match(/>Fermé</g) || []).length, 7);
  assert.equal((html.match(/>Fermé</g) || []).length, 5);
  assert.ok(
    empty.includes('Nos horaires') &&
      empty.includes('Bienvenue') &&
      empty.includes('Contactez-nous'),
  );
});

test('label-only slots never create availability; exceptions retain precedence', async () => {
  stored = [
    { label: 'Sur réservation', opensAtMinute: null, closesAtMinute: null },
    { label: null, opensAtMinute: 0, closesAtMinute: 60 },
    { label: 'Déjeuner', opensAtMinute: 720, closesAtMinute: 840 },
  ];
  assert.deepEqual(await windows('2099-01-05', 1), [
    { opensAtMinute: 0, closesAtMinute: 60 },
    { opensAtMinute: 720, closesAtMinute: 840 },
  ]);
  stored = [stored[0]];
  assert.deepEqual(await windows('2099-01-05', 1), []);
  exception = { isClosed: true, slots: [] };
  assert.deepEqual(await windows('2099-01-05', 1), []);
  exception = {
    isClosed: false,
    slots: [{ opensAtMinute: 600, closesAtMinute: 660 }],
  };
  assert.deepEqual(await windows('2099-01-05', 1), [
    { opensAtMinute: 600, closesAtMinute: 660 },
  ]);
  exception = null;
});

test('form keeps seven days and two activation controls per day, with label length limits', () => {
  const html = renderToStaticMarkup(
    React.createElement(UpdateOpeningSlotsForm, { values: [] }),
  );
  assert.equal((html.match(/type="checkbox"/g) || []).length, 14);
  assert.equal((html.match(/maxLength="30"/g) || []).length, 14);
  assert.equal((html.match(/type="time"/g) || []).length, 28);
  assert.ok(html.includes('Aucun créneau à afficher ce jour.'));
  const midnight = renderToStaticMarkup(
    React.createElement(UpdateOpeningSlotsForm, {
      values: [
        {
          id: 1,
          dayOfWeek: 5,
          slotIndex: 1,
          label: null,
          opensAtMinute: 1140,
          closesAtMinute: 1440,
        },
      ],
    }),
  );
  assert.ok(midnight.includes('value="19:00"'));
  assert.ok(midnight.includes('value="00:00"'));
  assert.ok(!midnight.includes('value="24:00"'));
});
