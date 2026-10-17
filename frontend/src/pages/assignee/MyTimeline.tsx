import { useEffect, useMemo, useState } from 'react';
import { Calendar, CheckSquare, Inbox, Loader2 } from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { dataStore } from '../../services/demoData';
import styles from './AssigneePages.module.css';

const BAR_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-6)'];

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function validDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function AssigneeTimeline(): JSX.Element {
  const [, setTick] = useState(0);
  useEffect(() => dataStore.subscribe(() => setTick((value) => value + 1)), []);

  const me = dataStore.getActiveUser();
  const tasks = dataStore.getTasks({ assigneeId: me.uid });
  const loading = dataStore.isLoading();
  const error = dataStore.getError();

  const timeline = useMemo(() => {
    const datedTasks = tasks
      .map((task) => ({ task, start: validDate(task.startDate), end: validDate(task.deadline) }))
      .filter((item): item is { task: (typeof tasks)[number]; start: Date; end: Date } => item.start !== null && item.end !== null);

    if (datedTasks.length === 0) return null;

    const startMs = Math.min(...datedTasks.map((item) => item.start.getTime()));
    const endMs = Math.max(...datedTasks.map((item) => item.end.getTime()));
    const padding = Math.max(86400000, Math.round((endMs - startMs) * 0.06));
    const rangeStart = new Date(startMs - padding);
    const rangeEnd = new Date(endMs + padding);
    const totalMs = Math.max(1, rangeEnd.getTime() - rangeStart.getTime());
    const markerCount = 5;
    const markers = Array.from({ length: markerCount }, (_, index) => {
      const timestamp = rangeStart.getTime() + (totalMs * index) / (markerCount - 1);
      return new Date(timestamp);
    });

    return {
      rangeStart,
      rangeEnd,
      markers,
      rows: datedTasks.map(({ task, start, end }, index) => {
        const left = Math.max(0, Math.min(100, ((start.getTime() - rangeStart.getTime()) / totalMs) * 100));
        const right = Math.max(left, Math.min(100, ((end.getTime() - rangeStart.getTime()) / totalMs) * 100));
        return {
          task,
          left,
          width: Math.max(2, right - left),
          color: BAR_COLORS[index % BAR_COLORS.length],
        };
      }),
    };
  }, [tasks]);

  const today = Date.now();
  const todayPosition = timeline
    ? Math.max(0, Math.min(100, ((today - timeline.rangeStart.getTime()) / (timeline.rangeEnd.getTime() - timeline.rangeStart.getTime())) * 100))
    : 0;

  return (
    <AppLayout role="assignee">
      <PageContainer>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>My Timeline</h1>
            <p className={styles.subtitle}>See your assigned work and delivery windows at a glance.</p>
          </div>
        </div>

        <div className={styles.timelineToolbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <Calendar size={15} color="var(--primary)" aria-hidden="true" />
            <span>
              {timeline ? `${formatDate(timeline.rangeStart)} – ${formatDate(timeline.rangeEnd)}` : 'No dated assignments'}
            </span>
          </div>
          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} assigned
          </span>
        </div>

        {loading && tasks.length === 0 ? (
          <div className={styles.emptyState} style={{ border: '1px solid var(--border)', borderRadius: '14px', background: '#fff' }} role="status">
            <Loader2 size={32} color="var(--primary)" style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} aria-hidden="true" />
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Loading your timeline…</p>
          </div>
        ) : error !== '' && tasks.length === 0 ? (
          <div className={styles.emptyState} style={{ border: '1px solid #FECACA', borderRadius: '14px', background: '#FFF7F7' }} role="alert">
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#B91C1C' }}>Timeline unavailable</p>
            <p style={{ marginTop: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>{error}</p>
          </div>
        ) : timeline === null ? (
          <div className={styles.emptyState} style={{ border: '1px solid var(--border)', borderRadius: '14px', background: '#fff' }}>
            <Inbox size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} aria-hidden="true" />
            <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {tasks.length === 0 ? 'No tasks assigned yet' : 'No dated tasks to display'}
            </p>
            <p style={{ marginTop: '5px', fontSize: '13px', color: 'var(--text-muted)' }}>
              {tasks.length === 0 ? 'Assignments will appear here when a manager adds them to your queue.' : 'Add start and due dates to your assignments to see them on the timeline.'}
            </p>
          </div>
        ) : (
          <div className={styles.timelineViewport}>
            <div className={styles.timelineGrid}>
              <div className={styles.timelineHeader}>
                <div>Task</div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${timeline.markers.length}, 1fr)` }}>
                  {timeline.markers.map((marker) => <span key={marker.toISOString()}>{formatShortDate(marker)}</span>)}
                </div>
              </div>

              {todayPosition > 0 && todayPosition < 100 && (
                <div
                  aria-hidden="true"
                  style={{ position: 'absolute', top: '55px', bottom: '25px', left: `calc(200px + (100% - 244px) * ${todayPosition / 100})`, width: '1px', borderLeft: '1.5px dashed var(--action-blue)', pointerEvents: 'none' }}
                />
              )}

              <div className={styles.timelineRows}>
                {timeline.rows.map(({ task, left, width, color }) => (
                  <div key={task.id} className={styles.timelineRow}>
                    <div className={styles.timelineTaskName} title={task.title}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                        <CheckSquare size={15} color={task.status === 'approved' ? 'var(--success)' : 'var(--primary)'} aria-hidden="true" />
                        {task.title}
                      </span>
                    </div>
                    <div className={styles.timelineTrack}>
                      <div className={styles.timelineBar} style={{ left: `${left}%`, width: `${width}%`, background: color }} title={`${task.title}: ${task.startDate} → ${task.deadline}`}>
                        {task.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </AppLayout>
  );
}
