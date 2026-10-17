import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Edit2,
  MoreVertical,
  Paperclip,
  Plus,
  Send,
  Calendar,
  Clock,
  User,
  Tag,
  CheckSquare,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Avatar } from '../../components/ui/Avatar';
import { dataStore } from '../../services/demoData';
import { useToast } from '../../components/ui/Toast';
import { EditTaskModal } from '../../components/modals/EditTaskModal';

export function ManagerTaskDetail(): JSX.Element {
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'subtasks' | 'files' | 'comments' | 'activity'>('overview');
  const [commentText, setCommentText] = useState('');
  const [editingTask, setEditingTask] = useState(false);

  useEffect(() => {
    return dataStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const task = dataStore.getTaskById(id || '');
  if (!task) {
    const loading = dataStore.isLoading();
    const error = dataStore.getError();
    return <AppLayout role="manager"><PageContainer><div style={{ textAlign: 'center', padding: '72px 20px' }} role={loading || error === '' ? 'status' : 'alert'}><h1>{loading ? 'Loading task…' : 'Task not found'}</h1><p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>{error !== '' ? error : loading ? 'Fetching the latest task details.' : 'The task may have been removed or is not available in this workspace.'}</p><button onClick={() => navigate('/manager/tasks')} style={{ marginTop: '16px', color: 'var(--primary)', fontWeight: 600 }}>Back to tasks</button></div></PageContainer></AppLayout>;
  }
  const users = dataStore.getUsers();
  const assignee = users.find((u) => u.uid === task.assigneeId);
  const reviewer = users.find((u) => u.uid === task.reviewerId);
  const submissions = dataStore.getSubmissions(task.id);
  const submissionFiles = submissions.flatMap((submission) => submission.files ?? [{ id: submission.id, name: submission.fileName, size: '', type: 'file', url: submission.fileUrl, uploadedAt: submission.submittedAt }]);
  const activities = dataStore.getActivities().filter((a) => a.targetId === task.id || a.projectId === task.projectId);
  const linkedRequirements = dataStore.getRequirements(task.projectId).filter((requirement) => (task.requirementIds ?? []).includes(requirement.id));

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
    <AppLayout role="manager">
      <PageContainer>
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <button
              onClick={() => navigate('/manager/tasks')}
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

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {!['submitted', 'in_review', 'approved'].includes(task.status) && <button type="button" onClick={() => setEditingTask(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', color: '#fff', background: 'var(--primary)', borderRadius: '8px', fontSize: '13px' }}><Edit2 size={14} /> Edit task</button>}
             <button onClick={() => navigate('/manager/tasks')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
               <ArrowLeft size={15} />
               <span>Back to tasks</span>
             </button>
          </div>
        </div>

        {/* Task Header Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                flexShrink: 0,
                borderRadius: '12px',
                background: 'var(--pale-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckSquare size={24} color="var(--primary)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700 }}>{task.title}</h1>
                <StatusBadge status={task.status} size="md" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                <span>{task.projectName}</span>
                <span>•</span>
                <span>{task.taskIdCode || 'Task'}</span>
                <span>•</span>
                <span>Created {task.startDate}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <PriorityBadge priority={task.priority} size="md" />
            {(task.labels || []).map((l, i) => (
              <span
                key={i}
                style={{
                  background: '#F1F5F9',
                  color: '#475569',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Two-Column Task Layout matching Reference Image 8 & 14 */}
        <div className="responsive-grid" style={{ gridTemplateColumns: '1.8fr 1fr', gap: '24px' }}>
          {/* Left Column: Details, Subtasks, Attachments */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Description */}
            <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>Description</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {task.description}
              </p>

              <h4 style={{ fontSize: '14px', fontWeight: 700, marginTop: '18px', marginBottom: '8px' }}>Requirements</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(task.requirementsList ?? linkedRequirements.map((requirement) => requirement.title)).map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>

            {/* Attachments Grid */}
            <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
                  Attachments ({submissionFiles.length})
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Files are added with submissions</span>
              </div>

              <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    {submissionFiles.map((att, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: '#F8FAFC',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <Paperclip size={18} color="var(--primary)" />
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                      {att.name}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{att.size}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtasks Section */}
            <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
                  Subtasks ({task.subtasks?.length || 0})
                </h3>
                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                    {(task.subtasks || []).map((st) => (
                  <div
                    key={st.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#F8FAFC',
                      border: '1px solid var(--border-light)',
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubtask(st.id)}
                      />
                      <span
                        style={{
                          fontSize: '13.5px',
                          textDecoration: st.completed ? 'line-through' : 'none',
                          color: st.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                        }}
                      >
                        {st.title}
                      </span>
                    </label>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{st.dueDate}</span>
                    <StatusBadge status={st.completed ? 'completed' : 'in_progress'} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Task Information, Progress, Comments */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Task Information Box */}
            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Task Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Status</span>
                  <StatusBadge status={task.status} size="sm" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Assignee</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Avatar name={assignee?.name} src={assignee?.avatar} size="sm" />
                    <span style={{ fontWeight: 600 }}>{assignee?.name}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Reviewer</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Avatar name={reviewer?.name} src={reviewer?.avatar} size="sm" />
                    <span style={{ fontWeight: 600 }}>{reviewer?.name}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Start Date</span>
                  <span style={{ fontWeight: 600 }}>{task.startDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Deadline</span>
                  <span style={{ fontWeight: 600, color: '#DC2626' }}>{task.deadline}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated Hours</span>
                  <span style={{ fontWeight: 600 }}>{task.estimatedHours === undefined ? '—' : `${task.estimatedHours} hrs`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Actual Hours</span>
                  <span style={{ fontWeight: 600 }}>{task.actualHours === undefined ? '—' : `${task.actualHours} hrs`}</span>
                </div>
              </div>
            </div>

            {/* Comments Thread with Add Comment */}
            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>
                Comments ({task.comments?.length || 0})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
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
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '13px',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: 'var(--primary)',
                    color: '#FFF',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          </div>
        </div>
        {editingTask && <EditTaskModal task={task} onClose={() => setEditingTask(false)} />}
      </PageContainer>
    </AppLayout>
  );
}
