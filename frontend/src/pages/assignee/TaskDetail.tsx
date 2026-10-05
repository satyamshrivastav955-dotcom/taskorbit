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

export function AssigneeTaskDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    return dataStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const task = dataStore.getTaskById(id || 'task-1') || dataStore.getTasks()[0];
  const users = dataStore.getUsers();
  const reviewer = users.find((u) => u.uid === task.reviewerId);

  const handleStartTask = () => {
    dataStore.updateTask(task.id, { status: 'in_progress' });
  };

  const handleToggleSubtask = (stId: string) => {
    dataStore.toggleSubtask(task.id, stId);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    dataStore.addComment(task.id, commentText);
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
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
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
              {task.projectName} • {task.taskIdCode || 'TASK-101'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <PriorityBadge priority={task.priority} size="md" />
          </div>
        </div>

        {/* Two-Column Execution Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          {/* Left Column: Description, Subtasks, Deliverables */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>Description</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {task.description}
              </p>

              <h4 style={{ fontSize: '14px', fontWeight: 700, marginTop: '18px', marginBottom: '8px' }}>Requirements</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(task.requirementsList || [
                  'Use approved brand guidelines',
                  'Design for desktop and mobile',
                  'Include hero section, features, and testimonials',
                  'Follow accessibility best practices',
                ]).map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
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
                    : 50
                }
                height={6}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                {(task.subtasks || [
                  { id: 'st-1', title: 'Design hero section', completed: true, dueDate: 'Mar 12, 2025' },
                  { id: 'st-2', title: 'Create feature cards', completed: true, dueDate: 'Mar 14, 2025' },
                  { id: 'st-3', title: 'Design testimonials section', completed: false, dueDate: 'Mar 16, 2025' },
                  { id: 'st-4', title: 'Mobile responsive design', completed: false, dueDate: 'Mar 18, 2025' },
                ]).map((st) => (
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
                  <span style={{ fontWeight: 600 }}>Priya Mehta</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Project</span>
                  <span style={{ fontWeight: 600 }}>{task.projectName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Reviewer</span>
                  <span style={{ fontWeight: 600 }}>{reviewer?.name || 'Neha Verma'}</span>
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
              alert('Work submitted successfully! Task moved to SUBMITTED and reviewer notified.');
            }}
          />
        )}
      </PageContainer>
    </AppLayout>
  );
}
