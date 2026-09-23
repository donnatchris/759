import { getGenericEmailHtml } from './generic-email.templates';
import { getAppHomeUrl } from './email-layout';

type ReservationEmailTemplateParams = {
  customerName: string | null;
  serviceLabel: string;
  startsAt: Date;
};

type ReservationCancellationEmailTemplateParams =
  ReservationEmailTemplateParams & {
    cancelledBy: 'USER' | 'STAFF';
    cancellationMessage: string;
  };

export function getReservationCreatedEmailHtml({
  customerName,
  serviceLabel,
  startsAt,
}: ReservationEmailTemplateParams): string {
  return getGenericEmailHtml({
    title: 'Votre réservation est confirmée',
    intro: getGreeting(customerName),
    content: `Votre réservation pour ${serviceLabel} est confirmée pour le ${formatReservationDateTime(startsAt)}.`,
  });
}

export function getReservationCancelledEmailHtml({
  customerName,
  serviceLabel,
  startsAt,
  cancelledBy,
  cancellationMessage,
}: ReservationCancellationEmailTemplateParams): string {
  const reservationDateTime = formatReservationDateTime(startsAt);
  const content =
    cancelledBy === 'USER'
      ? `Vous avez annulé votre réservation pour ${serviceLabel}, prévue le ${reservationDateTime}. Motif : ${cancellationMessage}`
      : `Le staff a annulé votre réservation pour ${serviceLabel}, prévue le ${reservationDateTime}. Motif : ${cancellationMessage}`;

  return getGenericEmailHtml({
    title: 'Votre réservation est annulée',
    intro: getGreeting(customerName),
    content,
  });
}

export function getReservationReminderEmailHtml({
  customerName,
  serviceLabel,
  startsAt,
}: ReservationEmailTemplateParams): string {
  const dashboardUrl = new URL('/dashboard', getAppHomeUrl()).toString();

  return getGenericEmailHtml({
    title: 'Rappel de votre rendez-vous',
    intro: getGreeting(customerName),
    content: `Nous vous rappelons votre rendez-vous pour ${serviceLabel}, prévu le ${formatReservationDateTime(startsAt)}. Vous pouvez consulter ou annuler votre réservation depuis votre tableau de bord.`,
    actionUrl: dashboardUrl,
    actionLabel: 'Consulter ma réservation',
  });
}

function getGreeting(customerName: string | null): string {
  return customerName ? `Bonjour ${customerName},` : 'Bonjour,';
}

function formatReservationDateTime(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Paris',
  }).format(date);
}
