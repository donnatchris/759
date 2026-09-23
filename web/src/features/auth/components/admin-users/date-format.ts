export function formatNullableDateTime(value: string | null): string {
  if (!value) return 'Jamais';

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
