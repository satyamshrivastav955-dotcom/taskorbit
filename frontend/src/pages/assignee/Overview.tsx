import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  FileCheck,
  AlertCircle,
  Calendar,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { Avatar } from '../../components/ui/Avatar';
import { dataStore } from '../../services/demoData';

export function AssigneeOverview(): JSX.Element {
  const navigate = useNavigate();
  const [, setTick] = useState(0);

  useEffect(() => {
    return dataStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const activeUser = dataStore.getActiveUser();
  const myTasks = dataStore.getTasks({ assigneeId: 'user-priya' });
  const inProgressCount = myTasks.filter((t) => t.status === 'in_progress').length;
  const inReviewCount = myTasks.filter((t) => t.status === 'in_review' || t.status === 'submitted').length;
  const completedCount = myTasks.filter((t) => t.status === 'approved').length;

  return (
    <AppLayout role="assignee">
      <PageContainer>
        {/* Header matching Reference Image 2 screen 1 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Good morning, Priya! 👋</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Here&apos;s your work overview for today.
            </p>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
          <StatCard
            label="Total Tasks"
            value="8"
            change="Active assignments"
            trend="up"
            color="purple"
            icon={<CheckSquare size={22} />}
          />
          <StatCard
            label="In Progress"
            value="5"
            change="Under development"
            trend="up"
            color="blue"
            icon={<Clock size={22} />}
          />
          <StatCard
            label="In Review"
            value="2"
            change="Awaiting sign-off"
            trend="neutral"
            color="amber"
            icon={<FileCheck size={22} />}
          />
          <StatCard
            label="Due Soon"
            value="1"
            change="2 days left"
            trend="down"
            color="red"
            icon={<AlertCircle size={22} />}
          />
        </div>

        {/* Middle Two-Column Grid: My Tasks Progress (Left) & Upcoming Deadlines (Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '20px' }}>
          {/* Progress Card */}
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, alignSelf: 'flex-start', marginBottom: '14px' }}>
              My Tasks Progress
            </h3>

            <div style={{ margin: '14px 0' }}>
              <ProgressRing percentage={75} size={140} strokeWidth={12} sublabel="Completed this week" color="#10B981" />
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px', marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                  Completed
                </span>
                <strong>6</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8' }} />
                  In Progress
                </span>
                <strong>5</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FBBF24' }} />
                  In Review
                </span>
                <strong>2</strong>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Upcoming Deadlines</h3>
              <button
                onClick={() => navigate('/assignee/tasks')}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', fontWeight: 600, color: 'var(--primary)' }}
              >
                <span>View All Tasks</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { title: 'Design hero section', project: 'Website Redesign', date: 'Mar 12, 2025', tag: '2 days left', tagColor: '#DC2626', tagBg: '#FEE2E2', id: 'task-1' },
                { title: 'Create feature cards', project: 'Website Redesign', date: 'Mar 14, 2025', tag: '4 days left', tagColor: '#D97706', tagBg: '#FEF3C7', id: 'task-1' },
                { title: 'Mobile responsive design', project: 'Website Redesign', date: 'Mar 18, 2025', tag: 'In Progress', tagColor: '#4F46E5', tagBg: '#EEF2FF', id: 'task-mobile-ui' },
                { title: 'Fix UI issues', project: 'Mobile Application', date: 'Mar 20, 2025', tag: 'To Do', tagColor: '#475569', tagBg: '#F1F5F9', id: 'task-mobile-ui' },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => navigate(`/assignee/tasks/${item.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckSquare size={18} color="var(--primary)" />
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600 }}>{item.title}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{item.project}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{item.date}</span>
                    <span
                      style={{
                        background: item.tagBg,
                        color: item.tagColor,
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                      }}
                    >
                      {item.tag}
                    </span>
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
