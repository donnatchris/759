import { unauthorized } from 'next/navigation';
import { isLoginEnabled } from '@/settings/settings.helpers';

type Props = {
  children: React.ReactNode;
};

export default function ForgotPasswordLayout({ children }: Props) {
  if (!isLoginEnabled()) return unauthorized();
  return <>{children}</>;
}
