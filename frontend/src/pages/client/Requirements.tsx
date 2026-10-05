import React, { useState } from 'react';
import { Plus, Search, FileText } from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { dataStore } from '../../services/demoData';
import type { Requirement } from '../../types';

export function ClientRequirements(): JSX.Element {
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [requirements, setRequirements] = useState(dataStore.getRequirements());
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const filtered = requirements.filter((r) => {
    if (filterTab === 'pending') return r.status === 'Pending';
    if (filterTab === 'in_progress') return r.status === 'In Progress';
    if (filterTab === 'completed') return r.status === 'Completed';
    return true;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newReq = dataStore.addRequirement({
      projectId: 'proj-1',
      title,
      description,
      status: 'Pending',
      submittedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      fileUrls: [],
    });
    setRequirements(dataStore.getRequirements());
    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  return (
    <AppLayout role="client" createButtonLabel="New Requirement">
      <PageContainer>
        {/* Header matching Reference Image 12 screen 4 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Requirements</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Submit new requirements and track their implementation status.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
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
            <span>New Requirement</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {(['all', 'pending', 'in_progress', 'completed'] as const).map((t) => (
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
              {t === 'in_progress' ? 'In Progress' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Requirements Table */}
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Title</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Description</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Submitted On</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '13.5px' }}>
                    {req.title}
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '350px' }}>
                    {req.description}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <StatusBadge status={req.status} size="sm" />
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    {req.submittedDate || 'Jan 12, 2025'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button
                      onClick={() => alert(`Requirement: ${req.title}\n\n${req.description}`)}
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

        {/* Add Requirement Modal */}
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ background: '#FFF', padding: '24px', borderRadius: '14px', width: '480px', maxWidth: '90%' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Submit New Requirement</h2>
              <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600 }}>Requirement Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dark Mode Theme Toggle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', marginTop: '4px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600 }}>Details & Acceptance Criteria</label>
                  <textarea
                    rows={4}
                    placeholder="Describe what needs to be built..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', marginTop: '4px', fontSize: '13px' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ padding: '8px 18px', borderRadius: '6px', background: 'var(--primary)', color: '#FFF', fontWeight: 600 }}>
                    Submit Requirement
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </PageContainer>
    </AppLayout>
  );
}
