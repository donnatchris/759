import { DialogButton } from '@/components/custom-ui/dialog-button';
import { Plus } from 'lucide-react';

type Props = {
  title: string;
  subTitle: string;
  children: React.ReactNode;
};

export function CreateDialogButton({ title, subTitle, children }: Props) {
  return (
    <DialogButton
      title={title}
      subTitle={subTitle}
      buttonLabel={
        <>
          <Plus className="text-muted-foreground" />
          {title}
        </>
      }
      buttonVariant="ghost"
    >
      {children}
    </DialogButton>
  );
}
