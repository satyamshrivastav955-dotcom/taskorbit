import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Table } from '../ui/Table';
import { StatusBadge, PriorityDot } from '../ui/StatusBadge';
import { formatDate } from '../../utils/dates';
import type { Task } from '../../types';

export function TaskTable({
  tasks,
  linkBase,
  names = {},
}: {
  tasks: Task[];
  linkBase?: string;
  names?: Record<string, string>;
}): JSX.Element {
  return (
    <Table
      headers={['Task', 'Assignee', 'Deadline', 'Priority', 'Status', '']}
      rowCount={tasks.length}
      emptyText="No tasks yet."
    >
      {tasks.map((t) => (
        <tr key={t.id}>
          <td>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {linkBase !== undefined ? (
                <Link
                  to={`${linkBase}/${t.id}`}
                  style={{ color: 'var(--text)', fontWeight: 500 }}
                  title={t.title}
                >
                  {t.title}
                </Link>
              ) : (
                <span title={t.title}>{t.title}</span>
              )}
            </div>
          </td>
          <td style={{ color: 'var(--text-muted)' }}>
            {names[t.assigneeId] ?? t.assigneeId.slice(0, 8)}
          </td>
          <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
            {formatDate(t.deadline)}
          </td>
          <td><PriorityDot priority={t.priority} /></td>
          <td><StatusBadge status={t.status} /></td>
          <td style={{ textAlign: 'right' }}>
            {t.conflictWith.length > 0 ? (
              <span title="Scheduling conflict" style={{ color: 'var(--red-500)', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                <AlertTriangle size={14} strokeWidth={1.75} />
                Conflict
              </span>
            ) : null}
          </td>
        </tr>
      ))}
    </Table>
  );
}
