import type { Ressource, ResourceUnavailablePeriod } from '@prisma/client';

export type { Ressource, ResourceUnavailablePeriod };

export type TResourceUnavailableCalendarEvent = {
  id: string;
  periodId: string;
  ressourceId: string;
  title: string;
  start: string;
  end: string;
  color: string;
  resourceLabel: string;
  quantity: number | null;
  reason: string | null;
};
