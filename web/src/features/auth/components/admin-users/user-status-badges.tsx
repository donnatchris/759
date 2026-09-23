import { Badge } from '@/components/ui/badge';
import type { TAdminUserListItem } from '../../auth.types';

export function UserBookingStatusBadge({ canBook }: { canBook: boolean }) {
  return canBook ? (
    <Badge variant="secondary">Autorisées</Badge>
  ) : (
    <Badge variant="destructive">Bloquées</Badge>
  );
}

export function UserRoleBadge({ role }: { role: TAdminUserListItem['role'] }) {
  if (role === 'ADMIN') {
    return <Badge variant="destructive">Administrateur</Badge>;
  }

  if (role === 'STAFF') {
    return <Badge>Staff</Badge>;
  }

  return <Badge variant="secondary">Utilisateur</Badge>;
}

export function UserMailSendingBadge({ accepted }: { accepted: boolean }) {
  return accepted ? (
    <Badge variant="secondary">Oui</Badge>
  ) : (
    <Badge variant="destructive">Non</Badge>
  );
}

export function UserEmailVerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <Badge variant="secondary">Oui</Badge>
  ) : (
    <Badge variant="destructive">Non</Badge>
  );
}
