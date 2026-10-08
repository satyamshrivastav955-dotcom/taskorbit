import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Search, Filter, MoreVertical, ArrowUp, ArrowDown, Inbox, Loader2 } from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { dataStore } from '../../services/demoData';
import styles from './AssigneePages.module.css';

export function MyTasks(): JSX.Element {
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState<'all' | 'todo' | 'in_progress' | 'in_review'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [, setTick] = useState(0);

  useEffect(() => dataStore.subscribe(() => setTick((t) => t + 1)), []);

  const me = dataStore.getActiveUser();
  const tasks = dataStore.getTasks({ assigneeId: me.uid });
  const loading = dataStore.isLoading();
  const error = dataStore.getError();

  const filtered = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterTab === 'todo') return t.status === 'todo';
    if (filterTab === 'in_progress') return t.status === 'in_progress';
    if (filterTab === 'in_review') return t.status === 'in_review' || t.status === 'submitted';
    return true;
  });

  return (
    <AppLayout role="assignee">
      <PageContainer>
        {/* Header matching Reference Image 2 screen 2 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>My Tasks</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              View and manage all your assigned tasks and execution milestones.
            </p>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFilterTab('all')}
              aria-pressed={filterTab === 'all'}
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
              All ({tasks.length})
            </button>
            <button
              onClick={() => setFilterTab('todo')}
              aria-pressed={filterTab === 'todo'}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                background: filterTab === 'todo' ? 'var(--primary)' : '#FFF',
                color: filterTab === 'todo' ? '#FFF' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                fontWeight: filterTab === 'todo' ? 600 : 500,
                fontSize: '13px',
              }}
            >
              To Do ({tasks.filter((task) => task.status === 'todo').length})
            </button>
            <button
              onClick={() => setFilterTab('in_progress')}
              aria-pressed={filterTab === 'in_progress'}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                background: filterTab === 'in_progress' ? 'var(--primary)' : '#FFF',
                color: filterTab === 'in_progress' ? '#FFF' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                fontWeight: filterTab === 'in_progress' ? 600 : 500,
                fontSize: '13px',
              }}
            >
              In Progress ({tasks.filter((task) => task.status === 'in_progress').length})
            </button>
            <button
              onClick={() => setFilterTab('in_review')}
              aria-pressed={filterTab === 'in_review'}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                background: filterTab === 'in_review' ? 'var(--primary)' : '#FFF',
                color: filterTab === 'in_review' ? '#FFF' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                fontWeight: filterTab === 'in_review' ? 600 : 500,
                fontSize: '13px',
              }}
            >
              In Review ({tasks.filter((task) => task.status === 'in_review' || task.status === 'submitted').length})
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FFF', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px' }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12.5px' }}
              />
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className={styles.tableCard}>
          {loading && tasks.length === 0 ? (
            <div className={styles.emptyState} role="status">
              <Loader2 size={32} color="var(--primary)" style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} aria-hidden="true" />
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Loading your tasks…</p>
            </div>
          ) : error !== '' && tasks.length === 0 ? (
            <div className={styles.emptyState} role="alert">
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#B91C1C' }}>Tasks unavailable</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <Inbox size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} aria-hidden="true" />
              <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-secondary)' }}>{tasks.length === 0 ? 'No tasks assigned yet' : 'No matching tasks'}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '5px' }}>{tasks.length === 0 ? 'New assignments will appear here.' : 'Try another filter or search term.'}</p>
            </div>
          ) : <table className={styles.table}>
            <thead>
              <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Task</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Project</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Due Date</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Priority</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => navigate(`/assignee/tasks/${t.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      navigate(`/assignee/tasks/${t.id}`);
                    }
                  }}
                  tabIndex={0}
                  style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckSquare size={16} color="var(--primary)" />
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 600 }}>{t.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.taskIdCode || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {t.projectName}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '12.5px', color: '#DC2626', fontWeight: 500 }}>
                    {t.deadline}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <PriorityBadge priority={t.priority} size="sm" />
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <StatusBadge status={t.status} size="sm" />
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/assignee/tasks/${t.id}`);
                      }}
                      style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '13px' }}
                    >
                      Open Task →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>}
        </div>
      </PageContainer>
    </AppLayout>
  );
}
