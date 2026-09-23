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
