import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type Props = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
};

export function ConfirmToast({
  title = 'Êtes-vous sûr ?',
  description = 'Cette action est irréversible.',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
}: Props) {
  const handleConfirm = () => {
    onConfirm();
    toast.dismiss();
  };

  return toast.custom(
    () => (
      <div className="bg-foreground rounded text-background p-4">
        <h3 className="font-semibold">{title}</h3>
        {description && <p className="text-muted mt-1">{description}</p>}
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="default" onClick={() => toast.dismiss()}>
            {cancelText}
          </Button>
          <Button variant="default" onClick={handleConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    ),
    {
      duration: Infinity,
      position: 'top-center',
    },
  );
}
