'use client';

import { Clock, CalendarDays, MonitorCheck, Power, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { EditDialogButton } from '@/components/custom-ui/edit-dialog-button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import type { BookingSettings } from '../lib/reservations.types';
import { UpdateBookingSettingsForm } from './update-booking-settings.form';

type Props = {
  settings: BookingSettings;
};

export function BookingSettingsAdmin({ settings }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();
  const router = useRouter();

  if (!isAdmin || !editMode) return null;

  const onSuccess = () => {
    toast.success('Paramètres de réservation mis à jour avec succès', {
      position: 'top-center',
    });
    router.refresh();
  };

  return (
    <section className="my-4 rounded-xl border border-primary/20 bg-background/70 p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-primary">
            Paramètres de réservation
          </h2>
          <p className="text-sm text-muted-foreground">
            Règles utilisées pour calculer les créneaux disponibles.
          </p>
        </div>

        <EditDialogButton
          title="Modifier les paramètres de réservation"
          subTitle="Définissez le délai minimum, le pas des créneaux et la limite d'anticipation."
        >
          <UpdateBookingSettingsForm values={settings} onSuccess={onSuccess} />
        </EditDialogButton>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <BookingSettingItem
          icon={<Power className="h-4 w-4" aria-hidden="true" />}
          label="Réservations globales"
          value={
            <Badge variant={settings.enabled ? 'default' : 'secondary'}>
              {settings.enabled ? 'Activées' : 'Désactivées'}
            </Badge>
          }
        />
        <BookingSettingItem
          icon={<MonitorCheck className="h-4 w-4" aria-hidden="true" />}
          label="Réservation en ligne"
          value={
            <Badge
              variant={settings.onlineBookingEnabled ? 'default' : 'secondary'}
            >
              {settings.onlineBookingEnabled ? 'Activée' : 'Désactivée'}
            </Badge>
          }
        />
        <BookingSettingItem
          icon={<Timer className="h-4 w-4" aria-hidden="true" />}
          label="Pas des créneaux"
          value={`${settings.slotStepMinutes} min`}
        />
        <BookingSettingItem
          icon={<Clock className="h-4 w-4" aria-hidden="true" />}
          label="Délai minimum"
          value={`${settings.minNoticeHours} h`}
        />
        <BookingSettingItem
          icon={<CalendarDays className="h-4 w-4" aria-hidden="true" />}
          label="Anticipation max"
          value={`${settings.maxAdvanceDays} jours`}
        />
      </div>
    </section>
  );
}

function BookingSettingItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}
