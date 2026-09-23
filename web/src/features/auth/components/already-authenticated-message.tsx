'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { signOut } from '@/features/auth/auth-client';
import type { TAuthUser } from '@/features/auth/auth.types';

type Props = {
  user: NonNullable<TAuthUser>;
  actionLabel: string;
};

export function AlreadyAuthenticatedMessage({ user, actionLabel }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await signOut();
      toast.success('Vous avez été déconnecté avec succès.', {
        position: 'top-center',
      });
      router.refresh();
    } catch {
      toast.error('Echec de la déconnexion. Veuillez réessayer.', {
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full rounded-lg border border-primary/20 bg-background/70 p-6 text-center shadow-sm">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UserCheck className="size-6" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-bold">Vous êtes déjà connecté</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Vous êtes connecté avec le compte{' '}
        <span className="font-medium text-foreground">{user.email}</span>. Pour{' '}
        {actionLabel}, vous devez d&apos;abord vous déconnecter de ce compte.
      </p>
      <Button
        type="button"
        onClick={handleLogout}
        disabled={isLoading}
        className="mt-6 w-full"
      >
        <LogOut className="size-4" aria-hidden="true" />
        {isLoading ? 'Déconnexion...' : 'Se déconnecter'}
      </Button>
    </div>
  );
}
