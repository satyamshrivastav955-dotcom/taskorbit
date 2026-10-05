import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}

export function Modal({ title, onClose, children, footer, wide = false }: ModalProps): JSX.Element {
  const firstFocusRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Focus the close button on mount; return focus on unmount
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    firstFocusRef.current?.focus();
    return () => { prev?.focus(); };
  }, []);

  // Escape to close
  useEffect(() => {
    function handler(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handler);
    return () => { document.removeEventListener('keydown', handler); };
  }, [onClose]);

  // Focus trap
  useEffect(() => {
    function trap(e: KeyboardEvent): void {
      if (e.key !== 'Tab' || boxRef.current == null) return;
      const focusable = Array.from(
        boxRef.current.querySelectorAll<HTMLElement>(
          'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', trap);
    return () => { document.removeEventListener('keydown', trap); };
  }, []);

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`${styles.box} ${wide ? styles.boxWide : ''}`} ref={boxRef}>
        <div className={styles.head}>
          <h3 id="modal-title">{title}</h3>
          <button
            ref={firstFocusRef}
            className={styles.close}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer !== undefined ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  );
}
