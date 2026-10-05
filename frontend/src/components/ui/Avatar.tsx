import React from 'react';

interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showInitials?: boolean;
}

const SIZE_MAP = {
  sm: { px: 24, font: 10 },
  md: { px: 32, font: 12 },
  lg: { px: 40, font: 14 },
  xl: { px: 48, font: 16 },
};

function getInitials(name: string): string {
  if (!name) return 'TO';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getColor(name: string): string {
  const colors = ['#4F46E5', '#0284C7', '#0D9488', '#16A34A', '#D97706', '#9333EA', '#DC2626'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ name = '', src, size = 'md', showInitials = true }: AvatarProps): JSX.Element {
  const { px, font } = SIZE_MAP[size];
  const initials = getInitials(name);
  const bgColor = getColor(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: `${px}px`,
          height: `${px}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '1.5px solid #FFFFFF',
          boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: `${px}px`,
        height: `${px}px`,
        borderRadius: '50%',
        backgroundColor: bgColor,
        color: '#FFFFFF',
        fontSize: `${font}px`,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1.5px solid #FFFFFF',
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
        flexShrink: 0,
      }}
      title={name}
    >
      {showInitials ? initials : ''}
    </div>
  );
}

export function AvatarGroup({
  users,
  max = 3,
  size = 'md',
}: {
  users: { name: string; avatar?: string }[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}): JSX.Element {
  const visible = users.slice(0, max);
  const remaining = users.length - max;
  const { px, font } = SIZE_MAP[size];

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      {visible.map((u, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: visible.length - i }}>
          <Avatar name={u.name} src={u.avatar} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          style={{
            marginLeft: -8,
            width: `${px}px`,
            height: `${px}px`,
            borderRadius: '50%',
            backgroundColor: '#F1F5F9',
            color: '#475569',
            border: '1.5px solid #FFFFFF',
            fontSize: `${font}px`,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 0,
          }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
