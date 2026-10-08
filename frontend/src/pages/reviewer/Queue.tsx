import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckSquare, Inbox, Loader2 } from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { Avatar } from '../../components/ui/Avatar';
import { dataStore } from '../../services/dataService';
import type { Task } from '../../types';
import styles from './Queue.module.css';

export function ReviewQueue(): JSX.Element {
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [, setTick] = useState(0);

  useEffect(() => dataStore.subscribe(() => setTick((t) => t + 1)), []);

  const me = dataStore.getActiveUser();
  const tasks = dataStore.getTasks({ reviewerId: me.uid });
  const users = dataStore.getUsers();
  const projects = dataStore.getProjects();
  const loading = dataStore.isLoading();
  const error = dataStore.getError();
  const queueItems = tasks.filter((task) => task.status === 'submitted' || task.status === 'in_review');
  const filtered = queueItems.filter((item) => {
    const project = projects.find((p) => p.id === item.projectId);
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
      || (project?.title ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && (filterTab === 'all' || item.priority === filterTab);
  });
  const count = (priority: Task['priority']): number => queueItems.filter((task) => task.priority === priority).length;

  return (
    <AppLayout role="reviewer">
      <PageContainer>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Review Queue</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Every item here is a real submission waiting for your decision.
            </p>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{queueItems.length} awaiting review</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {([
              ['all', `All (${queueItems.length})`],
              ['high', `High (${count('high')})`],
              ['medium', `Medium (${count('medium')})`],
              ['low', `Low (${count('low')})`],
            ] as const).map(([key, label]) => (
              <button key={key} onClick={() => setFilterTab(key)} aria-pressed={filterTab === key} style={{ padding: '6px 14px', borderRadius: '9999px', background: filterTab === key ? 'var(--primary)' : '#FFF', color: filterTab === key ? '#FFF' : 'var(--text-secondary)', border: '1px solid var(--border)', fontWeight: filterTab === key ? 600 : 500, fontSize: '13px' }}>
                {label}
              </button>
            ))}
          </div>
          <div className={styles.queueSearch}>
            <Search size={14} color="var(--text-muted)" aria-hidden="true" />
            <input aria-label="Search review queue" type="search" placeholder="Search queue..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className={styles.queueTableCard}>
          {loading && queueItems.length === 0 ? (
            <div className={styles.queueEmptyState} role="status">
              <Loader2 size={32} color="var(--primary)" className={styles.spinner} aria-hidden="true" />
              <p>Loading review queue…</p>
            </div>
          ) : error !== '' && queueItems.length === 0 ? (
            <div className={styles.queueEmptyState} role="alert">
              <p>Review queue unavailable</p>
              <span>{error}</span>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 20px' }}>
              <Inbox size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>Queue is clear</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>New submissions assigned to you will appear here.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                {['Submission', 'Project', 'Submitted by', 'Deadline', 'Priority', 'Action'].map((heading) => <th key={heading} style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>{heading}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map((item) => {
                  const project = projects.find((p) => p.id === item.projectId);
                  const submitter = users.find((u) => u.uid === item.assigneeId);
                  return <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 20px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckSquare size={16} color="var(--primary)" /><div><div style={{ fontSize: '13.5px', fontWeight: 600 }}>{item.title}</div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.status === 'in_review' ? 'Review in progress' : 'New submission'}</div></div></div></td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>{project?.title ?? item.projectName ?? '—'}</td>
                    <td style={{ padding: '14px 20px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Avatar name={submitter?.name} size="sm" /><span style={{ fontSize: '13px', fontWeight: 500 }}>{submitter?.name ?? '—'}</span></div></td>
                    <td style={{ padding: '14px 20px', fontSize: '12.5px', color: 'var(--text-muted)' }}>{item.deadline}</td>
                    <td style={{ padding: '14px 20px' }}><PriorityBadge priority={item.priority} size="sm" /></td>
                    <td style={{ padding: '14px 20px' }}><button onClick={() => navigate(`/reviewer/reviews/${item.id}`)} style={{ padding: '6px 16px', background: 'var(--primary)', color: '#FFFFFF', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600 }}>{item.status === 'in_review' ? 'Continue' : 'Review'}</button></td>
                  </tr>;
                })}
              </tbody>
            </table>
          )}
        </div>
      </PageContainer>
    </AppLayout>
  );
}
