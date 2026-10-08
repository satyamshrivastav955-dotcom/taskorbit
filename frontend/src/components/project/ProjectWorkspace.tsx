import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Plus, Copy, FileText, CheckCircle2 } from 'lucide-react';
import { AppLayout, PageContainer, PageHeader } from '../layout/AppLayout';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { EmptyState, ErrorState, Skeleton } from '../ui/State';
import { ProgressBar } from '../ui/ProgressBar';
import { StatusBadge } from '../ui/StatusBadge';
import { useToast } from '../ui/Toast';
import { CreateTaskModal } from '../modals/CreateTaskModal';
import { Timeline } from './Timeline';
import { dataStore } from '../../services/dataService';
import { apiPut } from '../../services/api';
import { formatDate } from '../../utils/dates';
import styles from './ProjectWorkspace.module.css';

type Tab = 'overview' | 'tasks' | 'milestones' | 'timeline' | 'team' | 'documents' | 'feedback' | 'activity';

export function ProjectWorkspace({ role }: { role: 'client' | 'manager' }): JSX.Element {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [, render] = useState(0);
  const [tab, setTab] = useState<Tab>('overview');
  const [createTask, setCreateTask] = useState(false);
  const [savingFeedback, setSavingFeedback] = useState('');
  useEffect(() => dataStore.subscribe(() => render((value) => value + 1)), []);
  const project = dataStore.getProjectById(id);
  const loading = dataStore.isLoading();
  const error = dataStore.getError();
  if (!project) return <AppLayout role={role}><PageContainer>{loading ? <Skeleton rows={6} /> : error ? <ErrorState message="Project unavailable" reason={error} onRetry={() => { void dataStore.refresh(); }} /> : <EmptyState text="Project not found" hint="It may have been removed, or is not available in your workspace." action={<Link to={`/${role}/projects`}>Back to projects</Link>} />}</PageContainer></AppLayout>;

  const tasks = dataStore.getTasks({ projectId: id });
  const requirements = dataStore.getRequirements(id);
  const members = dataStore.getUsers().filter((user) => (project.teamIds ?? []).includes(user.uid) || user.uid === project.managerId);
  const activities = dataStore.getActivities(id);
  const feedback = dataStore.getFeedbacks().filter((item) => item.projectId === id);
  const documents = [
    ...dataStore.getDocuments(id).map((file) => ({ id: String(file.id), name: String(file.name), url: String(file.url), kind: 'Project document' })),
    ...requirements.flatMap((requirement) => (requirement.files ?? []).map((file) => ({ id: file.id, name: file.name, url: file.url, kind: requirement.title }))),
    ...dataStore.getSubmissions().filter((submission) => tasks.some((task) => task.id === submission.taskId && (role === 'manager' || task.status === 'approved'))).flatMap((submission) => (submission.files?.length ? submission.files : [{ id: submission.id, name: submission.fileName, url: submission.fileUrl }]).map((file) => ({ id: `${submission.id}-${file.id}`, name: file.name, url: file.url, kind: `Deliverable · version ${submission.version}` }))),
  ];
  const tabs: Tab[] = role === 'manager' ? ['overview', 'tasks', 'timeline', 'team', 'documents', 'feedback', 'activity'] : ['overview', 'milestones', 'tasks', 'documents', 'feedback', 'activity'];
  const names = Object.fromEntries(dataStore.getUsers().map((user) => [user.uid, user.name]));
  const share = async (): Promise<void> => { try { if (!navigator.clipboard) throw new Error('Copy is unavailable in this browser.'); await navigator.clipboard.writeText(window.location.href); toast('Project link copied.', 'success'); } catch (cause) { toast(cause instanceof Error ? cause.message : 'Could not copy the link.', 'error'); } };
  const respond = async (feedbackId: string, status: string): Promise<void> => { setSavingFeedback(feedbackId); try { await apiPut(`/feedback/${feedbackId}`, { status }); await dataStore.refresh(); toast('Feedback status updated.', 'success'); } catch (cause) { toast(cause instanceof Error ? cause.message : 'Could not update feedback.', 'error'); } finally { setSavingFeedback(''); } };

  return <AppLayout role={role}><PageContainer>
    <Link className={styles.back} to={`/${role}/projects`}><ArrowLeft size={14} /> Projects</Link>
    <PageHeader title={project.title} description={role === 'manager' ? `${project.clientName || 'Client project'} · ${formatDate(project.startDate)} – ${formatDate(project.deadline)}` : `Delivery planned for ${formatDate(project.deadline)}`} action={<><Button variant="secondary" onClick={() => { void share(); }}><Copy size={14} /> Copy link</Button>{role === 'manager' && <Button onClick={() => setCreateTask(true)}><Plus size={15} /> Add task</Button>}</>} />
    <div className={styles.summary}><StatusBadge status={project.status} /><span>{tasks.filter((task) => task.status === 'approved').length} of {tasks.length} tasks approved</span><div className={styles.summaryProgress}><ProgressBar value={project.progress} height={5} /><strong>{project.progress}%</strong></div></div>
    <div className={styles.tabs} aria-label="Project sections">{tabs.map((key) => <button type="button" key={key} className={tab === key ? styles.active : ''} aria-pressed={tab === key} onClick={() => setTab(key)}>{key === 'documents' ? 'Files' : key.charAt(0).toUpperCase() + key.slice(1)}</button>)}</div>
    <div key={tab} className={styles.tabContent}>
      {tab === 'overview' && <div className={styles.columns}><section className={styles.panel}><h2>The brief</h2><p className={styles.description}>{project.description || 'No project description has been added yet.'}</p><div className={styles.facts}><div><span>Start date</span><strong>{formatDate(project.startDate)}</strong></div><div><span>Delivery date</span><strong>{formatDate(project.deadline)}</strong></div><div><span>Project manager</span><strong>{names[project.managerId ?? ''] || 'Awaiting assignment'}</strong></div><div><span>Priority</span><strong>{project.priority}</strong></div></div></section><section className={styles.panel}><h2>Requirements</h2>{requirements.length ? requirements.map((requirement) => <div className={styles.listItem} key={requirement.id}><div><strong>{requirement.title}</strong><p>{requirement.details || 'No additional details.'}</p></div><span className={styles.muted}>{requirement.status}</span></div>) : <EmptyState text="A brief is just the beginning" hint="Client requirements will appear here as the scope takes shape." />}{role === 'client' && <Link className={styles.textAction} to="/client/requirements">Manage requirements<ArrowUpRight size={14} /></Link>}</section></div>}
      {tab === 'tasks' && <section className={styles.panel}><h2>Delivery tasks</h2>{tasks.length === 0 ? <EmptyState text="The delivery plan is taking shape" hint="Assigned tasks and their review status will appear here." /> : <div className={styles.tableScroll}><table><thead><tr><th>Task</th>{role === 'manager' && <th>Assignee</th>}<th>Due</th><th>Status</th></tr></thead><tbody>{tasks.map((task) => <tr key={task.id}><td>{role === 'manager' ? <Link to={`/manager/tasks/${task.id}`}>{task.title}</Link> : <strong>{task.title}</strong>}</td>{role === 'manager' && <td>{names[task.assigneeId] || 'Assignee'}</td>}<td>{formatDate(task.deadline)}</td><td><StatusBadge status={task.status} size="sm" /></td></tr>)}</tbody></table></div>}</section>}
      {tab === 'milestones' && <section className={styles.panel}><h2>Delivery milestones</h2>{(project.milestones ?? []).length === 0 && tasks.length === 0 ? <EmptyState text="Milestones appear with the delivery plan" hint="Your team will turn the project brief into scheduled tasks." /> : (project.milestones ?? []).length > 0 ? (project.milestones ?? []).map((milestone) => <div className={styles.listItem} key={milestone.id}><CheckCircle2 size={18} color={milestone.completed ? 'var(--green-600)' : 'var(--text-muted)'} /><strong>{milestone.title}</strong><span className={styles.muted}>{formatDate(milestone.date)}</span><StatusBadge status={milestone.completed ? 'approved' : 'todo'} size="sm" /></div>) : tasks.map((task) => <div className={styles.listItem} key={task.id}><CheckCircle2 size={18} color={task.status === 'approved' ? 'var(--green-600)' : 'var(--text-muted)'} /><strong>{task.title}</strong><span className={styles.muted}>{formatDate(task.deadline)}</span><StatusBadge status={task.status} size="sm" /></div>)}</section>}
      {tab === 'timeline' && (tasks.length ? <Timeline tasks={tasks} names={names} onTaskClick={(task) => navigate(`/manager/tasks/${task.id}`)} /> : <EmptyState text="No scheduled work yet" hint="Add the first task to build this project’s timeline." />)}
      {tab === 'team' && <section className={styles.panel}><h2>Project team</h2>{members.length ? members.map((member) => <div className={styles.listItem} key={member.uid}><Avatar name={member.name} size="md" /><div><strong>{member.name}</strong><p>{member.jobTitle || member.role}</p></div><span className={styles.muted}>{tasks.filter((task) => task.assigneeId === member.uid || task.reviewerId === member.uid).length} assignments</span></div>) : <EmptyState text="The team hasn’t been assigned yet" hint="Team members appear when tasks are assigned." />}</section>}
      {tab === 'documents' && <section className={styles.panel}><h2>Project files</h2>{documents.length ? documents.map((file) => <a className={styles.fileLink} key={file.id} href={file.url} target="_blank" rel="noreferrer"><FileText size={18} /><div><strong>{file.name}</strong><span>{file.kind}</span></div><ArrowUpRight size={16} /></a>) : <EmptyState text="No files to show yet" hint="Requirement attachments, project documents, and approved deliverables will appear here." />}{role === 'client' && <Link className={styles.textAction} to="/client/documents">Manage project files<ArrowUpRight size={14} /></Link>}</section>}
      {tab === 'feedback' && <section className={styles.panel}><h2>Client feedback</h2>{feedback.length ? feedback.map((item) => <div className={styles.feedback} key={item.id}><div><strong>{item.taskTitle}</strong><span>{formatDate(item.createdAt)}</span></div><p>{item.comment}</p>{item.response && <p className={styles.response}>{item.response}</p>}{role === 'manager' ? <label className={styles.feedbackStatus}>Status<select aria-label={`Status for ${item.taskTitle}`} value={item.status} disabled={savingFeedback === item.id} onChange={(event) => { void respond(item.id, event.target.value); }}>{['Pending', 'In Progress', 'Resolved'].map((status) => <option key={status}>{status}</option>)}</select></label> : <span className={styles.muted}>{item.status}</span>}</div>) : <EmptyState text="No feedback yet" hint="Keep decisions and follow-ups connected to the project." />}{role === 'client' && <Link className={styles.textAction} to="/client/feedback">Share feedback<ArrowUpRight size={14} /></Link>}</section>}
      {tab === 'activity' && <section className={styles.panel}><h2>Project history</h2>{activities.length ? activities.map((activity) => <div className={styles.listItem} key={activity.id}><Avatar name={activity.actorName} size="sm" /><div><strong>{activity.actorName}</strong><p>{activity.description || activity.action}</p></div><time className={styles.muted} dateTime={activity.createdAt}>{activity.timeAgo}</time></div>) : <EmptyState text="No activity recorded yet" hint="Project updates will be collected here as work moves forward." />}</section>}
    </div>
    {createTask && <CreateTaskModal defaultProjectId={id} onClose={() => setCreateTask(false)} />}
  </PageContainer></AppLayout>;
}
