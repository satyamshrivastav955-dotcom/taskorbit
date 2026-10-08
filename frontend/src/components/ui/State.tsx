import React from 'react';
import styles from './State.module.css';
import { AlertCircle, Inbox, RotateCcw } from 'lucide-react';
import { Button } from './Button';

/** Skeleton rows matching table row height (44px) */
export function Skeleton({ rows = 5 }: { rows?: number }): JSX.Element {
  return (
    <div
      className={styles.skelWrap}
      aria-busy="true"
      aria-label="Loading"
      role="status"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={styles.skelRow}>
          <div className={styles.skelCell} style={{ width: '35%' }} />
          <div className={styles.skelCell} style={{ width: '20%' }} />
          <div className={styles.skelCell} style={{ width: '15%' }} />
          <div className={styles.skelCell} style={{ width: '15%' }} />
        </div>
      ))}
    </div>
  );
}

/** Empty state: left-aligned inside its container, no illustration */
export function EmptyState({
  text,
  hint,
  action,
}: {
  text: string;
  hint?: string;
  action?: React.ReactNode;
}): JSX.Element {
  return (
    <div className={styles.empty}>
      <Inbox className={styles.stateIcon} size={26} aria-hidden="true" />
      <p className={styles.emptyText}>{text}</p>
      {hint !== undefined && hint !== '' ? (
        <p className={styles.emptyHint}>{hint}</p>
      ) : null}
      {action !== undefined ? <div className={styles.emptyAction}>{action}</div> : null}
    </div>
  );
}

/** Error state with retry */
export function ErrorState({
  message,
  reason,
  onRetry,
}: {
  message: string;
  reason?: string;
  onRetry: () => void;
}): JSX.Element {
  return (
    <div className={styles.empty} role="alert">
      <AlertCircle className={`${styles.stateIcon} ${styles.stateIconError}`} size={26} aria-hidden="true" />
      <p className={styles.emptyText}>{message}</p>
      {reason !== undefined && reason !== '' ? (
        <p className={styles.emptyHint}>{reason}</p>
      ) : null}
      <div className={styles.emptyAction}>
        <Button variant="secondary" onClick={onRetry}><RotateCcw size={14} aria-hidden="true" /> Retry</Button>
      </div>
    </div>
  );
}
