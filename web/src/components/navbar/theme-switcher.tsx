'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Laptop, Moon, Sun } from 'lucide-react';
import { useTheme } from '@teispace/next-themes';
import { useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeSwitcher() {
  const mounted = useMounted();
  const { theme = 'system', setTheme } = useTheme();

  const currentTheme = mounted ? theme : 'system';

  const Icon =
    currentTheme === 'light' ? Sun : currentTheme === 'dark' ? Moon : Laptop;

  const label =
    currentTheme === 'light'
      ? 'Thème : clair'
      : currentTheme === 'dark'
        ? 'Thème : sombre'
        : 'Thème : système';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:scale-105 transition-transform"
          aria-label={label}
          type="button"
        >
          <Icon className="text-accent size-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-content" align="start">
        <DropdownMenuRadioGroup value={currentTheme} onValueChange={setTheme}>
          <DropdownMenuRadioItem className="flex gap-2" value="light">
            <Sun className="text-muted-foreground" />
            <span>Clair</span>
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem className="flex gap-2" value="dark">
            <Moon className="text-muted-foreground" />
            <span>Sombre</span>
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem className="flex gap-2" value="system">
            <Laptop className="text-muted-foreground" />
            <span>Système</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
