'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function LoginButton() {
  const router = useRouter();

  async function handleClick() {
    router.push('/auth/sign-in');
  }

  const tooltipText = `Aller à la page de connexion`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          onClick={handleClick}
          className="hover:scale-105 transition-transform"
          aria-label={tooltipText}
        >
          <LogIn className="text-accent size-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  );
}
