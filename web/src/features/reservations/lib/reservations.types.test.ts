import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  addDays,
  createLocalDateTime,
  formatDateInputValue,
  getDisplayDayLabel,
  getDisplayDayNumber,
  getDisplayMonthLabel,
  getDayOfWeekFromDateInput,
} from './reservations.types';

for (const zone of ['UTC', 'Europe/Paris', 'America/New_York']) {
  test(`Paris bookings are independent of the host timezone (${zone})`, () => {
    const previous = process.env.TZ;
    process.env.TZ = zone;
    try {
      assert.equal(
        createLocalDateTime('2026-09-16', 660).toISOString(),
        '2026-09-16T09:00:00.000Z',
      );
      assert.equal(
        createLocalDateTime('2026-01-16', 660).toISOString(),
        '2026-01-16T10:00:00.000Z',
      );
      const midnight = createLocalDateTime('2026-09-16', 0);
      assert.equal(formatDateInputValue(midnight), '2026-09-16');
      assert.equal(getDisplayDayLabel(midnight), 'mer.');
      assert.equal(getDisplayDayNumber(midnight), '16');
      assert.equal(getDisplayMonthLabel(midnight), 'sept.');
      assert.equal(getDayOfWeekFromDateInput('2026-09-16'), 3);
      assert.equal(
        formatDateInputValue(new Date('2026-09-15T22:30:00Z')),
        '2026-09-16',
      );
      for (const [start, end, hours] of [
        ['2026-03-29', '2026-03-30', 23],
        ['2026-10-25', '2026-10-26', 25],
      ] as const) {
        const day = createLocalDateTime(start, 0);
        const next = addDays(day, 1);
        assert.equal(formatDateInputValue(next), end);
        assert.equal(next.getTime() - day.getTime(), hours * 3_600_000);
        assert.equal(addDays(next, -1).toISOString(), day.toISOString());
      }
      assert.equal(
        formatDateInputValue(addDays(createLocalDateTime('2026-12-31', 0), 1)),
        '2027-01-01',
      );
    } finally {
      if (previous === undefined) delete process.env.TZ;
      else process.env.TZ = previous;
    }
  });
}
