import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Calendar,
  CheckSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Users,
} from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { Avatar } from '../../components/ui/Avatar';
import { dataStore } from '../../services/demoData';

export function Reports(): JSX.Element {
  const navigate = useNavigate();
  const projects = dataStore.getProjects();
  const users = dataStore.getUsers().filter((u) => u.role !== 'client');
  const tasks = dataStore.getTasks();

  const handleExport = () => {
    alert('Generating executive PDF report for download...');
  };

  return (
    <AppLayout role="manager">
      <PageContainer>
        {/* Header matching Reference Image 1 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Reports</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Get insights into your projects, team performance, and overall progress.
            </p>
          </div>
          <button
            onClick={handleExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <Download size={15} />
            <span>Export Report</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FFFFFF', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}>
            <Calendar size={14} color="var(--text-muted)" />
            <span>Mar 1, 2025 – Mar 30, 2025</span>
          </div>
          <select style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: '#FFFFFF', fontSize: '13px', outline: 'none' }}>
            <option>All Projects</option>
          </select>
          <select style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: '#FFFFFF', fontSize: '13px', outline: 'none' }}>
            <option>All Teams</option>
          </select>
          <select style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: '#FFFFFF', fontSize: '13px', outline: 'none' }}>
            <option>Last 30 Days</option>
          </select>
        </div>

        {/* 4 Stat Cards matching Reference Image 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
          <StatCard
            label="Total Tasks"
            value="42"
            change="12% from last month"
            trend="up"
            color="purple"
            icon={<CheckSquare size={22} />}
          />
          <StatCard
            label="Completed Tasks"
            value="28"
            change="18% from last month"
            trend="up"
            color="green"
            icon={<CheckCircle2 size={22} />}
          />
          <StatCard
            label="In Progress Tasks"
            value="10"
            change="8% from last month"
            trend="down"
            color="blue"
            icon={<Clock size={22} />}
          />
          <StatCard
            label="Overdue Tasks"
            value="4"
            change="33% from last month"
            trend="down"
            color="red"
            icon={<AlertTriangle size={22} />}
          />
        </div>

        {/* Charts Row: Task Completion Trend (Left) & Task Status Distribution (Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          {/* Trend Line Chart */}
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Task Completion Trend</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4F46E5' }} />
                  <span>Completed</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#CBD5E1' }} />
                  <span>Created</span>
                </div>
              </div>
            </div>

            {/* SVG Trend Graph with Area Gradient */}
            <div style={{ position: 'relative', height: '180px', width: '100%', marginTop: '10px' }}>
              <svg viewBox="0 0 500 150" style={{ width: '100%', height: '100%' }}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Horizontal grid lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#F1F5F9" strokeWidth="1" />

                {/* Gray baseline (created) */}
                <path
                  d="M 10,130 Q 80,110 160,95 T 320,60 T 490,40"
                  fill="none"
                  stroke="#CBD5E1"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Area under purple line */}
                <path
                  d="M 10,130 Q 80,120 160,105 T 320,70 T 490,45 L 490,150 L 10,150 Z"
                  fill="url(#trendGrad)"
                />

                {/* Purple completion curve */}
                <path
                  d="M 10,130 Q 80,120 160,105 T 320,70 T 490,45"
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="2.5"
                />

                {/* Data points */}
                <circle cx="250" cy="85" r="4" fill="#4F46E5" stroke="#FFF" strokeWidth="2" />
                <circle cx="490" cy="45" r="4" fill="#4F46E5" stroke="#FFF" strokeWidth="2" />
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
              <span>Mar 1</span>
              <span>Mar 5</span>
              <span>Mar 10</span>
              <span>Mar 15</span>
              <span>Mar 20</span>
              <span>Mar 25</span>
              <span>Mar 30</span>
            </div>
          </div>

          {/* Status Donut Chart */}
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, alignSelf: 'flex-start', marginBottom: '14px' }}>
              Task Status Distribution
            </h3>

            <div style={{ margin: '10px 0' }}>
              <ProgressRing percentage={67} size={130} strokeWidth={12} sublabel="Total Tasks" />
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                  Completed
                </span>
                <strong>28 (67%)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8' }} />
                  In Progress
                </span>
                <strong>10 (24%)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818CF8' }} />
                  In Review
                </span>
                <strong>4 (9%)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Column Bottom Row matching Reference Image 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '20px' }}>
          {/* Team Performance */}
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Team Performance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {users.slice(0, 5).map((u) => {
                const rate = u.workloadPercentage || 80;
                return (
                  <div key={u.uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar name={u.name} src={u.avatar} size="sm" />
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.jobTitle}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '110px' }}>
                      <ProgressBar value={rate} color={rate > 80 ? 'green' : 'primary'} height={6} />
                      <span style={{ fontWeight: 600, minWidth: '32px', textAlign: 'right' }}>{rate}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Project Progress */}
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Project Progress</h3>
              <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/manager/projects')}>
                View All →
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {projects.slice(0, 5).map((p) => (
                <div key={p.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>{p.title}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.progress}%</span>
                  </div>
                  <ProgressBar value={p.progress} height={6} />
                </div>
              ))}
            </div>
          </div>

          {/* Key Insights matching Reference Image 1 */}
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Key Insights</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                <TrendingUp size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Task completion rate increased by 18%</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Your team completed 28 tasks this month, up from 24.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                <AlertCircle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#EF4444' }}>4 tasks are overdue</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>These tasks require immediate attention to prevent delay.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                <Users size={18} color="#3B82F6" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Team workload is balanced</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Task distribution across team members is within optimal range.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
