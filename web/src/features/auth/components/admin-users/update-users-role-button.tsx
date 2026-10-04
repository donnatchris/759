import { UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TAdminUserListItem } from '../../auth.types';

type Props = {
  disabled: boolean;
  loading: boolean;
  role: Extract<TAdminUserListItem['role'], 'USER' | 'MEMBER' | 'STAFF'>;
  onClick: () => void;
};

export function UpdateUsersRoleButton({
  disabled,
  loading,
  role,
  onClick,
}: Props) {
  const roleLabel = {
    USER: 'Passer en utilisateur',
    MEMBER: 'Passer en adhérent',
    STAFF: 'Ajouter au Staff',
  }[role];

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled || loading}
      onClick={onClick}
    >
      <UserCog className="h-4 w-4" />
      {loading ? 'Modification...' : `${roleLabel}`}
    </Button>
  );
}
