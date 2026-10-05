import React from 'react';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  sublabel?: string;
  color?: string;
}

export function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 10,
  sublabel = 'Completed',
  color = '#4F46E5',
}: ProgressRingProps): JSX.Element {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: `${Math.round(size * 0.22)}px`, fontWeight: 700, color: 'var(--text-primary)' }}>
          {clamped}%
        </span>
        {sublabel && (
          <span style={{ fontSize: `${Math.round(size * 0.09)}px`, color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
