'use client';

import { useRef, useState } from 'react';
import type { TPublicImage } from '../lib/image.service';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { DeleteButton } from '@/components/custom-ui/delete-button';
import { Button } from '@/components/ui/button';
import { deletePublicImage, uploadImage } from '../lib/image.action';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { MAX_IMAGES_COUNT } from '../lib/image.const';

type Props = {
  images: TPublicImage[];
};

export function ManageImages({ images }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numberOfImages = images.length ?? 0;

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', file);

      const response = await uploadImage(formData);

      if (response.success) {
        toast.success('Image ajoutée avec succès !', {
          position: 'top-center',
        });
        router.refresh();
      } else {
        setError(getErrorMessageFromResponse(response));
      }
      event.target.value = '';
    } catch {
      setError("Impossible d'ajouter l'image.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4">
      <p className="my-4 text-xs font-semibold text-muted-foreground sm:text-sm">{`${numberOfImages} images / ${MAX_IMAGES_COUNT}`}</p>
      <p className="my-4 text-xs text-muted-foreground sm:text-sm">
        {
          'Les images téléchargées ici peuvent être utilisées dans vos contenus (pages, articles, carousel...). Assurez-vous de ne pas supprimer une image utilisée dans vos contenus pour éviter les liens brisés.'
        }
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />

      <div className="relative mt-4 flex flex-wrap gap-4">
        <Button
          type="button"
          onClick={openFilePicker}
          disabled={isUploading || images.length >= MAX_IMAGES_COUNT}
          className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border border-dashed bg-card bg-muted transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50 sm:h-35 sm:w-35"
          aria-label="Ajouter une image"
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Plus size={28} />
            <span className="text-xs">
              {isUploading ? 'Ajout...' : 'Ajouter'}
            </span>
          </div>
        </Button>

        {images.map((image) => (
          <div
            key={image.url}
            className="relative h-24 w-24 overflow-hidden rounded-lg border sm:h-35 sm:w-35"
          >
            <Image
              src={image.url}
              alt={`Image ${image.name}`}
              fill
              sizes="140px"
              className="object-cover"
            />

            <p className="absolute bottom-2 left-2 max-w-[80%] truncate rounded bg-muted-foreground/50 p-1 text-xs text-background">
              {image.name}
            </p>

            <div className="absolute right-1 top-1 z-10">
              <DeleteButton
                size="sm"
                action={() => deletePublicImage(image.name)}
                confirmationTitle="Êtes-vous sûr de vouloir supprimer cette image ?"
                confirmationDescription="Assurez-vous que cette image n'est pas utilisée dans vos contenus avant de la supprimer. Cette action est irréversible."
              />
            </div>
          </div>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}
