/* eslint-disable @typescript-eslint/no-require-imports -- Mock React effects and browser APIs. */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const Module = require('node:module');

test('calendar refreshes after mutations, across tabs and on returning; cleans up listeners', (t) => {
  let cleanup;
  const originalLoad = Module._load;
  Module._load = function (request, parent, isMain) {
    if (request === 'react')
      return {
        useEffect: (effect) => {
          cleanup = effect();
        },
      };
    return originalLoad.call(this, request, parent, isMain);
  };
  let calendar;
  try {
    calendar = require('../src/features/events/lib/events-calendar-refresh.ts');
  } finally {
    Module._load = originalLoad;
  }
  const browserWindow = new EventTarget();
  const browserDocument = new EventTarget();
  browserDocument.visibilityState = 'visible';
  const channels = new Set();
  class Channel {
    constructor(name) {
      this.name = name;
      channels.add(this);
    }
    postMessage(data) {
      for (const channel of channels) {
        if (channel !== this && channel.name === this.name)
          channel.onmessage?.({ data });
      }
    }
    close() {
      channels.delete(this);
    }
  }
  for (const [name, value] of Object.entries({
    window: browserWindow,
    document: browserDocument,
    BroadcastChannel: Channel,
  })) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, {
      configurable: true,
      writable: true,
      value,
    });
    t.after(() =>
      descriptor
        ? Object.defineProperty(globalThis, name, descriptor)
        : delete globalThis[name],
    );
  }
  let refreshes = 0;
  calendar.useCalendarEventsRefresh({
    current: { getApi: () => ({ refetchEvents: () => refreshes++ }) },
  });
  calendar.notifyCalendarEventsChanged();
  assert.ok(refreshes >= 1, 'mutation refreshes the current calendar');
  const otherTab = new Channel('calendar-events-changed');
  const beforeMessage = refreshes;
  otherTab.postMessage('refresh');
  assert.equal(refreshes, beforeMessage + 1);
  browserWindow.dispatchEvent(new Event('pageshow'));
  browserWindow.dispatchEvent(new Event('focus'));
  browserDocument.dispatchEvent(new Event('visibilitychange'));
  assert.equal(refreshes, beforeMessage + 4);
  browserDocument.visibilityState = 'hidden';
  browserDocument.dispatchEvent(new Event('visibilitychange'));
  assert.equal(refreshes, beforeMessage + 4);
  cleanup();
  otherTab.postMessage('refresh');
  browserWindow.dispatchEvent(new Event('calendar-events-changed'));
  browserWindow.dispatchEvent(new Event('focus'));
  browserWindow.dispatchEvent(new Event('pageshow'));
  browserDocument.visibilityState = 'visible';
  browserDocument.dispatchEvent(new Event('visibilitychange'));
  assert.equal(refreshes, beforeMessage + 4);
  otherTab.close();
  assert.equal(channels.size, 0);
});
