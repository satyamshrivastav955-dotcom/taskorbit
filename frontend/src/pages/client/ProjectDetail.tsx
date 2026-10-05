import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FolderKanban,
  Calendar,
  Share2,
  MoreVertical,
  CheckCircle2,
  Clock,
  User,
  Users,
} from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Avatar, AvatarGroup } from '../../components/ui/Avatar';
import { dataStore } from '../../services/demoData';

export function ClientProjectDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'tasks' | 'files' | 'feedback' | 'activity'>('overview');

  const project = dataStore.getProjectById(id || 'proj-1') || dataStore.getProjects()[0];
  const users = dataStore.getUsers();
  const tasks = dataStore.getTasks({ projectId: project.id });
  const manager = users.find((u) => u.uid === project.managerId) || users[0];
  const team = (project.teamIds || [])
    .map((uid) => users.find((u) => u.uid === uid))
    .filter(Boolean) as { name: string; avatar?: string }[];

  return (
    <AppLayout role="client">
      <PageContainer>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <button
            onClick={() => navigate('/client/projects')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={14} />
            <span>Projects</span>
          </button>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{project.title}</span>
        </div>

        {/* Hero Card */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderKanban size={24} color="var(--primary)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700 }}>{project.title}</h1>
                <StatusBadge status={project.status} size="sm" />
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {project.startDate} – {project.deadline} • {project.progress}% Complete
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => alert('Project share link copied!')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                background: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
              }}
            >
              <Share2 size={15} />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Tabs Row */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '24px' }}>
          {(['overview', 'milestones', 'tasks', 'files', 'feedback', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 4px',
                fontSize: '14px',
                fontWeight: activeTab === tab ? 600 : 500,
                color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: `2px solid ${activeTab === tab ? 'var(--primary)' : 'transparent'}`,
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Two-Column Overview Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Project Overview</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {project.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Start Date</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, marginTop: '2px' }}>{project.startDate}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Due Date</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, marginTop: '2px' }}>{project.deadline}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Project Manager</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <Avatar name={manager.name} src={manager.avatar} size="sm" />
                    <span style={{ fontSize: '13.5px', fontWeight: 600 }}>{manager.name}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Team</div>
                  <div style={{ marginTop: '4px' }}>
                    <AvatarGroup users={team} max={4} size="sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones Card */}
            <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>Key Milestones</h3>
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

          {/* Right Column: Progress Ring & Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, alignSelf: 'flex-start', marginBottom: '14px' }}>
                Project Progress
              </h3>

              <div style={{ margin: '14px 0' }}>
                <ProgressRing percentage={project.progress} size={140} strokeWidth={12} sublabel="On Track" />
              </div>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px', marginTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                    Completed
                  </span>
                  <strong>28</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8' }} />
                    In Progress
                  </span>
                  <strong>12</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FBBF24' }} />
                    Pending
                  </span>
                  <strong>6</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
                    Overdue
                  </span>
                  <strong>2</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
