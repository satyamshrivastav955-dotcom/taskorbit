import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, ArrowUpRight } from 'lucide-react';
import { AppLayout, PageContainer, PageHeader } from '../../components/layout/AppLayout';
import { Button } from '../../components/ui/Button';
import { EmptyState, Skeleton } from '../../components/ui/State';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/Toast';
import { dataStore } from '../../services/dataService';
import { apiGet } from '../../services/api';
import { formatDate } from '../../utils/dates';
import styles from '../../components/project/ProjectWorkspace.module.css';

export function Reports(): JSX.Element {
  const [, render] = useState(0);
  const [projectId, setProjectId] = useState('all');
  const [assigneeId, setAssigneeId] = useState('all');
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();
  useEffect(() => dataStore.subscribe(() => render((value) => value + 1)), []);
  const projects = dataStore.getProjects().filter((project) => projectId === 'all' || project.id === projectId);
  const users = dataStore.getUsers().filter((user) => user.role === 'assignee');
  const tasks = dataStore.getTasks().filter((task) => (projectId === 'all' || task.projectId === projectId) && (assigneeId === 'all' || task.assigneeId === assigneeId));
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const approved = tasks.filter((task) => task.status === 'approved').length;
  const overdue = tasks.filter((task) => task.status !== 'approved' && task.deadline < todayKey).length;
  const errors = dataStore.getError();
  const exportingPath = projectId === 'all' ? '/export/all' : `/export/report/${projectId}`;
  const exportReport = async (): Promise<void> => {
    setExporting(true);
    try {
      const report = await apiGet(exportingPath);
      const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = `taskorbit-${todayKey}.json`; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('Your project report is ready.', 'success');
    } catch (cause) { toast(cause instanceof Error ? cause.message : 'Could not export this report.', 'error'); }
    finally { setExporting(false); }
  };
  const external = [
    { label: 'Reporting portal', url: import.meta.env.VITE_JSP_REPORT_URL as string | undefined },
    { label: 'Report notes', url: import.meta.env.VITE_LARAVEL_NOTES_URL as string | undefined },
  ].filter((service) => service.url && /^https?:\/\//.test(service.url));

  return <AppLayout role="manager"><PageContainer>
    <PageHeader title="Delivery reports" description="A clear record of delivery, review outcomes, and outstanding work. Every number comes from your workspace." action={<Button variant="secondary" pending={exporting} onClick={() => { void exportReport(); }}><Download size={15} />{projectId === 'all' ? 'Export workspace' : 'Export project'}</Button>} />
    <div className={styles.summary} style={{ flexWrap: 'wrap' }}>
      <label className={styles.feedbackStatus}>Project<select aria-label="Report project" value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="all">All projects</option>{dataStore.getProjects().map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select></label>
      <label className={styles.feedbackStatus}>Assignee<select aria-label="Report assignee" value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}><option value="all">All assignees</option>{users.map((user) => <option key={user.uid} value={user.uid}>{user.name}</option>)}</select></label>
      <span style={{ marginLeft: 'auto', fontSize: '12px' }}>Snapshot · {formatDate(today)}</span>
    </div>
    {errors && <div role="alert" className={styles.panel}><p>{errors}</p><Button variant="secondary" onClick={() => { void dataStore.refresh(); }}>Try again</Button></div>}
    <section className={styles.panel}><div className={styles.facts} style={{ margin: 0, padding: 0, border: 0, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>{[{ label: 'Tasks in view', value: tasks.length }, { label: 'Approved', value: approved }, { label: 'Overdue', value: overdue }].map((metric) => <div key={metric.label}><span>{metric.label}</span><strong style={{ fontSize: '25px', fontWeight: 600 }}>{dataStore.isLoading() ? '—' : metric.value}</strong></div>)}</div></section>
    <section className={styles.panel}><h2>Project delivery</h2>{dataStore.isLoading() ? <Skeleton rows={4} /> : projects.length === 0 ? <EmptyState text="No project reports yet" hint="Your delivery history appears here as work is assigned and reviewed." /> : <div className={styles.tableScroll}><table><thead><tr><th>Project</th><th>Due</th><th>Approved / total</th><th>Open reviews</th><th>Revisions</th><th>Status</th></tr></thead><tbody>{projects.map((project) => { const scoped = tasks.filter((task) => task.projectId === project.id); return <tr key={project.id}><td><Link to={`/manager/projects/${project.id}`}>{project.title}</Link></td><td>{formatDate(project.deadline)}</td><td>{scoped.filter((task) => task.status === 'approved').length} / {scoped.length}</td><td>{scoped.filter((task) => ['submitted', 'in_review'].includes(task.status)).length}</td><td>{scoped.reduce((total, task) => total + task.revisionCount, 0)}</td><td><StatusBadge status={project.status} size="sm" /></td></tr>; })}</tbody></table></div>}</section>
    <section className={styles.panel}><h2>Assignment summary</h2>{users.length === 0 ? <EmptyState text="No assignees yet" hint="Add team members to start assigning delivery work." /> : <div className={styles.tableScroll}><table><thead><tr><th>Assignee</th><th>Active tasks</th><th>Approved</th><th>Overdue</th></tr></thead><tbody>{users.filter((user) => assigneeId === 'all' || user.uid === assigneeId).map((user) => { const assigned = tasks.filter((task) => task.assigneeId === user.uid); return <tr key={user.uid}><td>{user.name}</td><td>{assigned.filter((task) => task.status !== 'approved').length}</td><td>{assigned.filter((task) => task.status === 'approved').length}</td><td>{assigned.filter((task) => task.status !== 'approved' && task.deadline < todayKey).length}</td></tr>; })}</tbody></table></div>}</section>
    {external.length > 0 && <section className={styles.panel}><h2>Connected reporting services</h2><p className={styles.description}>These reporting services use their own authenticated sessions and the synchronized reporting database.</p>{external.map((service) => <a key={service.label} className={styles.textAction} style={{ marginRight: '24px' }} href={service.url} target="_blank" rel="noreferrer">{service.label}<ArrowUpRight size={14} /></a>)}</section>}
  </PageContainer></AppLayout>;
}
