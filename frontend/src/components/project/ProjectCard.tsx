import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { StatusBadge, PriorityDot } from '../ui/StatusBadge';
import { formatDateRange } from '../../utils/dates';
import type { Project } from '../../types';

function ProgressBar({ value }: { value: number }): JSX.Element {
  const pct = Math.round(value * 100);
  const fill = pct === 100 ? 'var(--green-500)' : 'var(--blue-600)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        flex: 1, height: 6, borderRadius: 3,
        background: 'var(--border)', overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: fill, borderRadius: 3,
          transition: 'width 200ms',
        }} />
      </div>
      <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)', flexShrink: 0 }}>
        {pct}%
      </span>
    </div>
  );
}

export function ProjectCard({ project, progress, base }: {
  project: Project;
  progress: number;
  base: string;
}): JSX.Element {
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <Link
          to={`${base}/${project.id}`}
          style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', textDecoration: 'none' }}
        >
          {project.title}
        </Link>
        <StatusBadge status={project.status} />
      </div>
      {project.description !== '' ? (
        <p style={{
          fontSize: 13, color: 'var(--text-muted)', margin: '0 0 12px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }} title={project.description}>
          {project.description}
        </p>
      ) : null}
      <div style={{ marginBottom: 12 }}>
        <ProgressBar value={progress} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {formatDateRange(project.startDate, project.deadline)}
        </span>
        <PriorityDot priority={project.priority} />
      </div>
    </Card>
  );
}
