'use client';

import Link from 'next/link';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { EmailPreferenceCheckbox } from './email-preference-checkbox';

type Props<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
};

export function LegalTermsAcceptanceCheckbox<TFieldValues extends FieldValues>({
  name,
}: Props<TFieldValues>) {
  return (
    <EmailPreferenceCheckbox<TFieldValues>
      name={name}
      label="Accepter les conditions générales d'utilisation"
      description={
        <>
          J&apos;ai lu et j&apos;accepte les{' '}
          <Link
            href="/cgu"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-4"
          >
            conditions générales d&apos;utilisation
          </Link>
          .
        </>
      }
    />
  );
}
