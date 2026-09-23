import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
};

export function BlockUsersReservationsButton({
  disabled,
  loading,
  onClick,
}: Props) {
  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={disabled || loading}
      onClick={onClick}
    >
      <ShieldX className="h-4 w-4" />
      {loading ? 'Blocage...' : "Bloquer l'accès aux réservations"}
    </Button>
  );
}
