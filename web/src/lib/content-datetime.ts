// Event and blog schedules always use the venue's time zone.
export const CONTENT_TIME_ZONE = 'Europe/Paris';

export function formatContentDateTimeInput(value: Date | string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: CONTENT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const part = (type: string) =>
    parts.find((item) => item.type === type)!.value;
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;
}

// Resolve Paris wall time without depending on the browser/server time zone.
// A nonexistent time during the spring clock change is rejected.
export function parseContentDateTimeInput(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return new Date(NaN);
  }
  const target = new Date(`${value}:00Z`).getTime();
  if (Number.isNaN(target)) return new Date(NaN);
  let instant = new Date(target);
  for (let index = 0; index < 3; index += 1) {
    const wallTime = new Date(
      `${formatContentDateTimeInput(instant)}:00Z`,
    ).getTime();
    const difference = target - wallTime;
    if (difference === 0) break;
    instant = new Date(instant.getTime() + difference);
  }
  return formatContentDateTimeInput(instant) === value
    ? instant
    : new Date(NaN);
}

export function formatContentTime(value: Date | string): string {
  return new Date(value).toLocaleTimeString('fr-FR', {
    timeZone: CONTENT_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
  });
}
