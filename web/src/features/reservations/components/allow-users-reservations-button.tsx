import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
};

export function AllowUsersReservationsButton({
  disabled,
  loading,
  onClick,
}: Props) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled || loading}
      onClick={onClick}
    >
      <ShieldCheck className="h-4 w-4" />
      {loading ? 'Autorisation...' : 'Autoriser les réservations'}
    </Button>
  );
}
