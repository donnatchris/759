'use client';

import { Trash2 } from 'lucide-react';
import { TServerResponse } from '@/features/core';
import { toast } from 'sonner';
import { getErrorMessageFromResponse } from '@/features/core';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ConfirmToast } from '@/components/custom-ui/confirm-toast';

type Props = {
  action: () => Promise<TServerResponse<void>>;
  refreshRouter?: boolean;
  confirmationTitle?: string;
  confirmationDescription?: string;
  size?: 'sm' | 'default' | 'icon';
};

export function DeleteButton({
  action,
  refreshRouter = true,
  confirmationTitle,
  confirmationDescription,
  size = 'default',
}: Props) {
  const router = useRouter();
  const handleDelete = async () => {
    try {
      const response = await action();
      if (response.success) {
        if (refreshRouter) router.refresh();
        toast.success('Elément supprimé avec succès', {
          position: 'top-center',
        });
      } else {
        toast.error(
          'Erreur lors de la suppression: ' +
            getErrorMessageFromResponse(response),
          {
            position: 'top-center',
          },
        );
      }
    } catch {
      toast.error('Une erreur inconnue est survenue lors de la suppression', {
        position: 'top-center',
      });
    }
  };

  const handleConfirmDelete = () => {
    ConfirmToast({
      title: confirmationTitle,
      description: confirmationDescription,
      onConfirm: handleDelete,
    });
  };

  return (
    <Button variant="ghost" size={size} onClick={handleConfirmDelete}>
      <Trash2 className="text-destructive text-center" />
    </Button>
  );
}
