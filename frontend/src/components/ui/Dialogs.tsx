import { CheckCircle2, XCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import styles from './Dialogs.module.css';

export function ConfirmDialog({ title, body, confirmLabel, onCancel, onConfirm, pending = false }: {
  title: string;
  body: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  pending?: boolean;
}): JSX.Element {
  return (
    <Modal title={title} onClose={onCancel} pending={pending}>
      <p className={styles.body}>{body}</p>
      <div className={styles.row}>
        <Button variant="secondary" onClick={onCancel} disabled={pending}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} pending={pending}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

export function SuccessDialog({ title, body, primaryLabel, onPrimary, secondaryLabel, onSecondary }: {
  title: string;
  body: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
}): JSX.Element {
  return (
    <Modal title={title} onClose={onSecondary}>
      <div className={styles.hero}><CheckCircle2 size={40} strokeWidth={1.75} className={styles.ok} /></div>
      <p className={styles.body}>{body}</p>
      <div className={styles.row}>
        <Button variant="secondary" onClick={onPrimary}>{primaryLabel}</Button>
        <Button onClick={onSecondary}>{secondaryLabel}</Button>
      </div>
    </Modal>
  );
}

export function ErrorDialog({ title, body, onRetry, onCancel, retryLabel = 'Try Again' }: {
  title: string;
  body: string;
  onRetry: () => void;
  onCancel: () => void;
  retryLabel?: string;
}): JSX.Element {
  return (
    <Modal title={title} onClose={onCancel}>
      <div className={styles.hero}><XCircle size={40} strokeWidth={1.75} className={styles.fail} /></div>
      <p className={styles.body}>{body}</p>
      <div className={styles.row}>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={onRetry}>{retryLabel}</Button>
      </div>
    </Modal>
  );
}
