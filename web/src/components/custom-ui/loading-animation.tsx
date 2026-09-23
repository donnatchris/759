import { getSiteIcon } from '@/settings/settings.helpers';
import { cn } from '@/lib/utils';

type Props = {
  size?: 'sm' | 'md' | 'lg';
};

const Icon = getSiteIcon();

export function LoadingAnimation({ size = 'md' }: Props) {
  const divSize =
    size === 'sm' ? 'h-8 w-8' : size === 'md' ? 'h-14 w-14' : 'h-20 w-20';
  const iconSize =
    size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-8 w-8' : 'h-12 w-12';

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-10">
      <div
        className={cn(
          'relative flex h-14 w-14 items-center justify-center',
          divSize,
        )}
      >
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <Icon className={cn('text-primary animate-pulse', iconSize)} />
      </div>
    </div>
  );
}
