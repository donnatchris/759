import { Handshake } from 'lucide-react';
import { TSettings } from './settings.type';

const fullName = process.env.SITE_FULL_NAME ?? '';

export const SETTINGS: TSettings = {
  site: {
    fullName,
    activities: ['Association patriote française','Événements, bonne chère et traditions du pays catalan.'],
    icon: Handshake,
  },
  features: {
    signup: true,
    login: true,
    umami: false,
    blog: true,
    events: true,
    prestations: false,
    menu: false,
    horaires: true,
  },
};

export function getSettings(): TSettings {
  return SETTINGS;
}
