import { useCallback, useEffect, useRef, useState } from 'react';

/** Shared lifecycle for existing custom dialogs; no markup or prop migration. */
export function useDialog(onClose: () => void, blocked = false): (node: HTMLDivElement | null) => void {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const close = useRef(onClose);
  const locked = useRef(blocked);
  close.current = onClose;
  locked.current = blocked;
  const dialogRef = useCallback((element: HTMLDivElement | null) => setNode(element), []);

  useEffect(() => {
    if (!node) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = (): HTMLElement[] => Array.from(node.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]')).filter((element) => element.getClientRects().length > 0);
    (node.querySelector<HTMLElement>('[autofocus]') ?? focusable()[0] ?? node).focus();
    const key = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && !locked.current) { event.preventDefault(); event.stopPropagation(); close.current(); }
      if (event.key !== 'Tab') return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first) { event.preventDefault(); node.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || !node.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !node.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus(); };
  }, [node]);
  return dialogRef;
}
