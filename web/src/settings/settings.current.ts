import { Handshake } from 'lucide-react';
import { TSettings } from './settings.type';

const fullName = process.env.SITE_FULL_NAME ?? '';

export const SETTINGS: TSettings = {
  site: {
    fullName,
    activities: ['Événements, bonne chère et traditions du pays catalan.'],
    icon: Handshake,
  },
  features: {
    signup: false,
    login: true,
    umami: false,
    actualites: true,
    prestations: false,
    menu: false,
    horaires: true,
  },
};

export function getSettings(): TSettings {
  return SETTINGS;
}
