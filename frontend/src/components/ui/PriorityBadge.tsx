import React from 'react';
import type { Priority } from '../../types';
import styles from './PriorityBadge.module.css';

interface PriorityBadgeProps {
  priority: Priority | string;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps): JSX.Element {
  const norm = (priority || 'medium').toLowerCase();
  const label = norm.charAt(0).toUpperCase() + norm.slice(1);
  const badgeClass = styles[norm] || styles.medium;

  return (
    <span className={`${styles.badge} ${badgeClass} ${styles[size]}`}>
      {label}
    </span>
  );
}
