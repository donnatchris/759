import { auth } from '@/features/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { unauthorized } from 'next/navigation';

type Props = {
  children: React.ReactNode;
};

export default async function ProtectedLayout({ children }: Props) {
  let session = null;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    session = null;
  }
  if (!session) {
    redirect('/auth/sign-in');
  }
  if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
    unauthorized();
  }
  return <div>{children}</div>;
}
