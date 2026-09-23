import type { TServerResponse } from '../server/server.response';
import { ERROR_CODES, TErrorCode } from './error.handling';

const ERROR_MESSAGES: Record<TErrorCode, string> = {
  [ERROR_CODES.UNAUTHORIZED]:
    'Vous devez être connecté pour accéder à cette ressource.',
  [ERROR_CODES.FORBIDDEN]:
    "Vous n'avez pas les permissions nécessaires pour effectuer cette action.",
  [ERROR_CODES.NOT_FOUND]: 'La ressource demandée est introuvable.',
  [ERROR_CODES.INTERNAL_SERVER_ERROR]:
    'Une erreur est survenue sur le serveur.',
  [ERROR_CODES.BAD_REQUEST]: 'La requête est invalide.',
  [ERROR_CODES.DATABASE_ERROR]:
    "Une erreur est survenue lors de l'accès à la base de données.",
  [ERROR_CODES.SERVICE_ERROR]:
    "Une erreur est survenue lors de l'appel à un service interne.",
  [ERROR_CODES.UNKNOWN_ERROR]: 'Une erreur inconnue est survenue.',
  [ERROR_CODES.FILE_SYSTEM_ERROR]:
    "Une erreur est survenue lors de l'accès au système de fichiers.",
  [ERROR_CODES.MAX_FILES_ERROR]:
    'Le nombre maximum de fichiers autorisés a été atteint.',
  [ERROR_CODES.MAX_FILE_SIZE_ERROR]:
    "L'image dépasse la taille maximale autorisée de 2 Mo.",
  [ERROR_CODES.INVALID_FILE_TYPE]: 'Le type de fichier est invalide.',
  [ERROR_CODES.USER_ALREADY_EXISTS]:
    'Un utilisateur avec cet email existe déjà. Veuillez vous connecter ou utiliser un autre email.',
  [ERROR_CODES.INVALID_CREDENTIALS]:
    'Email ou mot de passe invalide. Veuillez réessayer.',
  [ERROR_CODES.RESSOURCE_IN_USE]:
    'Impossible de supprimer cette ressource car elle est utilisée par une prestation ou une réservation existante.',
  [ERROR_CODES.SERVICE_NOT_BOOKABLE]:
    'Impossible de réserver cette prestation car elle est désactivée pour la réservation en ligne.',
  [ERROR_CODES.USER_PHONE_REQUIRED]:
    'Veuillez renseigner votre numéro de téléphone dans votre tableau de bord avant de réserver.',
  [ERROR_CODES.USER_CANNOT_BOOK]:
    "Votre compte n'est pas autorisé à prendre des réservations.",
  [ERROR_CODES.LEGAL_TERMS_ACCEPTANCE_REQUIRED]:
    "Vous devez accepter la dernière version des conditions générales d'utilisation avant de prendre une réservation.",
  [ERROR_CODES.ADMIN_ACCOUNT_PROTECTED]:
    'Un compte administrateur ne peut pas être supprimé ni banni. Veuillez contacter la maintenance si vous souhaitez modifier un compte administrateur.',
  [ERROR_CODES.ADMIN_ROLE_PROTECTED]:
    'Impossible de modifier le rôle d’un administrateur. Veuillez contacter la maintenance si vous souhaitez modifier un compte administrateur.',
  [ERROR_CODES.STAFF_ACCOUNT_ADMIN_ONLY]:
    'Seul un administrateur peut supprimer le compte d’un membre du staff.',
  [ERROR_CODES.STAFF_PERMISSIONS_ONLY]:
    'Les permissions ne peuvent être attribuées qu’à un membre du staff.',
  [ERROR_CODES.USER_HAS_UPCOMING_RESERVATIONS]:
    "Impossible de supprimer ou bannir ce compte tant qu'il possède une réservation prévue aujourd'hui ou plus tard. Annulez ces réservations avant de supprimer le compte.",
  [ERROR_CODES.RESERVATION_CANNOT_BE_CANCELLED]:
    'Cette réservation ne peut plus être annulée.',
};

export function getErrorMessageFromResponse(
  response: TServerResponse<unknown>,
): string {
  if (response.success) return '';
  return ERROR_MESSAGES[response.error] ?? 'Une erreur inconnue est survenue.';
}
