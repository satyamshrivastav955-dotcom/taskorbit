import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, CheckCircle2, FolderKanban, Clock3, AlertTriangle, FileCheck2, Inbox } from 'lucide-react';
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

const copy: Record<Role, { title: string; description: string; queue: string; empty: string }> = {
  manager: { title: 'Delivery overview', description: 'See what needs a decision, where work stands, and what comes next.', queue: 'Next deadlines', empty: 'Your delivery schedule is clear' },
  client: { title: 'Your workspace', description: 'Follow delivery, share requirements, and keep every project moving.', queue: 'Project updates', empty: 'Start with a project request' },
  assignee: { title: 'Your work', description: 'A focused view of your assignments, feedback, and upcoming deadlines.', queue: 'Work to focus on', empty: 'You’re all caught up' },
  reviewer: { title: 'Review workspace', description: 'Give submitted work a clear decision and help your team ship with confidence.', queue: 'Ready for your review', empty: 'Your review queue is clear' },
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
  const queue = [...active].filter((task) => role !== 'reviewer' || ['submitted', 'in_review'].includes(task.status))
    .sort((a, b) => Number(b.status === 'revision') - Number(a.status === 'revision') || a.deadline.localeCompare(b.deadline)).slice(0, 6);
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const overdue = active.filter((task) => task.deadline < todayKey);
  const revisions = active.filter((task) => task.status === 'revision');
  const reviews = tasks.filter((task) => ['submitted', 'in_review'].includes(task.status));
  const conflicts = role === 'manager' ? dataStore.getConflicts() : [];
  const activities = dataStore.getActivities().slice(0, 6);
  const loading = dataStore.isLoading();
  const error = dataStore.getError();
  const info = copy[role];
  const projectList = [...projects].sort((a, b) => Number(a.status === 'completed') - Number(b.status === 'completed') || a.deadline.localeCompare(b.deadline)).slice(0, 5);
  const metricItems = role === 'client' ? [
    { label: 'Open projects', value: projects.filter((project) => project.status !== 'completed').length, hint: 'In your workspace' },
    { label: 'Requests with your team', value: projects.filter((project) => project.status === 'submitted').length, hint: 'With your delivery team' },
    { label: 'Approved work', value: tasks.filter((task) => task.status === 'approved').length, hint: 'Signed off by reviewers' },
    { label: 'Delivered projects', value: projects.filter((project) => project.status === 'completed').length, hint: 'Ready for your team' },
  ] : role === 'reviewer' ? [
    { label: 'Ready for review', value: reviews.length, hint: 'Submitted deliverables' },
    { label: 'Reviewing now', value: tasks.filter((task) => task.status === 'in_review').length, hint: 'Decisions in progress' },
    { label: 'Approved', value: tasks.filter((task) => task.status === 'approved').length, hint: 'Work signed off' },
    { label: 'Revisions requested', value: dataStore.getReviews().filter((review) => review.decision === 'rejected').length, hint: 'Across your review history' },
  ] : [
    { label: role === 'manager' ? 'Open projects' : 'Active assignments', value: role === 'manager' ? projects.filter((project) => project.status !== 'completed').length : active.length, hint: role === 'manager' ? 'Across the workspace' : 'Work assigned to you' },
    { label: 'In progress', value: tasks.filter((task) => task.status === 'in_progress').length, hint: 'Currently being worked on' },
    { label: 'Awaiting review', value: reviews.length, hint: 'Ready for a decision' },
    { label: 'Needs attention', value: role === 'manager' ? conflicts.length + overdue.length : revisions.length + overdue.length, hint: role === 'manager' ? 'Overlaps and overdue work' : 'Revisions and overdue work' },
  ];
  const viewAll = role === 'client' ? '/client/projects' : role === 'reviewer' ? '/reviewer/queue' : `/${role}/tasks`;

  return (
    <AppLayout role={role}>
      <PageContainer>
        <div className={styles.eyebrow}><span className={styles.orbitDot} /> {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}<span className={styles.divider}>/</span>{me.name || 'Workspace'}</div>
        <PageHeader title={info.title} description={info.description} action={<Link className={styles.secondaryAction} to={viewAll}>{role === 'client' ? 'All projects' : role === 'reviewer' ? 'Open review queue' : 'All tasks'}<ArrowUpRight size={15} /></Link>} />

        <div className={styles.metrics} aria-label="Workspace summary">
          {metricItems.map((metric) => <div key={metric.label} className={styles.metric}><span className={styles.metricLabel}>{metric.label}</span><strong className={styles.metricValue}>{loading ? '—' : metric.value}</strong><span className={styles.metricHint}>{metric.hint}</span></div>)}
        </div>
        {error !== '' && <div className={styles.error} role="alert"><AlertTriangle size={17} /><span>{error}</span><button type="button" onClick={() => { void dataStore.refresh(); }}>Try again</button></div>}

        <div className={styles.columns}>
          <div className={styles.primaryColumn}>
            {(role === 'manager' || role === 'client') && <section className={styles.panel}>
              <div className={styles.panelHead}><div><h2>Projects in motion</h2><p>From first request to final approval.</p></div><Link to={`/${role}/projects`} className={styles.textAction}>View all<ArrowRight size={14} /></Link></div>
              {loading && projects.length === 0 ? <Skeleton rows={4} /> : projectList.length === 0 ? <EmptyState text={info.empty} hint={role === 'client' ? 'Use New Request to share your goals and first requirements.' : 'Client requests appear here, ready to turn into a delivery plan.'} /> : <div className={styles.projectList}>{projectList.map((project) => <Link key={project.id} className={styles.projectRow} to={`/${role}/projects/${project.id}`}>
                <span className={styles.projectIcon}><FolderKanban size={18} /></span><span className={styles.projectInfo}><strong>{project.title}</strong><span>{role === 'manager' ? project.clientName || 'Client request' : `Due ${formatDate(project.deadline)}`}</span></span>
                <span className={styles.projectProgress}><span>{project.tasksCompleted ?? 0} / {project.totalTasks ?? 0} approved</span><ProgressBar value={project.progress} height={4} /></span><StatusBadge status={project.status} size="sm" /><ArrowUpRight className={styles.rowArrow} size={16} />
              </Link>)}</div>}
            </section>}

            {role !== 'client' && <section className={styles.panel}>
              <div className={styles.panelHead}><div><h2>{info.queue}</h2><p>{role === 'reviewer' ? 'Review the exact version your teammate submitted.' : 'Sorted by deadline, with revision work first.'}</p></div><Link className={styles.textAction} to={viewAll}>View all<ArrowRight size={14} /></Link></div>
              {loading && tasks.length === 0 ? <Skeleton rows={5} /> : queue.length === 0 ? <EmptyState text={info.empty} hint={role === 'reviewer' ? 'New submissions will appear here when they are ready for your decision.' : 'New assignments will appear here as your projects move forward.'} /> : <div>{queue.map((task) => <Link key={task.id} className={styles.taskRow} to={taskPath(role, task)}>
                <span className={styles.taskMarker}>{role === 'reviewer' ? <FileCheck2 size={17} /> : task.status === 'revision' ? <AlertTriangle size={17} /> : <CheckCircle2 size={17} />}</span><span className={styles.taskInfo}><strong>{task.title}</strong><span>{task.projectName || 'Project'}</span></span><span className={styles.taskMeta}><StatusBadge status={task.status} size="sm" /><span className={task.deadline < todayKey ? styles.overdue : styles.due}>{dueLabel(task.deadline)}</span></span><PriorityBadge priority={task.priority} size="sm" />
              </Link>)}</div>}
            </section>}

            {role === 'client' && <section className={styles.intake}><div><span className={styles.smallLabel}>A clear brief makes better work</span><h2>Keep the team aligned.</h2><p>Add requirements or share feedback without losing the context of a project.</p></div><div className={styles.intakeActions}><Link to="/client/requirements">Requirements<ArrowUpRight size={15} /></Link><Link to="/client/feedback">Share feedback<ArrowUpRight size={15} /></Link></div></section>}
          </div>

          <aside className={styles.secondaryColumn}>
            {role !== 'client' && <section className={styles.panel}>
              <div className={styles.panelHead}><div><h2>Worth your attention</h2><p>Updates that need a decision.</p></div></div>
              <div className={styles.attentionList}>
                {role === 'manager' && <Link className={styles.attentionItem} to="/manager/conflicts"><span className={styles.attentionIcon}><AlertTriangle size={17} /></span><span><strong>Schedule overlaps</strong><span>{conflicts.length ? `${conflicts.length} overlap${conflicts.length === 1 ? '' : 's'} to review` : 'No active scheduling conflicts'}</span></span><ArrowUpRight size={14} /></Link>}
                <Link className={styles.attentionItem} to={role === 'assignee' ? '/assignee/revisions' : role === 'reviewer' ? '/reviewer/history' : '/manager/projects'}><span className={styles.attentionIcon}><FileCheck2 size={17} /></span><span><strong>{role === 'assignee' ? 'Reviewer feedback' : role === 'reviewer' ? 'Your review history' : 'New project requests'}</strong><span>{role === 'assignee' ? `${revisions.length} revision${revisions.length === 1 ? '' : 's'} in progress` : role === 'reviewer' ? 'Decisions and previous versions' : `${projects.filter((project) => project.status === 'submitted').length} requests awaiting planning`}</span></span><ArrowUpRight size={14} /></Link>
                <Link className={styles.attentionItem} to={role === 'reviewer' ? '/reviewer/queue' : `/${role}/timeline`}><span className={styles.attentionIcon}><Clock3 size={17} /></span><span><strong>{role === 'reviewer' ? 'Review queue' : 'Delivery schedule'}</strong><span>{role === 'reviewer' ? 'Prioritize the next decision' : `${overdue.length} overdue task${overdue.length === 1 ? '' : 's'} · See the full timeline`}</span></span><ArrowUpRight size={14} /></Link>
              </div>
            </section>}
            <section className={styles.panel}>
              <div className={styles.panelHead}><div><h2>Latest activity</h2><p>Updates from your workspace.</p></div></div>
              {loading && activities.length === 0 ? <Skeleton rows={3} /> : activities.length === 0 ? <div className={styles.quietState}><Inbox size={22} /><strong>A fresh start</strong><p>Assignments, submissions, and project updates will show up here.</p></div> : <div className={styles.activityList}>{activities.map((activity) => <div key={activity.id} className={styles.activityItem}><Avatar name={activity.actorName} size="sm" /><div><p><strong>{activity.actorName}</strong> {activity.description || activity.action}</p><time dateTime={activity.createdAt}>{activity.timeAgo}</time></div></div>)}</div>}
              <Link to="/notifications" className={styles.activityFooter}>Open your inbox<ArrowRight size={14} /></Link>
            </section>
          </aside>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
