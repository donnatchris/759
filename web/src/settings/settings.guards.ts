import { AppError } from '@/features/core/error/error.AppError';
import { ERROR_CODES } from '@/features/core/error/error.handling';
import {
  isActualitesEnabled,
  isMenuEnabled,
  isHorairesEnabled,
  isPrestationsEnabled,
} from './settings.helpers';

function requireEnabled(enabled: boolean): void {
  if (!enabled) throw new AppError(ERROR_CODES.FEATURE_DISABLED);
}

export function requirePrestationsEnabled(): void {
  requireEnabled(isPrestationsEnabled());
}

export function requireMenuEnabled(): void {
  requireEnabled(isMenuEnabled());
}

export function requireActualitesEnabled(): void {
  requireEnabled(isActualitesEnabled());
}

export function requireHorairesEnabled(): void {
  requireEnabled(isHorairesEnabled());
}
