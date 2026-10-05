import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Clock,
  CheckCircle2,
  FileCheck,
  Plus,
  ArrowRight,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Avatar } from '../../components/ui/Avatar';
import { dataStore } from '../../services/demoData';

export function ClientOverview(): JSX.Element {
  const navigate = useNavigate();
  const projects = dataStore.getProjects().slice(0, 5);
  const activities = dataStore.getActivities().slice(0, 5);

  return (
    <AppLayout role="client" createButtonLabel="New Request">
      <PageContainer>
        {/* Welcome Header matching Reference Image 12 screen 1 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Welcome back, Acme Corp!</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Here&apos;s an overview of your projects and recent updates.
            </p>
          </div>
          <button
            onClick={() => navigate('/client/requirements')}
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
            <Plus size={16} />
            <span>New Request</span>
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
          <StatCard
            label="Total Projects"
            value="5"
            change="Active client scope"
            trend="up"
            color="green"
            icon={<FolderKanban size={22} />}
          />
          <StatCard
            label="In Progress"
            value="3"
            change="Sprint on schedule"
            trend="up"
            color="blue"
            icon={<Clock size={22} />}
          />
          <StatCard
            label="Under Review"
            value="1"
            change="Awaiting verification"
            trend="neutral"
            color="amber"
            icon={<FileCheck size={22} />}
          />
          <StatCard
            label="Completed"
            value="1"
            change="Delivered"
            trend="up"
            color="purple"
            icon={<CheckCircle2 size={22} />}
          />
        </div>

        {/* Middle Two-Column Grid: Project Progress (Left) & Recent Activity (Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>
          {/* Project Progress */}
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Project Progress</h3>
              <button
                onClick={() => navigate('/client/projects')}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', fontWeight: 600, color: 'var(--primary)' }}
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/client/projects/${p.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FolderKanban size={18} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1.2 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 600 }}>{p.title}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Due {p.deadline}</div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '100px' }}>
                      <ProgressBar value={p.progress} height={6} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, minWidth: '32px' }}>{p.progress}%</span>
                  </div>
                  <StatusBadge status={p.status} size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '18px' }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activities.map((act) => (
                <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '13px' }}>
                  <Avatar name={act.actorName} src={act.actorAvatar} size="sm" />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{act.actorName}</span>{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>{act.description}</span>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{act.timeAgo}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
