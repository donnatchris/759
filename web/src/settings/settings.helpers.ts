import { SETTINGS } from './settings.current';

export function isSignUpEnabled() {
  return SETTINGS.features.signup;
}

export function isLoginEnabled() {
  return SETTINGS.features.login;
}

export function getSiteFullName() {
  return SETTINGS.site.fullName;
}

export function getSiteActivities() {
  return SETTINGS.site.activities;
}

export function getSiteIcon() {
  return SETTINGS.site.icon;
}

export function isPrestationsEnabled() {
  return SETTINGS.features.prestations;
}

export function isMenuEnabled() {
  return SETTINGS.features.menu;
}

export function isActualitesEnabled() {
  return SETTINGS.features.actualites;
}

export function isHorairesEnabled() {
  return SETTINGS.features.horaires;
}
