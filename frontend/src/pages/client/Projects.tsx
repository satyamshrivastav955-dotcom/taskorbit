import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Plus, Loader2 } from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { CreateProjectModal } from '../../components/modals/CreateProjectModal';
import { dataStore } from '../../services/dataService';
import type { Project } from '../../types';
import styles from './ClientPages.module.css';

type FilterTab = 'all' | 'in_progress' | 'under_review' | 'completed' | 'draft';

function matchesFilter(p: Project, tab: FilterTab): boolean {
  if (tab === 'all') return true;
  if (tab === 'in_progress') return ['active', 'on_track', 'at_risk'].includes(p.status);
  if (tab === 'under_review') return p.status === 'submitted';
  if (tab === 'completed') return p.status === 'completed';
  if (tab === 'draft') return p.status === 'draft';
  return true;
}

export function ClientProjects(): JSX.Element {
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [showModal, setShowModal] = useState(false);
  const [, setTick] = useState(0);

  // Subscribe so component re-renders when Firestore data arrives
  useEffect(() => dataStore.subscribe(() => setTick((t) => t + 1)), []);

  const allProjects = dataStore.getProjects();
  const loading = dataStore.isLoading();
  const error = dataStore.getError();
  const filtered = allProjects.filter((p) => matchesFilter(p, filterTab));

  // Counts for filter pills — derived from real data
  const counts = {
    all: allProjects.length,
    in_progress: allProjects.filter((p) => ['active', 'on_track', 'at_risk'].includes(p.status)).length,
    under_review: allProjects.filter((p) => p.status === 'submitted').length,
    completed: allProjects.filter((p) => p.status === 'completed').length,
    draft: allProjects.filter((p) => p.status === 'draft').length,
  };

  const tabs: Array<{ key: FilterTab; label: string }> = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'in_progress', label: `In Progress (${counts.in_progress})` },
    { key: 'under_review', label: `Under Review (${counts.under_review})` },
    { key: 'completed', label: `Completed (${counts.completed})` },
    { key: 'draft', label: `Draft (${counts.draft})` },
  ];

  return (
    <AppLayout role="client" createButtonLabel="New Project Request">
      <PageContainer>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Projects</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Track the progress of all your projects.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
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
            <Plus size={16} />
            <span>New Project Request</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilterTab(t.key)}
              aria-pressed={filterTab === t.key}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                background: filterTab === t.key ? 'var(--primary)' : '#FFF',
                color: filterTab === t.key ? '#FFF' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                fontWeight: filterTab === t.key ? 600 : 500,
                fontSize: '13px',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className={styles.tableCard}>
          {loading && allProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Loader2 size={36} color="var(--primary)" style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Loading projects…</p>
            </div>
          ) : error !== '' && allProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }} role="alert">
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#B91C1C' }}>Projects unavailable</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <FolderKanban size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {filterTab === 'all' ? 'No projects yet' : `No ${filterTab.replace('_', ' ')} projects`}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto 16px' }}>
                {filterTab === 'all'
                  ? 'Submit a requirement request and your project manager will create your first project.'
                  : `No projects matching this filter right now.`}
              </p>
              {filterTab === 'all' && (
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    padding: '9px 20px',
                    background: 'var(--primary-gradient)',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                  }}
                >
                  New Project Request
                </button>
              )}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Project</th>
                  <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Progress</th>
                  <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Start Date</th>
                  <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Due Date</th>
                  <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/client/projects/${p.id}`)}
                    style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--pale-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FolderKanban size={18} color="var(--primary)" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13.5px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{p.clientName ?? ''}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px' }}>
                        <ProgressBar value={p.progress} height={6} />
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{p.progress}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <StatusBadge status={p.status} size="sm" />
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {p.startDate}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {p.deadline}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/client/projects/${p.id}`);
                        }}
                        style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '13px' }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showModal && <CreateProjectModal onClose={() => setShowModal(false)} />}
      </PageContainer>
    </AppLayout>
  );
}
