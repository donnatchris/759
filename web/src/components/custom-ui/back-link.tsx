import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  href: string;
  children?: ReactNode;
  className?: string;
};

export function BackLink({ href, children = 'Retour', className }: Props) {
  return (
    <Button
      asChild
      variant="link"
      className={cn('-ml-2 text-xs sm:text-sm', className)}
    >
      <Link href={href}>
        <ArrowLeft aria-hidden="true" />
        {children}
      </Link>
    </Button>
  );
}
