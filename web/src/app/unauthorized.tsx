import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 text-center shadow-lg">
        <h1 className="font-cinzel mb-2 text-3xl text-primary">
          Accès non autorisé
        </h1>
        <p className="text-muted-foreground">
          Vous n&apos;êtes pas autorisé à accéder à cette page.
        </p>

        <div className="mt-4 flex justify-center gap-4">
          <Button className="hero-button">
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
