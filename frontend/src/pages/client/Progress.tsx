import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, FolderKanban, Loader2 } from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { dataStore } from '../../services/dataService';

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function dateToPercent(dateStr: string, startMs: number, totalMs: number): number {
  const d = new Date(dateStr);
  if (isNaN(d.getTime()) || totalMs <= 0) return 0;
  const ms = d.getTime() - startMs;
  return Math.max(0, Math.min(100, (ms / totalMs) * 100));
}

const PHASE_COLORS = [
  'var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)',
  'var(--chart-4)', 'var(--chart-5)', 'var(--chart-6)',
];

export function ClientProgress(): JSX.Element {
  const [, setTick] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  useEffect(() => dataStore.subscribe(() => setTick((t) => t + 1)), []);

  const projects = dataStore.getProjects();
  const loading = dataStore.isLoading();

  // Auto-select first project once data loads
  const effectiveId = selectedProjectId !== '' && projects.some((p) => p.id === selectedProjectId)
    ? selectedProjectId
    : projects[0]?.id ?? '';

  const project = projects.find((p) => p.id === effectiveId);
  const tasks = project ? dataStore.getTasks({ projectId: project.id }) : [];

  // Compute progress breakdown from real tasks
  const total = tasks.length;
  const approvedCount = tasks.filter((t) => t.status === 'approved').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress' || t.status === 'submitted' || t.status === 'in_review').length;
  const pendingCount = tasks.filter((t) => t.status === 'todo' || t.status === 'revision').length;
  const overallProgress = project?.progress ?? 0;

  const pctApproved = total === 0 ? 0 : Math.round((approvedCount / total) * 100);
  const pctInProgress = total === 0 ? 0 : Math.round((inProgressCount / total) * 100);
  const pctPending = total === 0 ? 0 : Math.round((pendingCount / total) * 100);
  const pctOverdue = Math.max(0, 100 - pctApproved - pctInProgress - pctPending);

  // Build Gantt rows from real tasks — grouped into phases by date proximity
  const parsedStart = project ? new Date(project.startDate).getTime() : NaN;
  const parsedEnd = project ? new Date(project.deadline).getTime() : NaN;
  const ganttStartMs = isNaN(parsedStart) ? Date.now() : parsedStart;
  const ganttEndMs = isNaN(parsedEnd) ? ganttStartMs + 86400000 * 30 : parsedEnd;
  const totalMs = Math.max(1, ganttEndMs - ganttStartMs);

  const today = Date.now();
  const todayPct = project ? dateToPercent(new Date(today).toISOString().slice(0, 10), ganttStartMs, totalMs) : 0;

  // Month markers for header
  function getMonthMarkers(): string[] {
    if (!project) return [];
    const markers: string[] = [];
    const start = new Date(ganttStartMs);
    const end = new Date(ganttEndMs);
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    let guard = 0;
    while (cur <= end && guard < 12) {
      markers.push(cur.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      cur.setMonth(cur.getMonth() + 1);
      guard++;
    }
    return markers.slice(0, 4);
  }
  const monthMarkers = getMonthMarkers();

  // Upcoming tasks (not approved, sorted by deadline)
  const upcomingTasks = [...tasks]
    .filter((t) => t.status !== 'approved')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  if (loading && projects.length === 0) {
    return (
      <AppLayout role="client">
        <PageContainer>
          <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>Project Progress</h1>
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', textAlign: 'center', padding: '60px 20px' }}>
            <Loader2 size={36} color="var(--primary)" style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Loading project timelines…
            </p>
          </div>
        </PageContainer>
      </AppLayout>
    );
  }

  if (projects.length === 0) {
    return (
      <AppLayout role="client">
        <PageContainer>
          <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>Project Progress</h1>
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', textAlign: 'center', padding: '60px 20px' }}>
            <FolderKanban size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              No projects yet
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Project timelines and milestones will appear here once your projects are active.
            </p>
          </div>
        </PageContainer>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="client">
      <PageContainer>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Project Progress</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Visualize project timelines, milestones, and overall progress.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '100%' }}>
            <select
              value={effectiveId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              aria-label="Project timeline"
              style={{ maxWidth: '100%', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '13px', fontWeight: 600 }}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Grid */}
        <div className="responsive-grid" style={{ gridTemplateColumns: '2.4fr 1fr', gap: '20px' }}>
          {/* Gantt-style task timeline */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '22px', minWidth: 0, overflowX: 'auto' }}>
            <div style={{ minWidth: '640px', position: 'relative', paddingTop: '18px' }}>
            {/* Header Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: `180px repeat(${Math.max(2, monthMarkers.length)}, 1fr)`, borderBottom: '1px solid var(--border)', paddingBottom: '10px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <div>Task</div>
              {monthMarkers.map((m) => (
                <div key={m} style={{ textAlign: 'center', position: 'relative' }}>
                  {m}
                  {new Date(today).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) === m && (
                    <span style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'var(--on-primary)', fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '3px' }}>
                      Today
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Today line */}
            {project && (
              <div
                style={{
                  position: 'absolute',
                  top: '55px',
                  bottom: '25px',
                  left: `calc(180px + (100% - 180px) * ${todayPct / 100})`,
                  width: '1px',
                  borderLeft: '1.5px dashed var(--action-blue)',
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Task Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <Calendar size={32} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    No tasks assigned to this project yet.
                  </p>
                </div>
              ) : (
                tasks.map((task, i) => {
                  const taskStartPct = project ? dateToPercent(task.startDate, ganttStartMs, totalMs) : 0;
                  const taskEndPct = project ? dateToPercent(task.deadline, ganttStartMs, totalMs) : 0;
                  const spanPct = Math.max(2, taskEndPct - taskStartPct);
                  const isCompleted = task.status === 'approved';
                  const color = PHASE_COLORS[i % PHASE_COLORS.length];
                  return (
                    <div key={task.id} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', overflow: 'hidden' }}>
                        <CheckCircle2 size={16} color={isCompleted ? 'var(--success)' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
                        <span style={{ fontWeight: 500, color: isCompleted ? 'var(--text-primary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {task.title}
                        </span>
                      </div>

                      <div style={{ position: 'relative', height: '24px', background: 'var(--surface-muted)', borderRadius: '6px' }}>
                        <div
                          title={`${task.title}: ${task.startDate} → ${task.deadline}`}
                          style={{
                            position: 'absolute',
                            left: `${taskStartPct}%`,
                            width: `${spanPct}%`,
                            height: '20px',
                            top: '2px',
                            background: color,
                            borderRadius: '4px',
                            fontSize: '10.5px',
                            fontWeight: 600,
                            color: 'var(--on-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'var(--shadow-sm)',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {spanPct > 8 ? task.title.slice(0, 14) : ''}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            </div>
          </div>
          {/* Right Progress Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ margin: '10px 0' }}>
                <ProgressRing
                  percentage={overallProgress}
                  size={130}
                  strokeWidth={12}
                  sublabel={overallProgress >= 75 ? 'On Track' : overallProgress >= 40 ? 'In Progress' : 'Starting'}
                  color={overallProgress >= 75 ? 'var(--success)' : 'var(--action-blue)'}
                />
              </div>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                    Completed
                  </span>
                  <strong>{pctApproved}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--action-blue)' }} />
                    In Progress
                  </span>
                  <strong>{pctInProgress}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }} />
                    Pending
                  </span>
                  <strong>{pctPending}%</strong>
                </div>
                {pctOverdue > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }} />
                      Other
                    </span>
                    <strong>{pctOverdue}%</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Upcoming Deadlines</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
                {upcomingTasks.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No upcoming tasks.</p>
                ) : (
                  upcomingTasks.map((t) => (
                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{t.title}</span>
                      <span style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: '8px' }}>{t.deadline}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
