import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { PriorityBadge } from '../../components/ui/PriorityBadge';

export function ReviewerOverview(): JSX.Element {
  const navigate = useNavigate();

  return (
    <AppLayout role="reviewer">
      <PageContainer>
        {/* Header matching Reference Image 10 screen 1 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Good morning, Neha! 👋</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Here&apos;s an overview of your review queue and pending approvals.
            </p>
          </div>
          <button
            onClick={() => navigate('/reviewer/queue')}
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
            }}
          >
            <span>Open Review Queue</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
          <StatCard
            label="Pending Reviews"
            value="12"
            change="Awaiting evaluation"
            trend="down"
            color="purple"
            icon={<CheckSquare size={22} />}
          />
          <StatCard
            label="In Progress"
            value="5"
            change="Currently auditing"
            trend="up"
            color="blue"
            icon={<Clock size={22} />}
          />
          <StatCard
            label="Completed"
            value="18"
            change="Approved this month"
            trend="up"
            color="green"
            icon={<CheckCircle2 size={22} />}
          />
          <StatCard
            label="Overdue"
            value="3"
            change="Exceeded SLA"
            trend="down"
            color="red"
            icon={<AlertCircle size={22} />}
          />
        </div>

        {/* Middle Two-Column Grid: Review Progress (Left) & Upcoming Reviews (Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '20px' }}>
          {/* Review Progress Card */}
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, alignSelf: 'flex-start', marginBottom: '14px' }}>
              Review Progress
            </h3>

            <div style={{ margin: '14px 0' }}>
              <ProgressRing percentage={78} size={140} strokeWidth={12} sublabel="This Week" color="#10B981" />
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px', marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                  Approved
                </span>
                <strong>12</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
                  Requested Revision
                </span>
                <strong>4</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FBBF24' }} />
                  Pending
                </span>
                <strong>3</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8' }} />
                  In Progress
                </span>
                <strong>5</strong>
              </div>
            </div>
          </div>

          {/* Upcoming Reviews Card */}
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Upcoming Reviews</h3>
              <button
                onClick={() => navigate('/reviewer/queue')}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', fontWeight: 600, color: 'var(--primary)' }}
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { title: 'Homepage UI Design', project: 'Website Redesign', priority: 'high', due: 'Today', id: 'task-1' },
                { title: 'Mobile App Screens', project: 'Mobile Application', priority: 'medium', due: 'Today', id: 'task-mobile-ui' },
                { title: 'Logo Concepts', project: 'Brand Identity', priority: 'medium', due: 'Tomorrow', id: 'task-brand-guidelines' },
                { title: 'Blog Page Layout', project: 'Website Redesign', priority: 'low', due: 'Mar 14, 2025', id: 'task-1' },
                { title: 'Marketing Banners', project: 'Marketing Campaign', priority: 'low', due: 'Mar 15, 2025', id: 'task-video-edit' },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => navigate(`/reviewer/reviews/${item.id}`)}
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <PriorityBadge priority={item.priority as any} size="sm" />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', minWidth: '70px', textAlign: 'right' }}>
                      {item.due}
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
