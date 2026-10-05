import { useState } from 'react';
import { addDays, formatDate, toDayKey } from '../../utils/dates';
import { Button } from '../ui/Button';
import type { Task } from '../../types';
import styles from './Timeline.module.css';

const DAY_COUNT = 28;
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function barColor(status: string): string {
  if (status === 'approved') return 'var(--green-500)';
  if (status === 'revision') return 'var(--amber-500)';
  if (status === 'in_progress') return 'var(--teal-600)';
  if (status === 'submitted' || status === 'in_review') return 'var(--blue-600)';
  return 'var(--slate-600)';
}

function initials(name: string): string {
  return name.split(' ').map((p) => p[0] ?? '').join('').slice(0, 2).toUpperCase();
}

export function Timeline({
  tasks,
  names = {},
  onTaskClick,
}: {
  tasks: Task[];
  names?: Record<string, string>;
  onTaskClick?: (task: Task) => void;
}): JSX.Element {
  const [start, setStart] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const days = Array.from({ length: DAY_COUNT }, (_, i) => addDays(start, i));
  const todayKey = toDayKey(new Date());

  const rows = new Map<string, Task[]>();
  tasks.forEach((t) => {
    const list = rows.get(t.assigneeId) ?? [];
    list.push(t);
    rows.set(t.assigneeId, list);
  });

  function goToday(): void {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setStart(d);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <Button variant="secondary" onClick={() => { setStart(addDays(start, -DAY_COUNT)); }}>← Prev</Button>
        <span className={styles.toolbarRange}>
          {formatDate(days[0])} – {formatDate(days[DAY_COUNT - 1])}
        </span>
        <Button variant="secondary" onClick={goToday}>Today</Button>
        <Button variant="secondary" onClick={() => { setStart(addDays(start, DAY_COUNT)); }}>Next →</Button>
      </div>
      <div className={styles.scroll}>
        <div
          className={styles.grid}
          style={{ gridTemplateColumns: `200px repeat(${DAY_COUNT}, minmax(36px, 1fr))` }}
        >
          {/* Header row */}
          <div className={styles.labelHeader} />
          {days.map((d) => {
            const key = toDayKey(d);
            const isToday = key === todayKey;
            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
            return (
              <div
                key={key}
                className={`${styles.dayHeader} ${isToday ? styles.today : ''} ${isWeekend ? styles.weekend : ''}`}
              >
                <span>{DAY_NAMES[d.getDay()]}</span>
                <span style={{ fontWeight: isToday ? 700 : 400 }}>{d.getDate()}</span>
              </div>
            );
          })}

          {/* Assignee rows */}
          {Array.from(rows.entries()).map(([assigneeId, list]) => {
            const name = names[assigneeId] ?? assigneeId.slice(0, 8);
            return [
              <div key={`${assigneeId}-label`} className={styles.assigneeLabel}>
                <span className={styles.assigneeInitials}>{initials(name)}</span>
                {name}
              </div>,
              <div key={`${assigneeId}-lane`} className={styles.lane}>
                {list.map((t) => {
                  const s = Math.max(
                    0,
                    Math.floor((new Date(t.startDate).getTime() - days[0].getTime()) / 86400000),
                  );
                  const e = Math.min(
                    DAY_COUNT - 1,
                    Math.floor((new Date(t.deadline).getTime() - days[0].getTime()) / 86400000),
                  );
                  if (e < 0 || s >= DAY_COUNT) return null;
                  const leftPct = (s / DAY_COUNT) * 100;
                  const widthPct = ((e - s + 1) / DAY_COUNT) * 100;
                  const isConflict = t.conflictWith.length > 0;
                  return (
                    <div
                      key={t.id}
                      title={`${t.title} · ${formatDate(t.startDate)} – ${formatDate(t.deadline)}`}
                      className={`${styles.bar} ${isConflict ? styles.barConflict : ''}`}
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        background: barColor(t.status),
                      }}
                      onClick={() => { onTaskClick?.(t); }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${t.title}, ${t.status}`}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onTaskClick?.(t); }}
                    >
                      <span className={styles.barLabel}>{t.title}</span>
                    </div>
                  );
                })}
              </div>,
            ];
          })}
        </div>
      </div>
    </div>
  );
}
