import { useEffect } from 'react';

export function useKeyboardShortcut(
  combo: string,
  handler: () => void,
  deps: unknown[] = [],
): void {
  useEffect(() => {
    const keys = combo
      .toLowerCase()
      .split('+')
      .map((k) => k.trim());
    const mainKey = keys[keys.length - 1];

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      const pressed = {
        ctrl: e.ctrlKey || e.metaKey,
        shift: e.shiftKey,
        alt: e.altKey,
        key: e.key.toLowerCase(),
      };
      const matches =
        pressed.key === mainKey &&
        pressed.ctrl === keys.includes('ctrl') &&
        pressed.shift === keys.includes('shift') &&
        pressed.alt === keys.includes('alt');
      if (matches) {
        e.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, deps);
}
