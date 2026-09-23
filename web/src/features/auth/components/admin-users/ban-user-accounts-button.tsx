import { Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
};

export function BanUserAccountsButton({ disabled, loading, onClick }: Props) {
  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={disabled || loading}
      onClick={onClick}
    >
      <Ban className="h-4 w-4" />
      {loading ? 'Bannissement...' : 'Bannir'}
    </Button>
  );
}
