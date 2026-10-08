import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, ArrowUpRight, CheckCircle2, FileCheck2, FolderKanban, Inbox } from 'lucide-react';
import { AppLayout, PageContainer, PageHeader } from '../layout/AppLayout';
import { Avatar } from '../ui/Avatar';
import { ProgressBar } from '../ui/ProgressBar';
import { StatusBadge } from '../ui/StatusBadge';
import { PriorityBadge } from '../ui/PriorityBadge';
import { Skeleton, EmptyState } from '../ui/State';
import { dataStore } from '../../services/dataService';
import { formatDate } from '../../utils/dates';
import type { Role, Task } from '../../types';
import styles from './Workbench.module.css';

const copy: Record<Role, { title: string; description: string; queue: string; empty: string; signal: string }> = {
  manager: { title: 'Delivery overview', description: 'A considered view of the work in motion, the decisions waiting for you, and the next handoff.', queue: 'Next up', empty: 'Your delivery schedule is clear', signal: 'Keep the handoffs moving.' },
  client: { title: 'Your workspace', description: 'Follow delivery, share requirements, and keep every project moving from one calm place.', queue: 'Project updates', empty: 'Start with a project request', signal: 'Your team is shaping the work.' },
  assignee: { title: 'Your work', description: 'A focused view of your assignments, feedback, and the dates that shape this week.', queue: 'Work to focus on', empty: 'You’re all caught up', signal: 'A clear run at the work ahead.' },
  reviewer: { title: 'Review workspace', description: 'Give submitted work a clear decision and help your team ship with confidence.', queue: 'Ready for your review', empty: 'Your review queue is clear', signal: 'Good work deserves a considered read.' },
};

