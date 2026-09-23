function isInvalidCredentialsClientError(error: unknown): boolean {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as { status?: unknown }).status === 401
  ) {
    return true;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'statusText' in error &&
    (error as { statusText?: unknown }).statusText === 'UNAUTHORIZED'
  ) {
    return true;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    const message = (error as { message: string }).message.toLowerCase();

    return (
      message.includes('invalid email or password') ||
      message.includes('invalid credentials') ||
      message.includes('invalid password')
    );
  }

  return false;
}

function isUserAlreadyExistsClientError(error: unknown): boolean {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as { status?: unknown }).status === 422
  ) {
    return true;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as { status?: unknown }).status === 409
  ) {
    return true;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'statusText' in error &&
    typeof (error as { statusText?: unknown }).statusText === 'string'
  ) {
    const statusText = (
      error as { statusText: string }
    ).statusText.toLowerCase();

    if (
      statusText.includes('conflict') ||
      statusText.includes('unprocessable')
    ) {
      return true;
    }
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
  ) {
    const code = (error as { code: string }).code;

    if (code === 'USER_ALREADY_EXISTS' || code === 'EMAIL_ALREADY_EXISTS') {
      return true;
    }
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    const message = (error as { message: string }).message.toLowerCase();

    return (
      message.includes('already exists') ||
      message.includes('email already') ||
      message.includes('user already exists') ||
      message.includes('user with this email') ||
      message.includes('email is already') ||
      message.includes('email already in use')
    );
  }

  return false;
}

function isBannedEmailClientError(error: unknown): boolean {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'EMAIL_BANNED'
  ) {
    return true;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    const message = (error as { message: string }).message.toLowerCase();

    return (
      message.includes('email est banni') ||
      message.includes('email is banned') ||
      message.includes('email_banned')
    );
  }

  return false;
}

export function getErrorMessageFromAuthError(error: unknown): string {
  if (isBannedEmailClientError(error)) {
    return 'Cet email est banni et ne peut plus se connecter ni créer de compte.';
  }
  if (isInvalidCredentialsClientError(error)) {
    return 'Email ou mot de passe invalide. Veuillez réessayer.';
  }
  if (isUserAlreadyExistsClientError(error)) {
    return 'Un compte avec cet email existe déjà. Veuillez utiliser un autre email ou vous connecter.';
  }
  return 'Une erreur inconnue est survenue. Veuillez réessayer.';
}

export function getPasswordResetErrorMessageFromAuthError(
  error: unknown,
): string {
  if (isInvalidTokenClientError(error)) {
    return 'Le lien de réinitialisation est invalide ou a expiré.';
  }

  return getErrorMessageFromAuthError(error);
}

function isInvalidTokenClientError(error: unknown): boolean {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
  ) {
    const code = (error as { code: string }).code.toLowerCase();

    if (code.includes('invalid_token')) {
      return true;
    }
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    const message = (error as { message: string }).message.toLowerCase();

    return (
      message.includes('invalid token') ||
      message.includes('token is invalid') ||
      message.includes('token expired')
    );
  }

  return false;
}

export function emailNotVerifiedClientError(error: unknown): boolean {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'EMAIL_NOT_VERIFIED'
  ) {
    return true;
  }
  return false;
}
