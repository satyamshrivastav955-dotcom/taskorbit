import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Calendar,
  Clock,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Users,
} from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Avatar, AvatarGroup } from '../../components/ui/Avatar';
import { CreateTaskModal } from '../../components/modals/CreateTaskModal';
import { dataStore } from '../../services/demoData';

export function ManagerProjectDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'timeline' | 'team' | 'documents' | 'activity'>('overview');
  const [showCreateTask, setShowCreateTask] = useState(false);

  useEffect(() => {
    return dataStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const project = dataStore.getProjectById(id || 'proj-1') || dataStore.getProjects()[0];
  const tasks = dataStore.getTasks({ projectId: project.id });
  const users = dataStore.getUsers();
  const activities = dataStore.getActivities(project.id);
  const requirements = dataStore.getRequirements(project.id);

  const teamMembers = (project.teamIds || [])
    .map((uid) => users.find((u) => u.uid === uid))
    .filter(Boolean) as { uid: string; name: string; avatar?: string; jobTitle?: string }[];

  return (
    <AppLayout role="manager">
      <PageContainer>
        {/* Breadcrumb & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <button
            onClick={() => navigate('/manager/projects')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={14} />
            <span>Back to Projects</span>
          </button>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{project.title}</span>
        </div>

        {/* Project Hero Header */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                background: '#EEF2FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FolderKanban size={26} color="var(--primary)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700 }}>{project.title}</h1>
                <StatusBadge status={project.status} size="md" />
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Client: <strong>{project.clientName}</strong> • {project.startDate} to {project.deadline}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {project.progress}%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {project.tasksCompleted ?? 12} of {project.totalTasks ?? 17} tasks
              </div>
            </div>
            <button
              onClick={() => setShowCreateTask(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                background: 'var(--primary-gradient)',
                color: '#FFF',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              <Plus size={16} />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '24px' }}>
          {(['overview', 'tasks', 'timeline', 'team', 'documents', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 4px',
                fontSize: '14px',
                fontWeight: activeTab === tab ? 600 : 500,
                color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: `2px solid ${activeTab === tab ? 'var(--primary)' : 'transparent'}`,
                transition: 'all 0.15s ease',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#FFF', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Project Overview</h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {project.description}
                </p>
              </div>

              <div style={{ background: '#FFF', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px' }}>Milestones</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(project.milestones || []).map((m) => (
                    <div
                      key={m.id}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckCircle2 size={16} color={m.completed ? '#10B981' : '#CBD5E1'} />
                        <span style={{ fontSize: '13.5px', fontWeight: 500, color: m.completed ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {m.title}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#FFF', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Team Members</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {teamMembers.map((m) => (
                    <div key={m.uid} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar name={m.name} src={m.avatar} size="md" />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{m.name}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{m.jobTitle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div style={{ background: '#FFF', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Tasks ({tasks.length})</h3>
              <button
                onClick={() => setShowCreateTask(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: 'var(--primary-gradient)',
                  color: '#FFF',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                }}
              >
                <Plus size={14} />
                <span>New Task</span>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {tasks.map((t) => {
                const assignee = users.find((u) => u.uid === t.assigneeId);
                return (
                  <div
                    key={t.id}
                    onClick={() => navigate(`/manager/tasks/${t.id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '14px 20px',
                      borderBottom: '1px solid var(--border-light)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                  >
                    <div style={{ flex: 1.5 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 600 }}>{t.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.taskIdCode || 'TASK'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '130px' }}>
                      <Avatar name={assignee?.name} src={assignee?.avatar} size="sm" />
                      <span style={{ fontSize: '12.5px' }}>{assignee?.name}</span>
                    </div>
                    <div style={{ minWidth: '100px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      Due {t.deadline}
                    </div>
                    <PriorityBadge priority={t.priority} size="sm" />
                    <StatusBadge status={t.status} size="sm" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showCreateTask && (
          <CreateTaskModal
            onClose={() => setShowCreateTask(false)}
            defaultProjectId={project.id}
          />
        )}
      </PageContainer>
    </AppLayout>
  );
}
