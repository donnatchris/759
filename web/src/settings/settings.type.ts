import { LucideIcon } from 'lucide-react';

export type TSite = {
  fullName: string;
  activities: string[];
  icon: LucideIcon;
};

export type TFeatures = {
  signup: boolean;
  login: boolean;
  umami: boolean;
  blog: boolean;
  events: boolean;
  prestations: boolean;
  menu: boolean;
  horaires: boolean;
};

export type TSettings = {
  site: TSite;
  features: TFeatures;
};
