import { ManageImages, getPublicImagesService } from '@/features/core';
import { BackLink } from '@/components/custom-ui/back-link';
import { requireAdminOrThrow } from '@/features/auth/server/require-admin';

export default async function AdminImagesPage() {
  await requireAdminOrThrow();
  const images = await getPublicImagesService();

  return (
    <main className="container mx-auto px-4 py-8">
      <BackLink href="/staff" className="mb-2 text-xs sm:text-sm">
        Retour à l’Espace Staff
      </BackLink>

      <h1 className="mb-8 p-4 text-center font-brand text-4xl font-bold tracking-wide text-primary sm:text-6xl">
        Images publiques
      </h1>

      <ManageImages images={images} />
    </main>
  );
}
