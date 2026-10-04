import { DialogButton } from '@/components/custom-ui/dialog-button';
import { Pen } from 'lucide-react';

type Props = {
  title: string;
  subTitle: string;
  label?: string;
  buttonVariant?:
    'default' | 'outline' | 'ghost' | 'link' | 'secondary' | 'destructive';
  children: React.ReactNode;
};

export function EditDialogButton({
  title,
  subTitle,
  label,
  buttonVariant = 'ghost',
  children,
}: Props) {
  const buttonLabel = label ?? <Pen className="text-muted-foreground" />;
  return (
    <DialogButton
      title={title}
      subTitle={subTitle}
      buttonLabel={buttonLabel}
      buttonAriaLabel={title}
      buttonVariant={buttonVariant}
    >
      {children}
    </DialogButton>
  );
}
