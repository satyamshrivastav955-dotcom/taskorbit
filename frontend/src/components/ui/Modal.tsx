import React, { useId } from 'react';
import { X } from 'lucide-react';
import { useDialog } from './useDialog';
import styles from './Modal.module.css';

export function Modal({ title, onClose, children, wide = false, pending = false }: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
  pending?: boolean;
}): JSX.Element {
  const titleId = useId();
  const dialogRef = useDialog(onClose, pending);
  return (
    <div className={styles.overlay} onMouseDown={(event) => { if (!pending && event.target === event.currentTarget) onClose(); }}>
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-busy={pending} className={wide ? `${styles.box} ${styles.wide}` : styles.box}>
        <div className={styles.head}>
          <h3 id={titleId}>{title}</h3>
          <button type="button" disabled={pending} className={styles.close} onClick={onClose} aria-label="Close dialog"><X size={18} strokeWidth={1.75} /></button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
