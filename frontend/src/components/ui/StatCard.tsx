import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'purple' | 'green' | 'blue' | 'red' | 'amber';
  icon?: React.ReactNode;
  sparkline?: boolean;
}

export function StatCard({
  label,
  value,
  change,
  trend = 'neutral',
  color = 'purple',
  icon,
  sparkline = false,
}: StatCardProps): JSX.Element {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={`${styles.iconWrap} ${styles[color]}`}>{icon}</div>
        <div className={styles.valueGroup}>
          <div className={styles.value}>{value}</div>
          <div className={styles.label}>{label}</div>
        </div>
      </div>
      {(change || sparkline) && (
        <div className={styles.footer}>
          {change && (
            <div className={`${styles.trend} ${styles[trend]}`}>
              {trend === 'up' ? <TrendingUp size={13} aria-hidden="true" /> : trend === 'down' ? <TrendingDown size={13} aria-hidden="true" /> : null}
              <span>{change}</span>
            </div>
          )}
          {sparkline && (
            <svg className={styles.sparkSvg} viewBox="0 0 80 24" fill="none">
              <path
                d={
                  trend === 'down'
                    ? 'M 0,6 Q 20,4 40,14 T 80,20'
                    : 'M 0,20 Q 20,16 40,8 T 80,4'
                }
                stroke={color === 'red' ? 'var(--terracotta)' : color === 'green' ? 'var(--sage)' : 'var(--forest)'}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
      )}
    </div>
  );
}
