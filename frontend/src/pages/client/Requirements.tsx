import React, { useEffect, useState } from 'react';
import { Plus, FileText, Loader2 } from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/Toast';
import { dataStore } from '../../services/dataService';

export function ClientRequirements(): JSX.Element {
  const { toast } = useToast();
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [, setTick] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => dataStore.subscribe(() => setTick((t) => t + 1)), []);

  const projects = dataStore.getProjects();
  const loading = dataStore.isLoading();

  // Only show requirements that belong to this client's projects
  const myProjectIds = new Set(projects.map((p) => p.id));
  const allRequirements = dataStore.getRequirements().filter(
    (r) => r.projectId === '' || myProjectIds.has(r.projectId),
  );

  useEffect(() => {
    if (projectId === '' && projects.length > 0) setProjectId(projects[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length]);

  // alias for the rest of the file
  const requirements = allRequirements;

  const filtered = requirements.filter((r) => {
    if (filterTab === 'pending') return r.status === 'Pending';
    if (filterTab === 'in_progress') return r.status === 'In Progress';
    if (filterTab === 'completed') return r.status === 'Completed';
    return true;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!title.trim()) return;
    if (projectId === '') { setFormError('Choose a project first.'); return; }
    void (async () => {
      try {
        await dataStore.addRequirement({ projectId, title, details: description, fileUrls: [] });
        setTitle('');
        setDescription('');
        setShowAddModal(false);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Could not save. Try again.');
      }
    })();
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
          {loading && requirements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Loader2 size={36} color="var(--primary)" style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Loading requirements…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {filterTab === 'all' ? 'No requirements yet' : `No ${filterTab.replace('_', ' ')} requirements`}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto 16px' }}>
                {filterTab === 'all'
                  ? 'Submit your first requirement to get started.'
                  : 'No requirements match this filter.'}
              </p>
              {filterTab === 'all' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    padding: '9px 20px',
                    background: 'var(--primary-gradient)',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                  }}
                >
                  Submit New Requirement
                </button>
              )}
            </div>
          ) : (
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
                      {req.details ?? ''}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      {req.createdAt.slice(0, 10)}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <button
                        onClick={() => toast(`${req.title} — ${req.details ?? 'No details'}`, 'info')}
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

        {/* Add Requirement Modal */}
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ background: '#FFF', padding: '24px', borderRadius: '14px', width: '480px', maxWidth: '90%' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Submit New Requirement</h2>
              <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600 }}>Project *</label>
                  <select value={projectId} onChange={(e) => setProjectId(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', marginTop: '4px', fontSize: '13px' }}>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
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
                {formError !== '' && <p role="alert" style={{ color: '#EF4444', fontSize: '13px' }}>{formError}</p>}
              </form>
            </div>
          </div>
        )}
      </PageContainer>
    </AppLayout>
  );
}
