import { unauthorized } from 'next/navigation';
import { isSignUpEnabled } from '@/settings/settings.helpers';

type Props = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: Props) {
  if (!isSignUpEnabled()) return unauthorized();
  return <>{children}</>;
}
