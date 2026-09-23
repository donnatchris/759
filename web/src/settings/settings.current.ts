import { Handshake } from 'lucide-react';

const fullName = process.env.SITE_FULL_NAME || 'Le 7.59';

export const SETTINGS = {
  site: {
    fullName,
    activities: ['Événements, bonne chère et traditions du pays catalan.'],
    icon: Handshake,
  },
  features: {
    signup: false,
    login: true,
  },
};
