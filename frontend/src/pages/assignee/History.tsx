import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, CheckCircle2, RotateCcw, Search, Eye } from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Avatar } from '../../components/ui/Avatar';

export function AssigneeHistory(): JSX.Element {
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState<'all' | 'completed' | 'reviewed' | 'revisions'>('all');

  const historyItems = [
    { id: '1', title: 'Homepage UI Design', project: 'Website Redesign', date: 'Mar 1, 2025', status: 'Approved', reviewer: 'Neha Verma' },
    { id: '2', title: 'Mobile App Screens', project: 'Mobile Application', date: 'Mar 5, 2025', status: 'Approved', reviewer: 'Rahul Sharma' },
    { id: '3', title: 'Logo Concepts', project: 'Brand Identity', date: 'Mar 8, 2025', status: 'Approved', reviewer: 'Amit Patel' },
    { id: '4', title: 'Blog Page Layout', project: 'Website Redesign', date: 'Mar 10, 2025', status: 'Revision', reviewer: 'Neha Verma' },
    { id: '5', title: 'Marketing Banners', project: 'Marketing Campaign', date: 'Feb 28, 2025', status: 'Approved', reviewer: 'Rahul Sharma' },
    { id: '6', title: 'Color Scheme Options', project: 'Brand Identity', date: 'Feb 25, 2025', status: 'Approved', reviewer: 'Neha Verma' },
  ];

  const filtered = historyItems.filter((item) => {
    if (filterTab === 'completed') return item.status === 'Approved';
    if (filterTab === 'revisions') return item.status === 'Revision';
    return true;
  });

  return (
    <AppLayout role="assignee">
      <PageContainer>
        {/* Header matching Reference Image 2 screen 8 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Work History</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Track your completed work, submissions, and review outcomes.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['all', 'completed', 'reviewed', 'revisions'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterTab(t)}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                background: filterTab === t ? 'var(--primary)' : '#FFF',
                color: filterTab === t ? '#FFF' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                fontWeight: filterTab === t ? 600 : 500,
                fontSize: '13px',
              }}
            >
              {t === 'all' ? 'All (10)' : t === 'completed' ? 'Completed (6)' : t === 'reviewed' ? 'Reviewed (3)' : 'Revisions (1)'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Task</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Project</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Submitted On</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Reviewer</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '13.5px' }}>
                    {item.title}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {item.project}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    {item.date}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <StatusBadge status={item.status === 'Approved' ? 'approved' : 'revision'} size="sm" />
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <Avatar name={item.reviewer} size="sm" />
                      <span>{item.reviewer}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button
                      onClick={() => navigate('/assignee/tasks/task-1')}
                      style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Eye size={14} />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
