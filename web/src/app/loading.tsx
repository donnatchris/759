import { LoadingAnimation } from '@/components/custom-ui/loading-animation';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingAnimation size="lg" />
    </div>
  );
}
