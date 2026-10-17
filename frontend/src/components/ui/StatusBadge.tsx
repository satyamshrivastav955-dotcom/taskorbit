import React from 'react';
import type { TaskStatus } from '../../types';
import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: TaskStatus | string;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  submitted: 'Submitted',
  in_review: 'In Review',
  revision: 'Revision',
  approved: 'Approved',
  completed: 'Completed',
  on_track: 'On Track',
  at_risk: 'At Risk',
  delayed: 'Delayed',
  not_started: 'Not Started',
  active: 'Active',
};

export function StatusBadge({ status, size = 'md', dot = false }: StatusBadgeProps): JSX.Element {
  const norm = status.toLowerCase().replace(/\s+/g, '_');
  const label = STATUS_LABELS[norm] || status;
  const badgeClass = styles[norm] || styles.default;

  return (
    <span className={`${styles.badge} ${badgeClass} ${styles[size]}`}>
      {dot && <span className={styles.dot} />}
      {label}
    </span>
  );
}

export function PriorityDot({ priority }: { priority: string }): JSX.Element {
  const norm = (priority || 'medium').toLowerCase();
  const color = norm === 'high' ? 'var(--danger)' : norm === 'medium' ? 'var(--warning)' : 'var(--action-blue)';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        fontWeight: 600,
        color: 'var(--text-secondary)',
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: color,
        }}
      />
      {norm.charAt(0).toUpperCase() + norm.slice(1)}
    </span>
  );
}
