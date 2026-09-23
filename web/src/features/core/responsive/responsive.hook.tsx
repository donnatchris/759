'use client';

import { useMediaQuery } from 'usehooks-ts';

const MOBILE_BREAKPOINT = 767; // Correspond à la largeur maximale en pixels pour les appareils mobiles

export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`);
}