function dueLabel(deadline: string): string {
  const today = new Date();
  const [year, month, date] = deadline.split('-').map(Number);
  const difference = Math.round((Date.UTC(year, month - 1, date) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000);
  if (difference < 0) return `${Math.abs(difference)}d overdue`;
  if (difference === 0) return 'Due today';
  if (difference === 1) return 'Due tomorrow';
  return formatDate(deadline);
}

function taskPath(role: Role, task: Task): string {
  if (role === 'client') return `/client/projects/${task.projectId}`;
  return role === 'reviewer' ? `/reviewer/reviews/${task.id}` : `/${role}/tasks/${task.id}`;
}

export function Workbench({ role }: { role: Role }): JSX.Element {
  const [, render] = useState(0);
  useEffect(() => dataStore.subscribe(() => render((value) => value + 1)), []);

  const me = dataStore.getActiveUser();
  const projects = dataStore.getProjects();
  const tasks = dataStore.getTasks();
  const active = tasks.filter((task) => task.status !== 'approved');
  const queue = [...active]
    .filter((task) => role !== 'reviewer' || ['submitted', 'in_review'].includes(task.status))
    .sort((a, b) => Number(b.status === 'revision') - Number(a.status === 'revision') || a.deadline.localeCompare(b.deadline))
    .slice(0, 6);
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const overdue = active.filter((task) => task.deadline < todayKey);
  const revisions = active.filter((task) => task.status === 'revision');
  const reviews = tasks.filter((task) => ['submitted', 'in_review'].includes(task.status));
  const conflicts = role === 'manager' ? dataStore.getConflicts() : [];
  const activities = dataStore.getActivities().slice(0, 5);
  const loading = dataStore.isLoading();
  const error = dataStore.getError();
  const info = copy[role];
  const projectList = [...projects]
    .sort((a, b) => Number(a.status === 'completed') - Number(b.status === 'completed') || a.deadline.localeCompare(b.deadline))
    .slice(0, 5);
  const viewAll = role === 'client' ? '/client/projects' : role === 'reviewer' ? '/reviewer/queue' : `/${role}/tasks`;
  const projectCount = projects.filter((project) => project.status !== 'completed').length;
  const attentionCount = role === 'manager' ? conflicts.length + overdue.length : revisions.length + overdue.length;
  const signalItems = [
    { label: role === 'reviewer' ? 'Waiting for review' : 'Active projects', value: role === 'reviewer' ? reviews.length : projectCount, detail: role === 'reviewer' ? 'submissions in queue' : 'projects in motion', tone: 'sage' },
    { label: role === 'manager' ? 'Schedule signals' : 'Awaiting a decision', value: role === 'manager' ? conflicts.length : reviews.length, detail: role === 'manager' ? (conflicts.length > 0 ? 'overlaps to resolve' : 'No active scheduling conflicts') : 'items in review', tone: role === 'manager' && conflicts.length > 0 ? 'terracotta' : 'gold' },
    { label: 'Needs attention', value: attentionCount, detail: role === 'manager' ? 'overdue or overlapping' : 'revisions or overdue', tone: attentionCount > 0 ? 'terracotta' : 'stone' },
  ];

  return (
    <AppLayout role={role}>
      <PageContainer>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowMark}>TO / {String(today.getDate()).padStart(2, '0')}</span>
          <span>{today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          <span className={styles.divider}>·</span>
          <span>{me.name || 'Workspace'}</span>
        </div>

        <PageHeader
          title={info.title}
          description={info.description}
          action={<Link className={styles.headerAction} to={viewAll}>{role === 'client' ? 'All projects' : role === 'reviewer' ? 'Review queue' : 'All tasks'}<ArrowUpRight size={15} /></Link>}
        />

        <section className={styles.signalBand} aria-label="Workspace signals">
          <div className={styles.signalIntro}>
            <span className={styles.kicker}>THE WORKING VIEW</span>
            <strong>{info.signal}</strong>
            <p>{loading ? 'Gathering the latest workspace records…' : `${active.length} active task${active.length === 1 ? '' : 's'} across ${projectCount} current project${projectCount === 1 ? '' : 's'}.`}</p>
          </div>
          <div className={styles.signalList}>
            {signalItems.map((signal) => <div className={styles.signalItem} key={signal.label}>
              <span className={`${styles.signalDot} ${styles[signal.tone]}`} />
              <span className={styles.signalLabel}>{signal.label}</span>
              <strong>{loading ? '—' : signal.value}</strong>
              <span className={styles.signalDetail}>{signal.detail}</span>
            </div>)}
          </div>
        </section>

        {error !== '' && <div className={styles.error} role="alert"><AlertTriangle size={17} /><span>{error}</span><button type="button" onClick={() => { void dataStore.refresh(); }}>Try again</button></div>}

        <div className={styles.workspaceGrid}>
          <section className={`${styles.panel} ${styles.projectsPanel}`}>
            <div className={styles.panelHead}>
              <div><span className={styles.kicker}>PROJECT REGISTER</span><h2>Projects in motion</h2><p>Each project, its current pace, and the next meaningful date.</p></div>
              <Link className={styles.textAction} to={`/${role}/projects`}>View all<ArrowRight size={14} /></Link>
            </div>
            <div className={styles.tableHeader}><span>Project</span><span>Progress</span><span>Delivery</span><span>State</span></div>
            {loading && projects.length === 0 ? <Skeleton rows={4} /> : projectList.length === 0 ? <EmptyState text={info.empty} hint={role === 'client' ? 'Use New Request to share your goals and first requirements.' : 'Client requests appear here, ready to turn into a delivery plan.'} /> : <div className={styles.projectList}>
              {projectList.map((project, index) => <Link key={project.id} className={styles.projectRow} to={`/${role}/projects/${project.id}`}>
                <span className={styles.projectIndex}>{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.projectMark}><FolderKanban size={17} /></span>
                <span className={styles.projectInfo}><strong>{project.title}</strong><span>{role === 'manager' ? project.clientName || 'Client request' : project.description || `Due ${formatDate(project.deadline)}`}</span></span>
                <span className={styles.projectProgress}><span>{project.progress}% <small>{project.tasksCompleted ?? 0}/{project.totalTasks ?? 0} approved</small></span><ProgressBar value={project.progress} height={4} /></span>
                <span className={styles.projectDeadline}>{formatDate(project.deadline)}</span>
                <StatusBadge status={project.status} size="sm" />
                <ArrowUpRight className={styles.rowArrow} size={16} />
              </Link>)}
            </div>}
          </section>

          <aside className={styles.rail}>
            <section className={`${styles.panel} ${styles.nextPanel}`}>
              <div className={styles.panelHead}><div><span className={styles.kicker}>UP NEXT</span><h2>{info.queue}</h2><p>Ordered by the moment it matters.</p></div></div>
              {loading && tasks.length === 0 ? <Skeleton rows={4} /> : queue.length === 0 ? <EmptyState text={info.empty} hint={role === 'reviewer' ? 'New submissions will appear here when they are ready for your decision.' : 'New assignments will appear here as your projects move forward.'} /> : <div className={styles.taskList}>{queue.slice(0, 4).map((task) => <Link key={task.id} className={styles.taskRow} to={taskPath(role, task)}>
                <span className={`${styles.taskMarker} ${task.status === 'revision' ? styles.markerAlert : ''}`}>{role === 'reviewer' ? <FileCheck2 size={16} /> : task.status === 'revision' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}</span>
                <span className={styles.taskInfo}><strong>{task.title}</strong><span>{task.projectName || 'Project'}</span></span>
                <span className={task.deadline < todayKey ? styles.overdue : styles.due}>{dueLabel(task.deadline)}</span>
              </Link>)}</div>}
              {queue.length > 4 && <Link className={styles.railFooter} to={viewAll}>See the full queue<ArrowRight size={14} /></Link>}
            </section>

            <section className={`${styles.panel} ${styles.activityPanel}`}>
              <div className={styles.panelHead}><div><span className={styles.kicker}>RECENT NOTES</span><h2>Latest activity</h2></div></div>
              {loading && activities.length === 0 ? <Skeleton rows={3} /> : activities.length === 0 ? <div className={styles.quietState}><Inbox size={20} /><strong>A fresh start</strong><p>Assignments, submissions, and project updates will show up here.</p></div> : <div className={styles.activityList}>{activities.map((activity) => <div key={activity.id} className={styles.activityItem}><Avatar name={activity.actorName} size="sm" /><div><p><strong>{activity.actorName}</strong> {activity.description || activity.action}</p><time dateTime={activity.createdAt}>{activity.timeAgo}</time></div></div>)}</div>}
              <Link to="/notifications" className={styles.activityFooter}>Open your inbox<ArrowRight size={14} /></Link>
            </section>
          </aside>
        </div>

        {role === 'client' && <section className={styles.intake}><div><span className={styles.kicker}>KEEP THE CONTEXT CLOSE</span><h2>A clear brief makes better work.</h2><p>Add requirements or share feedback without losing the project’s thread.</p></div><div className={styles.intakeActions}><Link to="/client/requirements">Requirements<ArrowUpRight size={15} /></Link><Link to="/client/feedback">Share feedback<ArrowUpRight size={15} /></Link></div></section>}
      </PageContainer>
    </AppLayout>
  );
}
