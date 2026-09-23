import { type TErrorCode } from './error.handling';

export class AppError extends Error {
  constructor(public code: TErrorCode) {
    super(code);
    this.name = 'AppError';
  }
}
