import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Plus, Search, Filter, ArrowUpDown } from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { CreateProjectModal } from '../../components/modals/CreateProjectModal';
import { dataStore } from '../../services/demoData';

export function ClientProjects(): JSX.Element {
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState<'all' | 'in_progress' | 'under_review' | 'completed'>('all');
  const [showModal, setShowModal] = useState(false);
  const projects = dataStore.getProjects().slice(0, 5);

  return (
    <AppLayout role="client" createButtonLabel="New Project Request">
      <PageContainer>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setFilterTab('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              background: filterTab === 'all' ? 'var(--primary)' : '#FFF',
              color: filterTab === 'all' ? '#FFF' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
              fontWeight: 600,
              fontSize: '13px',
            }}
          >
            All (5)
          </button>
          <button
            onClick={() => setFilterTab('in_progress')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              background: filterTab === 'in_progress' ? 'var(--primary)' : '#FFF',
              color: filterTab === 'in_progress' ? '#FFF' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
              fontWeight: 500,
              fontSize: '13px',
            }}
          >
            In Progress (3)
          </button>
          <button
            onClick={() => setFilterTab('under_review')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              background: filterTab === 'under_review' ? 'var(--primary)' : '#FFF',
              color: filterTab === 'under_review' ? '#FFF' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
              fontWeight: 500,
              fontSize: '13px',
            }}
          >
            Under Review (1)
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              background: filterTab === 'completed' ? 'var(--primary)' : '#FFF',
              color: filterTab === 'completed' ? '#FFF' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
              fontWeight: 500,
              fontSize: '13px',
            }}
          >
            Completed (1)
          </button>
        </div>

        {/* Table */}
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
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
              {projects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/client/projects/${p.id}`)}
                  style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FolderKanban size={18} color="var(--primary)" />
                      </div>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 600 }}>{p.title}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{p.clientName}</div>
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
        </div>

        {showModal && <CreateProjectModal onClose={() => setShowModal(false)} />}
      </PageContainer>
    </AppLayout>
  );
}
