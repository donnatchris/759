import { CircleQuestionMark } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type Props = {
  text: string;
};

export function PopoverIndicator({ text }: Props) {
  if (!text) return null;
  return (
    <Popover>
      <PopoverTrigger className="cursor-pointer">
        <CircleQuestionMark className="inline-block ml-1" size={16} />
      </PopoverTrigger>
      <PopoverContent className="w-auto max-w-sm">{text}</PopoverContent>
    </Popover>
  );
}
