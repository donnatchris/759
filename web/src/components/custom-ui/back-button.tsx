'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  fallbackHref?: string;
};

export function Back({ fallbackHref }: Props) {
  const router = useRouter();

  const onBack = () => {
    router.back();

    if (fallbackHref) {
      setTimeout(() => {
        router.replace(fallbackHref);
      }, 50);
    }
  };

  return (
    <Button type="button" variant="link" onClick={onBack}>
      <ArrowLeft className="h-4 w-4" />
      Retour
    </Button>
  );
}
