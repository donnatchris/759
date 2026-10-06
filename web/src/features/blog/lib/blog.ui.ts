import { formatContentTime } from '@/lib/content-datetime';
export function formatBlogPostDate(
  date: Date | null | undefined,
): string | null {
  if (!date) return null;
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  });
}

export function formatBlogPostDateRange(
  startDate: Date | null | undefined,
  endDate: Date | null | undefined,
): string | null {
  const start = formatBlogPostDate(startDate);
  const end = formatBlogPostDate(endDate);
  if (start && end) {
    if (start === end) {
      return `Le ${start} de ${formatContentTime(startDate!)} à ${formatContentTime(endDate!)}`;
    }
    return `Du ${start} à ${formatContentTime(startDate!)} au ${end} à ${formatContentTime(endDate!)}`;
  }
  if (start) return `À partir du ${start} à ${formatContentTime(startDate!)}`;
  if (end) return `Jusqu'au ${end} à ${formatContentTime(endDate!)}`;
  return null;
}
