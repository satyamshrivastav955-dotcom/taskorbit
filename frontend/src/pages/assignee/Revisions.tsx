import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, ArrowRight, MessageSquare, Inbox } from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { Avatar } from '../../components/ui/Avatar';
import { SubmitWorkModal } from '../../components/modals/SubmitWorkModal';
import { dataStore } from '../../services/dataService';
import { useToast } from '../../components/ui/Toast';

export function AssigneeRevisions(): JSX.Element {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState('');
  const [, setTick] = useState(0);
  useEffect(() => dataStore.subscribe(() => setTick((t) => t + 1)), []);

  const me = dataStore.getActiveUser();
  const tasks = dataStore.getTasks({ assigneeId: me.uid });
  const users = dataStore.getUsers();
  const projects = dataStore.getProjects();
  const revisions = tasks.filter((task) => task.status === 'revision' || task.revisionCount > 0).map((task) => {
    const reviews = dataStore.getReviews(task.id).filter((review) => review.decision === 'rejected').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const review = reviews[0];
    const reviewer = users.find((user) => user.uid === task.reviewerId);
    return { task, review, reviewer, project: projects.find((project) => project.id === task.projectId) };
  });
  const filtered = revisions.filter(({ task }) => {
    if (filterTab === 'open') return task.status === 'revision';
    if (filterTab === 'in_progress') return task.status === 'in_progress' && task.revisionCount > 0;
    if (filterTab === 'resolved') return task.status === 'approved' && task.revisionCount > 0;
    return true;
  });

  async function resolve(taskId: string): Promise<void> {
    const task = dataStore.getTaskById(taskId);
    if (!task) return;
    try {
      if (task.status === 'revision') await dataStore.updateTask(task.id, { status: 'in_progress' });
      setActiveTaskId(task.id);
      setShowResubmitModal(true);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not start the revision.', 'error');
    }
  }

  return <AppLayout role="assignee"><PageContainer>
    <div style={{ marginBottom: '8px' }}><h1 style={{ fontSize: '26px', fontWeight: 700 }}>Revision Requests</h1><p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>Address reviewer feedback, then resubmit a new deliverable version.</p></div>
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{(['all', 'open', 'in_progress', 'resolved'] as const).map((tab) => <button key={tab} onClick={() => setFilterTab(tab)} style={{ padding: '6px 14px', borderRadius: '9999px', background: filterTab === tab ? 'var(--primary)' : '#FFF', color: filterTab === tab ? '#FFF' : 'var(--text-secondary)', border: '1px solid var(--border)', fontWeight: filterTab === tab ? 600 : 500, fontSize: '13px' }}>{tab === 'all' ? `All (${revisions.length})` : tab === 'open' ? `Open (${revisions.filter(({ task }) => task.status === 'revision').length})` : tab === 'in_progress' ? `In progress (${revisions.filter(({ task }) => task.status === 'in_progress').length})` : `Resolved (${revisions.filter(({ task }) => task.status === 'approved').length})`}</button>)}</div>
    {filtered.length === 0 ? <div style={{ background: '#FFF', border: '1px solid var(--border)', borderRadius: '14px', textAlign: 'center', padding: '64px 20px' }}><Inbox size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} /><p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-secondary)' }}>No revision requests</p><p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '5px' }}>Rejected submissions and reviewer feedback will appear here.</p></div> : <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>{filtered.map(({ task, review, reviewer, project }) => <div key={task.id} style={{ background: '#FFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RotateCcw size={18} color="#EF4444" /></div><div><div style={{ fontSize: '14.5px', fontWeight: 700 }}>{task.title}</div><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{project?.title ?? task.projectName} · Version {task.revisionCount + 1}</div></div></div><div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}><Avatar name={reviewer?.name ?? 'Reviewer'} size="sm" /><span>{reviewer?.name ?? 'Reviewer'}</span></div></div><div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}><MessageSquare size={15} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} /><span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{review?.comments || 'Reviewer feedback is available in the task history.'}</span></div><div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}><button onClick={() => navigate(`/assignee/tasks/${task.id}`)} style={{ padding: '8px 14px', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px' }}>Open task</button><button onClick={() => { void resolve(task.id); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--primary)', color: '#FFF', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>{task.status === 'revision' ? 'Start & resubmit' : 'Submit new version'} <ArrowRight size={14} /></button></div></div>)}</div>}
    {showResubmitModal && activeTaskId !== '' && <SubmitWorkModal taskId={activeTaskId} taskTitle={dataStore.getTaskById(activeTaskId)?.title ?? 'Task'} onClose={() => setShowResubmitModal(false)} onSubmitted={() => toast('Updated deliverables submitted for review.', 'success')} />}
  </PageContainer></AppLayout>;
}
