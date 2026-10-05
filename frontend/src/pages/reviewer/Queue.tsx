import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckSquare } from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { Avatar } from '../../components/ui/Avatar';

export function ReviewQueue(): JSX.Element {
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const queueItems = [
    { id: 'task-1', title: 'Homepage UI Design', project: 'Website Redesign', submitter: 'Priya Mehta', submitterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', date: 'Mar 12, 2025', priority: 'high' },
    { id: 'task-mobile-ui', title: 'Mobile App Screens', project: 'Mobile Application', submitter: 'Arjun Kapoor', submitterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', date: 'Mar 11, 2025', priority: 'high' },
    { id: 'task-brand-guidelines', title: 'Logo Concepts', project: 'Brand Identity', submitter: 'Amit Patel', submitterAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', date: 'Mar 10, 2025', priority: 'medium' },
    { id: 'task-client-review', title: 'Blog Page Layout', project: 'Website Redesign', submitter: 'Rahul Sharma', submitterAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', date: 'Mar 10, 2025', priority: 'medium' },
    { id: 'task-video-edit', title: 'Color Scheme Options', project: 'Brand Identity', submitter: 'Priya Mehta', submitterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', date: 'Mar 9, 2025', priority: 'low' },
    { id: 'task-thumb-design', title: 'Marketing Banners', project: 'Marketing Campaign', submitter: 'Neha Verma', submitterAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', date: 'Mar 8, 2025', priority: 'low' },
  ];

  const filtered = queueItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.project.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterTab === 'high') return item.priority === 'high';
    if (filterTab === 'medium') return item.priority === 'medium';
    if (filterTab === 'low') return item.priority === 'low';
    return true;
  });

  return (
    <AppLayout role="reviewer">
      <PageContainer>
        {/* Header matching Reference Image 10 screen 2 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Review Queue</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              View and manage all submissions pending review.
            </p>
          </div>
        </div>

        {/* Filter Pills & Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFilterTab('all')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                background: filterTab === 'all' ? 'var(--primary)' : '#FFF',
                color: filterTab === 'all' ? '#FFF' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                fontWeight: filterTab === 'all' ? 600 : 500,
                fontSize: '13px',
              }}
            >
              All (12)
            </button>
            <button
              onClick={() => setFilterTab('high')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                background: filterTab === 'high' ? 'var(--primary)' : '#FFF',
                color: filterTab === 'high' ? '#FFF' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                fontWeight: filterTab === 'high' ? 600 : 500,
                fontSize: '13px',
              }}
            >
              High Priority (4)
            </button>
            <button
              onClick={() => setFilterTab('medium')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                background: filterTab === 'medium' ? 'var(--primary)' : '#FFF',
                color: filterTab === 'medium' ? '#FFF' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                fontWeight: filterTab === 'medium' ? 600 : 500,
                fontSize: '13px',
              }}
            >
              Medium (5)
            </button>
            <button
              onClick={() => setFilterTab('low')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                background: filterTab === 'low' ? 'var(--primary)' : '#FFF',
                color: filterTab === 'low' ? '#FFF' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                fontWeight: filterTab === 'low' ? 600 : 500,
                fontSize: '13px',
              }}
            >
              Low (3)
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FFF', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px' }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search queue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12.5px' }}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Submission</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Project</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Submitted By</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Submitted On</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Priority</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckSquare size={16} color="var(--primary)" />
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.title}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {item.project}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar name={item.submitter} src={item.submitterAvatar} size="sm" />
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{item.submitter}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    {item.date}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <PriorityBadge priority={item.priority as any} size="sm" />
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button
                      onClick={() => navigate(`/reviewer/reviews/${item.id}`)}
                      style={{
                        padding: '6px 16px',
                        background: 'var(--primary-gradient)',
                        color: '#FFFFFF',
                        borderRadius: '6px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        boxShadow: '0 2px 6px rgba(79, 70, 229, 0.2)',
                      }}
                    >
                      Review
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
