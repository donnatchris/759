import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Back } from '@/components/custom-ui/back-button';

export default function NotFoundPage() {
  return (
    <>
      <div className="absolute top-20 left-4">
        <Back />
      </div>
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full space-y-6 p-8 text-center">
          <h1 className="font-cinzel mb-2 text-4xl text-primary">
            Page introuvable
          </h1>
          <p className="text-lg text-muted-foreground">
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>

          <div className="mt-4 flex justify-center gap-4">
            <Button className="hero-button">
              <Link href="/">Retour à l&apos;accueil</Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
