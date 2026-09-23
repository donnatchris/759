import type { MarketingEmailStatus } from '../lib/marketing-email.types';

export function formatMarketingEmailDate(value: string | null): string {
  if (!value) return '-';

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function getMarketingEmailStatusLabel(
  status: MarketingEmailStatus,
): string {
  const labels: Record<MarketingEmailStatus, string> = {
    PENDING: 'En attente',
    SENDING: 'En cours',
    SENT: 'Envoyé',
    FAILED: 'Échec',
    CANCELLED: 'Annulé',
  };

  return labels[status];
}
