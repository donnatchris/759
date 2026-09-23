import 'server-only';
import { updateTag } from 'next/cache';

export function safeUpdateTag(tag: string): void {
  try {
    updateTag(tag);
  } catch (error) {
    console.error(`Error in safeUpdateTag for tag "${tag}":`, error);
  }
}
