import React, { useState } from 'react';
import { Download, FileText, Search, Plus, Filter, FolderGit2 } from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';

export function AssigneeDocuments(): JSX.Element {
  const [filterTab, setFilterTab] = useState<'all' | 'spec' | 'assets' | 'deliverables'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const files = [
    { id: 'f-1', name: 'design-tokens-v2.json', project: 'Design System Unification', type: 'Assets', size: '142 KB', date: 'Oct 04, 2026' },
    { id: 'f-2', name: 'conflict-engine-spec.pdf', project: 'TaskOrbit Core', type: 'Specification', size: '2.1 MB', date: 'Oct 02, 2026' },
    { id: 'f-3', name: 'api-contract-v1.yaml', project: 'Backend API Gateway', type: 'Specification', size: '84 KB', date: 'Sep 28, 2026' },
    { id: 'f-4', name: 'nebula-dashboard-deliverable.zip', project: 'Nebula AI Platform', type: 'Deliverable', size: '14.8 MB', date: 'Sep 25, 2026' },
    { id: 'f-5', name: 'component-library-figma-exports.zip', project: 'Design System Unification', type: 'Assets', size: '8.4 MB', date: 'Sep 20, 2026' },
    { id: 'f-6', name: 'audit-log-export.csv', project: 'TaskOrbit Core', type: 'Deliverable', size: '512 KB', date: 'Sep 15, 2026' },
  ];

  const filtered = files.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.project.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterTab === 'spec') return f.type === 'Specification';
    if (filterTab === 'assets') return f.type === 'Assets';
    if (filterTab === 'deliverables') return f.type === 'Deliverable';
    return true;
  });

  return (
    <AppLayout role="assignee">
      <PageContainer>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Task & Project Documents</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Reference specifications, component assets, and upload work deliverables.
            </p>
          </div>
          <button
            onClick={() => alert('Deliverable upload dialog')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              background: 'var(--primary-600)',
              color: '#FFFFFF',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
            <span>Upload Deliverable</span>
          </button>
        </div>

        {/* Filter Tabs & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['all', 'spec', 'assets', 'deliverables'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterTab(t)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  background: filterTab === t ? 'var(--primary-600)' : '#FFF',
                  color: filterTab === t ? '#FFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  fontWeight: filterTab === t ? 600 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {t === 'all'
                  ? 'All Documents'
                  : t === 'spec'
                  ? 'Specifications'
                  : t === 'assets'
                  ? 'Assets'
                  : 'Deliverables'}
              </button>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFF',
              border: '1px solid var(--border-color)',
              padding: '6px 12px',
              borderRadius: '8px',
            }}
          >
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search documents or projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12.5px' }}
            />
          </div>
        </div>

        {/* File Table */}
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '14px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>File Name</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Project</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Category</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Updated Date</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Size</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={18} color="var(--primary-600)" />
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {f.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {f.project}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span
                      style={{
                        background: '#EEF2FF',
                        color: 'var(--primary-700)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                      }}
                    >
                      {f.type}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    {f.date}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {f.size}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button
                      onClick={() => alert(`Downloading ${f.name}...`)}
                      style={{
                        color: 'var(--primary-600)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      title="Download file"
                    >
                      <Download size={16} />
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
