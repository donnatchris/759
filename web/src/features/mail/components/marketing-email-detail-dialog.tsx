'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { deleteMarketingEmailAction } from '../lib/marketing-email.action';
import type { TMarketingEmailListItem } from '../lib/marketing-email.types';
import {
  formatMarketingEmailDate,
  getMarketingEmailStatusLabel,
} from './marketing-email-format';

type Props = {
  marketingEmail: TMarketingEmailListItem | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: (marketingEmailId: string) => void;
};

export function MarketingEmailDetailDialog({
  marketingEmail,
  onOpenChange,
  onDeleted,
}: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) setDeleteConfirmationOpen(false);
    onOpenChange(open);
  };

  const handleDeleteClick = async () => {
    if (!marketingEmail || isDeleting) return;

    setIsDeleting(true);

    const response = await deleteMarketingEmailAction({
      id: marketingEmail.id,
    });

    setIsDeleting(false);

    if (!response.success) {
      toast.error(getErrorMessageFromResponse(response), {
        position: 'top-center',
      });
      return;
    }

    onDeleted(marketingEmail.id);
    handleOpenChange(false);
    toast.success('Le mail marketing a été supprimé.', {
      position: 'top-center',
    });
  };

  return (
    <Dialog open={marketingEmail !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        {marketingEmail && (
          <>
            <DialogHeader>
              <DialogTitle>{marketingEmail.subject}</DialogTitle>
              <DialogDescription>
                Détail complet de l&apos;email marketing enregistré.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-5">
              <section className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
                <DetailItem label="Statut">
                  <Badge
                    variant={
                      marketingEmail.status === 'FAILED'
                        ? 'destructive'
                        : 'outline'
                    }
                  >
                    {getMarketingEmailStatusLabel(marketingEmail.status)}
                  </Badge>
                </DetailItem>
                <DetailItem
                  label="Programmé"
                  value={formatMarketingEmailDate(marketingEmail.scheduledFor)}
                />
                <DetailItem
                  label="Créé"
                  value={formatMarketingEmailDate(marketingEmail.createdAt)}
                />
                <DetailItem
                  label="Mis à jour"
                  value={formatMarketingEmailDate(marketingEmail.updatedAt)}
                />
                <DetailItem
                  label="Envoyé le"
                  value={formatMarketingEmailDate(marketingEmail.sentAt)}
                />
                <DetailItem
                  label="Créé par"
                  value={marketingEmail.createdByEmail ?? '-'}
                />
              </section>

              <section className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
                <DetailItem
                  label="Destinataires éligibles"
                  value={String(marketingEmail.eligibleRecipientCount)}
                />
                <DetailItem
                  label="Destinataires envoyés"
                  value={String(marketingEmail.sentRecipientCount)}
                />
                <DetailItem
                  label="Tentatives d'envoi"
                  value={String(marketingEmail.emailAttempts)}
                />
                <DetailItem
                  label="Dernière tentative"
                  value={formatMarketingEmailDate(
                    marketingEmail.emailLastAttemptAt,
                  )}
                />
                <DetailItem
                  label="Dernière erreur"
                  value={marketingEmail.emailLastError ?? '-'}
                  className="sm:col-span-2"
                />
              </section>

              <section className="grid gap-3 rounded-lg border p-3">
                <DetailItem label="Objet" value={marketingEmail.subject} />
                <DetailItem
                  label="Surtitre"
                  value={marketingEmail.eyebrow ?? '-'}
                />
                <DetailItem label="Titre" value={marketingEmail.title} />
                <DetailItem
                  label="Introduction"
                  value={marketingEmail.intro ?? '-'}
                />
                <DetailItem label="Contenu" value={marketingEmail.content} />
                <DetailItem label="Note" value={marketingEmail.note ?? '-'} />
                <DetailItem
                  label="Image"
                  value={marketingEmail.imageUrl ?? '-'}
                />
                <DetailItem
                  label="Liens"
                  value={marketingEmail.links.join('\n') || '-'}
                />
                <DetailItem
                  label="Email créateur"
                  value={marketingEmail.createdByEmail ?? '-'}
                />
              </section>
            </div>

            <DialogFooter className="items-stretch sm:items-end">
              {deleteConfirmationOpen ? (
                <div className="flex w-full flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive sm:max-w-md">
                  <div>
                    <p className="font-semibold">
                      Supprimer ce mail marketing ?
                    </p>
                    <p className="mt-1 text-sm">
                      Cette action supprimera définitivement ce mail de la
                      liste. Si le mail n&apos;a pas encore été envoyé, sa
                      suppression annulera l&apos;envoi programmé.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDeleteConfirmationOpen(false)}
                      disabled={isDeleting}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDeleteClick}
                      disabled={isDeleting}
                    >
                      <Trash2 className="size-4" />
                      {isDeleting ? 'Suppression...' : 'Supprimer'}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteConfirmationOpen(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="size-4" />
                  Supprimer
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({
  label,
  value,
  children,
  className = '',
}: {
  label: string;
  value?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 whitespace-pre-wrap break-words text-sm">
        {children ?? value}
      </dd>
    </div>
  );
}
