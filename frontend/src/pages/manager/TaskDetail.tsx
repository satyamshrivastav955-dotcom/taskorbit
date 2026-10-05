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
import type { TaskStatus } from '../../types';

export function ManagerTaskDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'subtasks' | 'files' | 'comments' | 'activity'>('overview');
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    return dataStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const task = dataStore.getTaskById(id || 'task-1') || dataStore.getTasks()[0];
  const users = dataStore.getUsers();
  const assignee = users.find((u) => u.uid === task.assigneeId);
  const reviewer = users.find((u) => u.uid === task.reviewerId);
  const activities = dataStore.getActivities().filter((a) => a.targetId === task.id || a.projectId === task.projectId);

  const handleToggleSubtask = (stId: string) => {
    dataStore.toggleSubtask(task.id, stId);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    dataStore.addComment(task.id, commentText);
    setCommentText('');
  };

  const handleMarkComplete = () => {
    dataStore.updateTask(task.id, { status: 'approved', progress: 100 });
  };

  return (
    <AppLayout role="manager">
      <PageContainer>
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
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

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleMarkComplete}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                background: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#16A34A',
              }}
            >
              <CheckCircle2 size={16} />
              <span>Mark Complete</span>
            </button>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                background: 'var(--primary-gradient)',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <Edit2 size={15} />
              <span>Edit Task</span>
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
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: '#EEF2FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckSquare size={24} color="var(--primary)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700 }}>{task.title}</h1>
                <StatusBadge status={task.status} size="md" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                <span>{task.projectName}</span>
                <span>•</span>
                <span>{task.taskIdCode || 'TASK-101'}</span>
                <span>•</span>
                <span>Created {task.startDate}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PriorityBadge priority={task.priority} size="md" />
            {(task.labels || ['UI/UX', 'Design']).map((l, i) => (
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
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px' }}>
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

            {/* Attachments Grid */}
            <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
                  Attachments ({task.attachments?.length || 4})
                </h3>
                <button
                  onClick={() => alert('File upload dialog')}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: 'var(--primary)', fontWeight: 600 }}
                >
                  <Plus size={14} />
                  <span>Add File</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {(task.attachments || [
                  { id: '1', name: 'homepage-wireframe.fig', type: 'figma', size: '2.4 MB' },
                  { id: '2', name: 'brand-guidelines.pdf', type: 'pdf', size: '1.8 MB' },
                  { id: '3', name: 'hero-section.png', type: 'image', size: '1.2 MB' },
                  { id: '4', name: 'competitor-examples.zip', type: 'archive', size: '4.6 MB' },
                ]).map((att, i) => (
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
                  Subtasks ({task.subtasks?.length || 4})
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
                    : 50
                }
                height={6}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                {(task.subtasks || [
                  { id: 'st-1', title: 'Design hero section', completed: true, dueDate: 'Mar 12, 2025' },
                  { id: 'st-2', title: 'Create feature cards', completed: true, dueDate: 'Mar 14, 2025' },
                  { id: 'st-3', title: 'Design testimonials section', completed: false, dueDate: 'Mar 16, 2025' },
                  { id: 'st-4', title: 'Mobile responsive design', completed: false, dueDate: 'Mar 18, 2025' },
                ]).map((st) => (
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
                  <select
                    value={task.status}
                    onChange={(e) => dataStore.updateTask(task.id, { status: e.target.value as TaskStatus })}
                    style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '12px', fontWeight: 600 }}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="submitted">Submitted</option>
                    <option value="in_review">In Review</option>
                    <option value="revision">Revision</option>
                    <option value="approved">Approved</option>
                  </select>
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
                  <span style={{ fontWeight: 600 }}>{task.estimatedHours || 24} hrs</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Actual Hours</span>
                  <span style={{ fontWeight: 600 }}>{task.actualHours || 12} hrs</span>
                </div>
              </div>
            </div>

            {/* Comments Thread with Add Comment */}
            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>
                Comments ({task.comments?.length || 2})
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
      </PageContainer>
    </AppLayout>
  );
}
