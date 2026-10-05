import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  color?: 'primary' | 'green' | 'red' | 'amber' | 'blue';
  height?: number;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  color = 'primary',
  height = 8,
  showLabel = false,
}: ProgressBarProps): JSX.Element {
  const clamped = Math.min(100, Math.max(0, value));

  const colorMap = {
    primary: 'var(--primary)',
    green: 'var(--green)',
    red: 'var(--red)',
    amber: 'var(--amber)',
    blue: 'var(--blue-light)',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
      <div
        style={{
          flex: 1,
          height: `${height}px`,
          backgroundColor: '#EEF2F6',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${clamped}%`,
            height: '100%',
            backgroundColor: colorMap[color],
            borderRadius: '9999px',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
      {showLabel && (
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', minWidth: '32px' }}>
          {clamped}%
        </span>
      )}
    </div>
  );
}
