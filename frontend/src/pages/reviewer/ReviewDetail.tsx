import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, FileText, ExternalLink, AlertCircle, Clock } from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { Avatar } from '../../components/ui/Avatar';
import { ReviewDecisionModal } from '../../components/modals/ReviewDecisionModal';
import { dataStore } from '../../services/dataService';
import { useToast } from '../../components/ui/Toast';

export function ReviewDetail(): JSX.Element {
  const { toast } = useToast();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [initialDecision, setInitialDecision] = useState<'approved' | 'rejected'>('approved');

  useEffect(() => dataStore.subscribe(() => setTick((t) => t + 1)), []);

  const task = dataStore.getTaskById(id);
  const project = task ? dataStore.getProjectById(task.projectId) : undefined;
  const assignee = task ? dataStore.getUserById(task.assigneeId) : undefined;
  const submissions = task ? dataStore.getSubmissions(task.id).sort((a, b) => b.version - a.version) : [];
  const latest = submissions[0];

  useEffect(() => {
    if (task?.status === 'submitted') {
      void dataStore.updateTask(task.id, { status: 'in_review' }).catch((error: unknown) => {
        toast(error instanceof Error ? error.message : 'Could not open this review.', 'error');
      });
    }
  }, [task?.id, task?.status, toast]);

  if (!task) {
    const loading = dataStore.isLoading();
    const error = dataStore.getError();
    return <AppLayout role="reviewer"><PageContainer><div style={{ textAlign: 'center', padding: '80px 20px' }} role={loading || error === '' ? 'status' : 'alert'}><h1>{loading ? 'Loading review…' : 'Review not found'}</h1><p style={{ color: 'var(--text-secondary)' }}>{error !== '' ? error : loading ? 'Fetching the latest review queue.' : 'This task is no longer available in your review workspace.'}</p><button onClick={() => navigate('/reviewer/queue')} style={{ marginTop: '16px', color: 'var(--primary)', fontWeight: 600 }}>Back to queue</button></div></PageContainer></AppLayout>;
  }
  const currentTask = task;

  async function submitDecision(decision: 'approved' | 'rejected', comments: string): Promise<void> {
    await dataStore.reviewTask(currentTask.id, decision, comments, latest?.id);
    setDecisionModalOpen(false);
    toast(decision === 'approved' ? 'Work approved. The assignee has been notified.' : 'Revision requested. Your feedback is with the assignee.', 'success');
    navigate('/reviewer/queue');
  }

  return (
    <AppLayout role="reviewer">
      <PageContainer>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <button onClick={() => navigate('/reviewer/queue')} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '12px' }}><ArrowLeft size={15} /> Back to queue</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}><h1 style={{ fontSize: '26px', fontWeight: 700 }}>{task.title}</h1><StatusBadge status={task.status} /><PriorityBadge priority={task.priority} /></div>
            <p style={{ marginTop: '5px', fontSize: '13px', color: 'var(--text-secondary)' }}>{project?.title ?? task.projectName} · Version {latest?.version ?? '—'} · Due {task.deadline}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { setInitialDecision('rejected'); setDecisionModalOpen(true); }} disabled={task.status !== 'in_review' || !latest} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', border: '1px solid #FECACA', color: '#B91C1C', background: '#FFF', borderRadius: '8px', fontWeight: 600, fontSize: '13px' }}><AlertCircle size={15} /> Request revision</button>
            <button onClick={() => { setInitialDecision('approved'); setDecisionModalOpen(true); }} disabled={task.status !== 'in_review' || !latest} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', border: 0, color: '#FFF', background: '#16A34A', borderRadius: '8px', fontWeight: 600, fontSize: '13px' }}><CheckCircle2 size={15} /> Approve</button>
          </div>
        </div>

        <div className="responsive-grid" style={{ gridTemplateColumns: 'minmax(0, 1.7fr) minmax(280px, 1fr)', gap: '20px', alignItems: 'start' }}>
          <section style={{ background: '#FFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}><div><h2 style={{ fontSize: '16px', fontWeight: 700 }}>Submitted deliverables</h2><p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>Open the files below to review the exact version submitted by the assignee.</p></div><span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' }}><Clock size={14} /> {latest?.submittedAt.slice(0, 16).replace('T', ' ') ?? 'Not submitted'}</span></div>
            {!latest ? <div style={{ padding: '42px 20px', textAlign: 'center', background: '#F8FAFC', borderRadius: '10px', color: 'var(--text-secondary)' }}>No submission found for this task.</div> : <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(latest.files && latest.files.length > 0 ? latest.files : [{ id: latest.id, name: latest.fileName, url: latest.fileUrl, size: '', type: 'file', uploadedAt: latest.submittedAt }]).map((file) => <a key={file.id} href={file.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 14px', border: '1px solid var(--border)', borderRadius: '9px', color: 'var(--text-primary)', textDecoration: 'none' }}><FileText size={19} color="var(--primary)" /><span style={{ flex: 1, fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span><span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>Open <ExternalLink size={13} /></span></a>)}
              </div>
              <div style={{ marginTop: '18px', padding: '14px', background: '#F8FAFC', borderRadius: '9px' }}><h3 style={{ fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>Assignee note</h3><p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.55 }}>{latest.note || 'No note was provided with this submission.'}</p></div>
            </>}
          </section>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <section style={{ background: '#FFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}><h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Task context</h2><div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}><div><span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11.5px', marginBottom: '4px' }}>Assignee</span><div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}><Avatar name={assignee?.name} size="sm" />{assignee?.name ?? '—'}</div></div><div><span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11.5px', marginBottom: '4px' }}>Description</span><span style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{task.description || 'No description provided.'}</span></div><div><span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11.5px', marginBottom: '4px' }}>Previous revisions</span><strong>{task.revisionCount}</strong></div></div></section>
            <section style={{ background: '#FFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}><h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Submission history</h2>{submissions.map((submission) => <div key={submission.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', padding: '9px 0', borderBottom: '1px solid var(--border-light)', fontSize: '12.5px' }}><span>Version {submission.version}</span><span style={{ color: submission.id === latest?.id ? 'var(--primary)' : 'var(--text-muted)', fontWeight: submission.id === latest?.id ? 600 : 500 }}>{submission.id === latest?.id ? 'Current' : submission.submittedAt.slice(0, 10)}</span></div>)}</section>
          </aside>
        </div>

        {decisionModalOpen && <ReviewDecisionModal taskTitle={task.title} initialDecision={initialDecision} onClose={() => setDecisionModalOpen(false)} onSubmit={submitDecision} />}
      </PageContainer>
    </AppLayout>
  );
}
