export function formatCurrentEventDate(
  date: Date | null | undefined,
): string | null {
  if (!date) return null;
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatCurrentEventDateRange(
  startDate: Date | null | undefined,
  endDate: Date | null | undefined,
): string | null {
  const formattedStartDate = formatCurrentEventDate(startDate);
  const formattedEndDate = formatCurrentEventDate(endDate);

  if (formattedStartDate && formattedEndDate) {
    return `Du ${formattedStartDate} au ${formattedEndDate}`;
  }
  if (formattedStartDate) {
    return `À partir du ${formattedStartDate}`;
  }
  if (formattedEndDate) {
    return `Jusqu'au ${formattedEndDate}`;
  }
  return null;
}
