import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  UploadCloud,
  Paperclip,
  Plus,
  Send,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Avatar } from '../../components/ui/Avatar';
import { SubmitWorkModal } from '../../components/modals/SubmitWorkModal';
import { dataStore } from '../../services/demoData';
import { useToast } from '../../components/ui/Toast';

export function AssigneeTaskDetail(): JSX.Element {
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    return dataStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const task = dataStore.getTaskById(id || '');
  if (!task) {
    const loading = dataStore.isLoading();
    const error = dataStore.getError();
    return <AppLayout role="assignee"><PageContainer><div style={{ textAlign: 'center', padding: '72px 20px' }} role={loading || error === '' ? 'status' : 'alert'}><h1>{loading ? 'Loading task…' : 'Task not found'}</h1><p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>{error !== '' ? error : loading ? 'Fetching the latest task details.' : 'The task may have been removed or is not available in this workspace.'}</p><button onClick={() => navigate('/assignee/tasks')} style={{ marginTop: '16px', color: 'var(--primary)', fontWeight: 600 }}>Back to tasks</button></div></PageContainer></AppLayout>;
  }
  const users = dataStore.getUsers();
  const reviewer = users.find((u) => u.uid === task.reviewerId);

  const handleStartTask = () => {
    void dataStore.updateTask(task.id, { status: 'in_progress' })
      .catch((e: unknown) => toast(e instanceof Error ? e.message : 'Could not start task.', 'error'));
  };

  const handleToggleSubtask = (stId: string) => {
    void dataStore.toggleSubtask(task.id, stId).catch((error: unknown) => toast(error instanceof Error ? error.message : 'Checklist update failed.', 'error'));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    void dataStore.addComment(task.id, commentText).catch((error: unknown) => toast(error instanceof Error ? error.message : 'Comment failed.', 'error'));
    setCommentText('');
  };

  return (
    <AppLayout role="assignee">
      <PageContainer>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <button
              onClick={() => navigate('/assignee/tasks')}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft size={14} />
              <span>Back to Tasks</span>
            </button>
            <span>/</span>
            <span>{task.projectName}</span>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{task.title}</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {task.status === 'todo' && (
              <button
                onClick={handleStartTask}
                style={{
                  padding: '8px 16px',
                  background: '#EEF2FF',
                  color: 'var(--primary)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: '1px solid #C7D2FE',
                }}
              >
                Start Task
              </button>
            )}
            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={task.status !== 'in_progress'}
              title={task.status === 'todo' ? 'Start the task before submitting work' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                background: 'var(--primary-gradient)',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 600,
                 boxShadow: task.status === 'in_progress' ? '0 2px 8px rgba(79, 70, 229, 0.25)' : 'none',
                 opacity: task.status === 'in_progress' ? 1 : 0.55,
                 cursor: task.status === 'in_progress' ? 'pointer' : 'not-allowed',
              }}
            >
              <UploadCloud size={16} />
              <span>Submit for Review</span>
            </button>
          </div>
        </div>

        {/* Hero Card matching Reference Image 2 screen 3 */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700 }}>{task.title}</h1>
              <StatusBadge status={task.status} size="md" />
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {task.projectName} • {task.taskIdCode || '—'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <PriorityBadge priority={task.priority} size="md" />
          </div>
        </div>

        {/* Two-Column Execution Grid */}
        <div className="responsive-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          {/* Left Column: Description, Subtasks, Deliverables */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>Description</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {task.description}
              </p>

              <h4 style={{ fontSize: '14px', fontWeight: 700, marginTop: '18px', marginBottom: '8px' }}>Requirements</h4>
              {(task.requirementsList ?? []).length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(task.requirementsList ?? []).map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>No requirements were added for this task.</p>
              )}
            </div>

            {/* Checklists / Subtasks */}
            <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Checklist & Subtasks</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {(task.subtasks || []).filter((s) => s.completed).length} of {(task.subtasks || []).length} completed
                </span>
              </div>
              <ProgressBar
                value={
                  (task.subtasks || []).length > 0
                    ? Math.round(
                        ((task.subtasks || []).filter((s) => s.completed).length / (task.subtasks || []).length) * 100
                      )
                    : 0
                }
                height={6}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                {(task.subtasks || []).map((st) => (
                  <label
                    key={st.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#F8FAFC',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => handleToggleSubtask(st.id)}
                    />
                    <span style={{ fontSize: '13.5px', textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? 'var(--text-muted)' : 'var(--text-primary)', flex: 1 }}>
                      {st.title}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{st.dueDate}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Comments Thread */}
            <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>
                Comments & Instructions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {(task.comments || []).map((c) => (
                  <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                    <Avatar name={c.userName} src={c.userAvatar} size="sm" />
                    <div style={{ flex: 1, background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 600 }}>{c.userName}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.createdAt}</span>
                      </div>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Ask a question or leave notes..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                />
                <button type="submit" style={{ background: 'var(--primary)', color: '#FFF', padding: '8px 14px', borderRadius: '8px' }}>
                  <Send size={15} />
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Task Information matching Reference Image 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Task Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Priority</span>
                  <PriorityBadge priority={task.priority} size="sm" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Due Date</span>
                  <span style={{ fontWeight: 600, color: '#DC2626' }}>{task.deadline}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated Hours</span>
                  <span style={{ fontWeight: 600 }}>8 hrs</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Actual Hours</span>
                  <span style={{ fontWeight: 600 }}>5 hrs</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Assignee</span>
                      <span style={{ fontWeight: 600 }}>{dataStore.getActiveUser().name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Project</span>
                  <span style={{ fontWeight: 600 }}>{task.projectName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Reviewer</span>
                  <span style={{ fontWeight: 600 }}>{reviewer?.name || '—'}</span>
                </div>
              </div>

              <button
                onClick={() => setShowSubmitModal(true)}
                style={{
                  width: '100%',
                  marginTop: '20px',
                  padding: '10px',
                  background: 'var(--primary-gradient)',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                }}
              >
                Submit Work for Review →
              </button>
            </div>
          </div>
        </div>

        {/* Submit Work Modal */}
        {showSubmitModal && (
          <SubmitWorkModal
            taskId={task.id}
            taskTitle={task.title}
            onClose={() => setShowSubmitModal(false)}
            onSubmitted={() => {
              toast('Work submitted successfully. The reviewer has been notified.', 'success');
            }}
          />
        )}
      </PageContainer>
    </AppLayout>
  );
}
