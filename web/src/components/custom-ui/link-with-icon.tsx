import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import type { IconType } from 'react-icons';

type Props = {
  href: string;
  Icon: LucideIcon | IconType;
  text?: string | null | undefined;
};

export function LinkWithIcon({ href, Icon, text }: Props) {
  return (
    <div className="flex flex-row items-center gap-0 text-secondary text-xs sm:text-sm">
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-secondary hover:text-primary transition-colors"
      >
        <Icon className="w-5 h-5" />
        {text && <span className="underline sm:no-underline">{text}</span>}
      </Link>
    </div>
  );
}
