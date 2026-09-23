'use client';

import { useUser } from '@/features/auth/auth.context';
import { useEditMode } from '@/features/core';
import { CreateRessourceAdminButton } from './create-ressource-admin-button';
import { DeleteRessource } from './delete-ressource';
import { EditRessourceAdminButton } from './edit-ressource-admin-button';
import type { Ressource } from '../lib/ressource.types';

type Props = {
  ressources: Ressource[];
};

export function RessourcesAdmin({ ressources }: Props) {
  const { isAdmin } = useUser();
  const { editMode } = useEditMode();

  if (!isAdmin || !editMode) return null;

  return (
    <section className="my-4 rounded-xl border border-primary/20 bg-background/70 p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-primary">Ressources</h2>
        <CreateRessourceAdminButton />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ressources.map((ressource) => (
          <div
            key={ressource.id}
            className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="h-4 w-4 shrink-0 rounded-full border"
                style={{ backgroundColor: ressource.color }}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {ressource.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  Quantité : {ressource.quantity}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <EditRessourceAdminButton ressource={ressource} />
              <DeleteRessource id={ressource.id} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
