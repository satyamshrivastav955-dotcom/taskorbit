import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { AlertTriangle, ArrowUpRight, CalendarDays, CheckCircle2, Clock3, Filter, RefreshCw, Search, SlidersHorizontal } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { Avatar } from '../../components/ui/Avatar';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { Skeleton } from '../../components/ui/State';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { dataStore } from '../../services/dataService';
import type { Project, Task, TaskStatus, UserProfile } from '../../types';
import styles from './Timeline.module.css';

type TimelineFilter = 'all' | 'active' | 'attention' | 'completed';

interface DateRange {
  start: number;
  end: number;
  total: number;
}

interface DateTick {
  label: string;
  position: number;
}

function dateValue(value: string): number {
  const parsed = new Date(`${value}T00:00:00`).getTime();
  return Number.isNaN(parsed) ? Date.now() : parsed;
}

function formatDate(value: string | number): string {
  return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric' }).format(typeof value === 'number' ? new Date(value) : new Date(`${value}T00:00:00`));
}

function formatRange(start: string, end: string): string {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function dayCount(start: number, end: number): number {
  return Math.max(1, Math.round((end - start) / 86400000));
}

function timelineRange(project: Project | undefined, tasks: Task[]): DateRange {
  const values = project === undefined
    ? tasks.flatMap((task) => [dateValue(task.startDate), dateValue(task.deadline)])
    : [dateValue(project.startDate), dateValue(project.deadline), ...tasks.flatMap((task) => [dateValue(task.startDate), dateValue(task.deadline)])];
  const start = Math.min(...values, Date.now()) - 86400000;
  const end = Math.max(...values, start + 86400000) + 86400000;
  return { start, end, total: Math.max(1, end - start) };
}

function position(value: string, range: DateRange): number {
  return Math.max(0, Math.min(100, ((dateValue(value) - range.start) / range.total) * 100));
}

function dateTicks(range: DateRange): DateTick[] {
  const days = dayCount(range.start, range.end);
  const count = Math.min(8, Math.max(4, Math.ceil(days / 7)));
  return Array.from({ length: count + 1 }, (_, index) => ({
    label: formatDate(range.start + (range.total * index) / count),
    position: (index / count) * 100,
  }));
}

function isOverdue(task: Task): boolean {
  return task.status !== 'approved' && dateValue(task.deadline) < new Date(new Date().toDateString()).getTime();
}

function isDueSoon(task: Task): boolean {
  if (task.status === 'approved') return false;
  const days = Math.ceil((dateValue(task.deadline) - Date.now()) / 86400000);
  return days >= 0 && days <= 7;
}

function statusClass(status: TaskStatus): string {
  const classes: Record<TaskStatus, string> = {
    todo: styles.statusTodo,
    in_progress: styles.statusProgress,
    submitted: styles.statusSubmitted,
    in_review: styles.statusReview,
    revision: styles.statusRevision,
    approved: styles.statusApproved,
  };
  return classes[status];
}

function taskOwner(task: Task, users: UserProfile[]): UserProfile | undefined {
  return users.find((user) => user.uid === task.assigneeId);
}

function taskFilter(task: Task, filter: TimelineFilter, conflictIds: Set<string>): boolean {
  if (filter === 'completed') return task.status === 'approved';
  if (filter === 'active') return task.status !== 'approved';
  if (filter === 'attention') return isOverdue(task) || task.status === 'revision' || conflictIds.has(task.id);
  return true;
}

export function ManagerTimeline(): JSX.Element {
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [filter, setFilter] = useState<TimelineFilter>('all');
  const [search, setSearch] = useState('');

  useEffect(() => dataStore.subscribe(() => setTick((value) => value + 1)), []);

  const projects = dataStore.getProjects();
  const tasks = dataStore.getTasks();
  const users = dataStore.getUsers();
  const conflicts = dataStore.getConflicts();
  const loading = dataStore.isLoading();
  const error = dataStore.getError();
  const project = projects.find((item) => item.id === selectedProjectId) ?? projects[0];
  const projectTasks = useMemo(() => tasks.filter((task) => task.projectId === project?.id), [project?.id, tasks]);
  const conflictIds = useMemo(() => new Set(conflicts.flatMap((conflict) => [conflict.taskA.id, conflict.taskB.id])), [conflicts]);
  const visibleTasks = useMemo(() => projectTasks.filter((task) => task.title.toLowerCase().includes(search.trim().toLowerCase()) && taskFilter(task, filter, conflictIds)), [projectTasks, search, filter, conflictIds]);
  const range = useMemo(() => timelineRange(project, projectTasks), [project, projectTasks]);
  const ticks = useMemo(() => dateTicks(range), [range]);
  const activeTask = projectTasks.find((task) => task.id === selectedTaskId) ?? visibleTasks[0];
  const groups = useMemo(() => {
    const grouped = new Map<string, Task[]>();
    visibleTasks.forEach((task) => grouped.set(task.assigneeId || 'unassigned', [...(grouped.get(task.assigneeId || 'unassigned') ?? []), task]));
    return [...grouped.entries()];
  }, [visibleTasks]);

  const summary = useMemo(() => ({
    total: projectTasks.length,
    complete: projectTasks.filter((task) => task.status === 'approved').length,
    active: projectTasks.filter((task) => task.status !== 'approved').length,
    dueSoon: projectTasks.filter(isDueSoon).length,
    conflicts: projectTasks.filter((task) => conflictIds.has(task.id)).length,
  }), [projectTasks, conflictIds]);

  function selectProject(id: string): void {
    setSelectedProjectId(id);
    setSelectedTaskId('');
    setSearch('');
    setFilter('all');
  }

  return (
    <AppLayout role="manager" conflictCount={conflicts.length}>
      <PageContainer>
        <div className={styles.header}>
          <div>
            <div className={styles.eyebrow}><span className={styles.eyebrowDot} /> Delivery control room</div>
            <h1 className={styles.title}>Timeline</h1>
            <p className={styles.subtitle}>See ownership, dates, and delivery pressure across a project before it becomes a blocker.</p>
          </div>
          <div className={styles.headerActions}>
            <button type="button" className={styles.refreshButton} onClick={() => { void dataStore.refresh(); }}><RefreshCw size={15} /> Refresh data</button>
            <Link className={styles.primaryAction} to="/manager/conflicts"><AlertTriangle size={15} /> Review conflicts{conflicts.length > 0 ? ` (${conflicts.length})` : ''}</Link>
          </div>
        </div>

        <div className={styles.summaryStrip} aria-label="Timeline summary">
          <div><span>Total tasks</span><strong>{loading && tasks.length === 0 ? '—' : summary.total}</strong><small>In this project</small></div>
          <div><span>Active work</span><strong>{summary.active}</strong><small>Not yet approved</small></div>
          <div><span>Due this week</span><strong className={summary.dueSoon > 0 ? styles.warningValue : ''}>{summary.dueSoon}</strong><small>Needs a close look</small></div>
          <div><span>Schedule signals</span><strong className={summary.conflicts > 0 ? styles.dangerValue : styles.goodValue}>{summary.conflicts}</strong><small>{summary.conflicts > 0 ? 'Conflicts in view' : 'No overlap in view'}</small></div>
        </div>

        <div className={styles.controlBar}>
          <div className={styles.projectControl}>
            <label htmlFor="timeline-project"><span>PROJECT</span><select id="timeline-project" value={project?.id ?? ''} onChange={(event) => selectProject(event.target.value)}><option value="">Select a project</option>{projects.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
            {project ? <span className={styles.projectDates}><CalendarDays size={15} /> {formatRange(project.startDate, project.deadline)}</span> : null}
          </div>
          <div className={styles.filters}>
            <label className={styles.searchBox}><Search size={15} /><input aria-label="Search timeline tasks" placeholder="Search tasks" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
            <div className={styles.filterGroup} role="group" aria-label="Filter timeline tasks">
              {(['all', 'active', 'attention', 'completed'] as TimelineFilter[]).map((item) => <button type="button" key={item} className={filter === item ? styles.filterActive : ''} onClick={() => setFilter(item)}><Filter size={13} /> {item === 'all' ? 'All' : item === 'active' ? 'Active' : item === 'attention' ? 'Attention' : 'Completed'}</button>)}
            </div>
          </div>
        </div>

        {error !== '' && <div className={styles.errorState} role="alert"><AlertTriangle size={17} /><span>{error}</span><button type="button" onClick={() => { void dataStore.refresh(); }}>Try again</button></div>}

        {!project && loading ? <section className={styles.loadingCard} aria-label="Loading timeline"><Skeleton rows={5} /></section> : !project ? <section className={styles.emptyState}><CalendarDays size={25} /><strong>No project timelines yet</strong><p>Projects with assigned tasks will appear here automatically.</p><Link to="/manager/projects">Open projects <ArrowUpRight size={14} /></Link></section> : (
          <div className={styles.timelineLayout}>
            <section className={styles.timelineCard} aria-label={`${project.title} timeline`}>
              <div className={styles.timelineCardHeader}><div><span className={styles.cardKicker}>PROJECT DELIVERY</span><h2>{project.title}</h2><p>{project.clientName || 'Client project'} · {project.progress}% complete</p></div><StatusBadge status={project.status} size="sm" /></div>
              <div className={styles.timelineScroll}>
                <div className={styles.timelineCanvas}>
                  <div className={styles.timelineHeader}>
                    <div className={styles.taskColumnLabel}>ASSIGNEE / TASK</div>
                    <div className={styles.dateScale}>{ticks.map((tick) => <span key={`${tick.position}-${tick.label}`} style={{ left: `${tick.position}%` }}>{tick.label}</span>)}</div>
                  </div>
                  <div className={styles.timelineRows}>
                    {ticks.map((tick) => <span className={styles.gridLine} key={`line-${tick.position}`} style={{ left: `calc(230px + (100% - 230px) * ${tick.position / 100})` }} />)}
                    {position(new Date().toISOString().slice(0, 10), range) > 0 && position(new Date().toISOString().slice(0, 10), range) < 100 ? <span className={styles.todayLine} style={{ left: `calc(230px + (100% - 230px) * ${position(new Date().toISOString().slice(0, 10), range) / 100})` }}><b>Today</b></span> : null}
                    {groups.length === 0 ? <div className={styles.noMatches}><SlidersHorizontal size={18} /><strong>No tasks match this view</strong><span>Clear the search or choose another timeline filter.</span><button type="button" onClick={() => { setFilter('all'); setSearch(''); }}>Reset view</button></div> : groups.map(([assigneeId, groupedTasks]) => {
                      const assignee = users.find((user) => user.uid === assigneeId);
                      return <div className={styles.assigneeGroup} key={assigneeId}>
                        <div className={styles.assigneeLabel}><Avatar name={assignee?.name ?? 'Unassigned'} size="sm" /><span><strong>{assignee?.name ?? 'Unassigned'}</strong><small>{groupedTasks.length} {groupedTasks.length === 1 ? 'task' : 'tasks'}</small></span></div>
                        <div className={styles.assigneeTasks}>{groupedTasks.map((task) => {
                          const left = position(task.startDate, range);
                          const right = position(task.deadline, range);
                          const width = Math.max(2.8, right - left);
                          const owner = taskOwner(task, users);
                          const barStyle = { left: `${left}%`, width: `${width}%`, '--bar-delay': `${Math.min(groupedTasks.indexOf(task) * 70, 280)}ms` } as CSSProperties;
                          return <button type="button" className={`${styles.taskTimelineRow} ${activeTask?.id === task.id ? styles.taskSelected : ''}`} key={task.id} onClick={() => setSelectedTaskId(task.id)}>
                            <span className={styles.taskLabel}><strong>{task.title}</strong><small>{owner?.name ?? 'Unassigned'} · {formatDate(task.deadline)}</small></span>
                            <span className={`${styles.taskTrack} ${isOverdue(task) ? styles.trackOverdue : ''}`}><span className={`${styles.taskBar} ${statusClass(task.status)}`} style={barStyle}><i />{task.status === 'approved' ? 'Complete' : isOverdue(task) ? 'Overdue' : task.status === 'revision' ? 'Revision' : task.status === 'in_review' ? 'Review' : 'In motion'}</span></span>
                            {conflictIds.has(task.id) ? <AlertTriangle className={styles.taskWarning} size={14} aria-label="Schedule conflict" /> : null}
                          </button>;
                        })}</div>
                      </div>;
                    })}
                  </div>
                </div>
              </div>
              <div className={styles.timelineLegend}><span><i className={styles.legendBlue} />In progress</span><span><i className={styles.legendTeal} />In review</span><span><i className={styles.legendAmber} />Revision</span><span><i className={styles.legendGreen} />Approved</span><span><i className={styles.legendToday} />Today</span></div>
            </section>

            <aside className={styles.detailPanel} aria-live="polite">
              {activeTask ? <>
                <div className={styles.detailKicker}><span>SELECTED TASK</span>{conflictIds.has(activeTask.id) ? <span className={styles.conflictPill}><AlertTriangle size={12} /> Conflict</span> : null}</div>
                <h2>{activeTask.title}</h2>
                <p className={styles.detailProject}>{activeTask.projectName || project.title}</p>
                <div className={styles.detailStatus}><StatusBadge status={activeTask.status} size="sm" /><PriorityBadge priority={activeTask.priority} size="sm" /></div>
                <div className={styles.detailDates}><div><span>START</span><strong>{formatDate(activeTask.startDate)}</strong></div><div><span>DUE</span><strong className={isOverdue(activeTask) ? styles.dangerText : ''}>{formatDate(activeTask.deadline)}</strong></div></div>
                <div className={styles.detailPeople}><div><span>ASSIGNEE</span><div><Avatar name={taskOwner(activeTask, users)?.name ?? 'Unassigned'} size="sm" /><strong>{taskOwner(activeTask, users)?.name ?? 'Unassigned'}</strong></div></div><div><span>REVIEWER</span><div><Avatar name={users.find((user) => user.uid === activeTask.reviewerId)?.name ?? 'Unassigned'} size="sm" /><strong>{users.find((user) => user.uid === activeTask.reviewerId)?.name ?? 'Unassigned'}</strong></div></div></div>
                <div className={styles.detailDescription}>{activeTask.description || 'No task description has been added yet.'}</div>
                <Link className={styles.openTask} to={`/manager/tasks/${activeTask.id}`}>Open task details <ArrowUpRight size={15} /></Link>
              </> : <div className={styles.detailEmpty}><Clock3 size={21} /><strong>Select a task</strong><span>Choose a bar to inspect dates, ownership, and delivery status.</span></div>}
            </aside>
          </div>
        )}
      </PageContainer>
    </AppLayout>
  );
}
