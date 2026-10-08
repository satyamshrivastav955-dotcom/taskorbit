import React, { useEffect, useState } from 'react';
import { MessageSquare, Paperclip, Send, Plus, Loader2 } from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { Avatar } from '../../components/ui/Avatar';
import { dataStore } from '../../services/dataService';
import { useToast } from '../../components/ui/Toast';

type FilterTab = 'all' | 'pending' | 'resolved';

export function ClientFeedback(): JSX.Element {
  const { toast } = useToast();
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [, setTick] = useState(0);

  // Subscribe so component updates when Firestore data arrives
  useEffect(() => dataStore.subscribe(() => setTick((t) => t + 1)), []);

  const me = dataStore.getActiveUser();
  const tasks = dataStore.getTasks();
  const feedbacks = dataStore.getFeedbacks();
  const loading = dataStore.isLoading();

  // Find all unique tasks associated with this client's projects
  const myProjects = dataStore.getProjects();
  const myProjectIds = new Set(myProjects.map((p) => p.id));
  const relevantTasks = tasks.filter((t) => myProjectIds.has(t.projectId));

  const filtered = feedbacks.filter((f) => {
    if (filterTab === 'pending') return f.status === 'Pending' || f.status === 'In Progress';
    if (filterTab === 'resolved') return f.status === 'Resolved';
    return true;
  });

  const counts = {
    all: feedbacks.length,
    pending: feedbacks.filter((f) => f.status !== 'Resolved').length,
    resolved: feedbacks.filter((f) => f.status === 'Resolved').length,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    const task = tasks.find((t) => t.id === selectedTaskId);
    const project = task ? myProjects.find((p) => p.id === task.projectId) : myProjects[0];
    const taskTitle = task ? task.title : 'Project Feedback';
    const projectTitle = project?.title ?? 'General';
    setSubmitting(true);
    try {
      await dataStore.createFeedback({
        projectId: project?.id,
        taskTitle,
        projectTitle,
        comment: feedbackText.trim(),
      });
      setFeedbackText('');
      toast('Feedback submitted successfully!', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not submit feedback.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout role="client">
      <PageContainer>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Feedback</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Review and provide feedback on project deliverables.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {([['all', `All (${counts.all})`], ['pending', `Pending (${counts.pending})`], ['resolved', `Resolved (${counts.resolved})`]] as Array<[FilterTab, string]>).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setFilterTab(t)}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                background: filterTab === t ? 'var(--primary)' : '#FFF',
                color: filterTab === t ? '#FFF' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                fontWeight: filterTab === t ? 600 : 500,
                fontSize: '13px',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Two-Column Layout */}
        <div className="responsive-grid" style={{ gridTemplateColumns: '1.8fr 1.2fr', gap: '24px' }}>
          {/* Left: Feedback Threads */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loading && feedbacks.length === 0 ? (
              <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', textAlign: 'center', padding: '60px 20px' }}>
                <Loader2 size={32} color="var(--primary)" style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Loading feedback…
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', textAlign: 'center', padding: '60px 20px' }}>
                <MessageSquare size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {feedbacks.length === 0 ? 'No feedback yet' : 'No feedback in this category'}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto' }}>
                  {feedbacks.length === 0
                    ? 'Use the form on the right to submit your first feedback.'
                    : 'Try switching to "All" to see all feedback.'}
                </p>
              </div>
            ) : (
              filtered.map((fb) => (
                <div
                  key={fb.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {fb.taskTitle}
                      </span>
                      {fb.projectTitle !== '' && (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                          ({fb.projectTitle})
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        background: fb.status === 'Resolved' ? '#DCFCE7' : fb.status === 'In Progress' ? '#EEF2FF' : '#FEF3C7',
                        color: fb.status === 'Resolved' ? '#16A34A' : fb.status === 'In Progress' ? '#4F46E5' : '#D97706',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      {fb.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '4px 0' }}>
                    {fb.comment}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-light)', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Avatar name={me.name !== '' ? me.name : me.email} size="sm" />
                      <span>{me.name !== '' ? me.name : me.email} • {fb.createdAt ? fb.createdAt.slice(0, 10) : '—'}</span>
                    </div>
                    {fb.repliesCount > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 600 }}>
                        <MessageSquare size={14} />
                        <span>{fb.repliesCount} replies</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right: Add Feedback Form */}
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Add Feedback</h3>

            <form onSubmit={(e) => { void handleSubmit(e); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>Select Context</label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: '#F8FAFC', marginTop: '4px', fontSize: '13px', outline: 'none' }}
                >
                  <option value="">General Project Feedback</option>
                  {relevantTasks.map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>Your Feedback *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Write your feedback..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '10px',
                  background: submitting ? '#94A3B8' : 'var(--primary-gradient)',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  boxShadow: '0 2px 6px rgba(79, 70, 229, 0.2)',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                <Send size={15} />
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
