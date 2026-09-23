'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signOut } from '@/features/auth/auth-client';
import { ConfirmToast } from '@/components/custom-ui/confirm-toast';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

type Props = {
  email: string | null | undefined;
};

export function LogoutButton({ email }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const safeEmail = email ?? 'anonyme';

  async function handleLogout() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await signOut();
      toast.success('Vous avez été déconnecté avec succès.', {
        position: 'top-center',
      });
      router.push('/');
      router.refresh();
    } catch {
      toast.error('Echec de la déconnexion. Veuillez réessayer.', {
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogoutClick() {
    if (isLoading) return;

    ConfirmToast({
      title: 'Se déconnecter ?',
      description: `Vous allez être déconnecté du compte ${safeEmail}.`,
      confirmText: 'Se déconnecter',
      cancelText: 'Annuler',
      onConfirm: handleLogout,
    });
  }

  const tooltipText = `Se déconnecter du compte ${safeEmail}`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          onClick={handleLogoutClick}
          className="hover:scale-105 transition-transform"
          disabled={isLoading}
          aria-label={tooltipText}
        >
          <LogOut className="text-accent size-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  );
}
