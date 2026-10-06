/* eslint-disable @typescript-eslint/no-require-imports -- Mock server actions and calendar boundaries to exercise the public feed. */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const Module = require('node:module');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const {
  toPublicOpeningSlotCalendarEvents: expand,
} = require('../src/features/opening-slots/lib/opening-slots.calendar.ts');
const slots = [
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
  {
    id: 3,
    dayOfWeek: 5,
    slotIndex: 1,
    label: null,
    opensAtMinute: 1140,
    closesAtMinute: 1440,
  },
  {
    id: 4,
    dayOfWeek: 2,
    slotIndex: 1,
    label: null,
    opensAtMinute: 0,
    closesAtMinute: 60,
  },
  {
    id: 5,
    dayOfWeek: 3,
    slotIndex: 1,
    label: '   ',
    opensAtMinute: null,
    closesAtMinute: null,
  },
];
const closures = [
  {
    id: 'closure',
    label: 'Congés',
    startDate: '2026-03-30',
    endDate: '2026-04-03',
    start: '2026-03-30',
    end: '2026-04-04',
    allDay: true,
  },
];

test('weekly slots repeat only on their day within the exclusive visible range, including DST', () => {
  const events = expand(slots, '2026-03-23', '2026-04-06', []);
  assert.deepEqual(
    events
      .filter((event) => event.title === '12:00 - Déjeuner')
      .map((event) => event.start),
    ['2026-03-23', '2026-03-30'],
  );
  assert.deepEqual(
    events
      .filter((event) => event.title === '19:00 - Ouverture')
      .map((event) => event.start),
    ['2026-03-27', '2026-04-03'],
  );
  assert.equal(
    events.filter((event) => event.title === 'Sur réservation').length,
    0,
  );
  assert.equal(
    events.filter((event) => event.title === '00:00 - Ouverture').length,
    2,
  );
  assert.equal(events.length, 6);
  assert.equal(new Set(events.map((event) => event.id)).size, events.length);
  assert.ok(events.every((event) => event.allDay && event.end === undefined));
  assert.deepEqual(expand([], '2026-03-23', '2026-04-06', []), []);
  const first = events[0];
  assert.equal(first.backgroundColor, 'var(--heritage-opening)');
  assert.equal(first.extendedProps.eventKind, 'publicOpening');
  assert.deepEqual(first.extendedProps.publicEvent, {
    id: first.id,
    title: 'Déjeuner',
    content: 'Déjeuner - 12h00 - 14h00',
    start: '2026-03-23',
    end: null,
  });
});

test('closures suppress all recurring slots through the inclusive last closed day', () => {
  const events = expand(slots, '2026-03-23', '2026-04-13', closures);
  assert.ok(
    !events.some(
      (event) => event.start >= '2026-03-30' && event.start <= '2026-04-03',
    ),
  );
  assert.ok(events.some((event) => event.start === '2026-04-06'));
  assert.ok(events.some((event) => event.start === '2026-03-27'));
  assert.equal(events.length, 6);
});

let calendarProps;
let eventsResponse = {
  success: true,
  data: [
    {
      id: 'event',
      title: 'Rencontre',
      content: 'Programme',
      start: '2026-03-23T17:00:00Z',
      end: null,
    },
  ],
};
let slotsResponse = { success: true, data: slots };
let closuresResponse = { success: true, data: closures };
let slotsCalls = 0;
let closureCalls = 0;
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@fullcalendar/react')
    return {
      default: (props) => {
        calendarProps = props;
        return null;
      },
      __esModule: true,
    };
  if (request === '../lib/events.action')
    return { getCalendarEventsAction: async () => eventsResponse };
  if (request === '@/features/opening-slots/lib/opening-slots.action')
    return {
      getAllOpeningSlotsAction: async () => {
        slotsCalls++;
        return slotsResponse;
      },
      getPublicOpeningClosureCalendarEventsAction: async () => {
        closureCalls++;
        return closuresResponse;
      },
    };
  if (request === './calendar-event-dialog')
    return { CalendarEventDialog: () => null };
  return originalLoad.call(this, request, parent, isMain);
};
const { SETTINGS } = require('../src/settings/settings.current.ts');
const {
  EventsCalendar,
} = require('../src/features/events/components/events-calendar.tsx');
Module._load = originalLoad;
const range = {
  startStr: '2026-03-23',
  endStr: '2026-04-13',
  start: new Date('2026-03-23'),
  end: new Date('2026-04-13'),
};

test('public calendar combines events, closures and opening slots with a distinct legend', async () => {
  SETTINGS.features.horaires = true;
  const html = renderToStaticMarkup(React.createElement(EventsCalendar));
  assert.ok(html.includes('Horaires') && html.includes('bg-heritage-opening'));
  const items = await calendarProps.events(range);
  assert.equal(
    items.filter((event) => event.extendedProps.eventKind === 'publicEvent')
      .length,
    1,
  );
  assert.equal(
    items.filter((event) => event.extendedProps.eventKind === 'publicClosure')
      .length,
    1,
  );
  assert.equal(
    items.filter((event) => event.extendedProps.eventKind === 'publicOpening')
      .length,
    6,
  );
  assert.equal(slotsCalls, 1);
  assert.equal(closureCalls, 1);
});

test('disabled hours make no opening/closure calls; failures preserve other feed entries', async () => {
  SETTINGS.features.horaires = false;
  const html = renderToStaticMarkup(React.createElement(EventsCalendar));
  assert.ok(!html.includes('Horaires'));
  assert.equal((await calendarProps.events(range)).length, 1);
  assert.equal(slotsCalls, 1);
  assert.equal(closureCalls, 1);
  SETTINGS.features.horaires = true;
  renderToStaticMarkup(React.createElement(EventsCalendar));
  closuresResponse = { success: false };
  assert.equal((await calendarProps.events(range)).length, 1);
  closuresResponse = { success: true, data: closures };
  slotsResponse = { success: false };
  assert.equal((await calendarProps.events(range)).length, 2);
  slotsResponse = { success: true, data: slots };
  eventsResponse = { success: false };
  assert.equal((await calendarProps.events(range)).length, 7);
});
