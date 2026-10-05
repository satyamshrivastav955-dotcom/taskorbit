import React, { useState } from 'react';
import { Download, FileText, Search, UploadCloud, Plus } from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';

export function ClientDocuments(): JSX.Element {
  const [filterTab, setFilterTab] = useState<'all' | 'designs' | 'documents' | 'other'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const files = [
    { id: 'f-1', name: 'homepage-wireframe.fig', project: 'Website Redesign', type: 'Design', size: '2.4 MB', date: 'Mar 12, 2025' },
    { id: 'f-2', name: 'brand-guidelines.pdf', project: 'Brand Identity', type: 'Document', size: '1.8 MB', date: 'Mar 8, 2025' },
    { id: 'f-3', name: 'logo-assets.zip', project: 'Brand Identity', type: 'Other', size: '4.6 MB', date: 'Mar 5, 2025' },
    { id: 'f-4', name: 'mobile-mockup.png', project: 'Mobile Application', type: 'Design', size: '980 KB', date: 'Mar 1, 2025' },
    { id: 'f-5', name: 'content-strategy.pdf', project: 'Marketing Campaign', type: 'Document', size: '1.2 MB', date: 'Feb 25, 2025' },
    { id: 'f-6', name: 'final-design.fig', project: 'Website Redesign', type: 'Design', size: '3.1 MB', date: 'Feb 20, 2025' },
  ];

  const filtered = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.project.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterTab === 'designs') return f.type === 'Design';
    if (filterTab === 'documents') return f.type === 'Document';
    if (filterTab === 'other') return f.type === 'Other';
    return true;
  });

  return (
    <AppLayout role="client">
      <PageContainer>
        {/* Header matching Reference Image 12 screen 5 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Documents</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Access and download project documents, designs, and deliverables.
            </p>
          </div>
          <button
            onClick={() => alert('Document upload modal')}
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
            <span>Upload Document</span>
          </button>
        </div>

        {/* Filter Tabs & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['all', 'designs', 'documents', 'other'] as const).map((t) => (
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
                {t === 'all' ? 'All Files' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FFF', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px' }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12.5px' }}
            />
          </div>
        </div>

        {/* File Table */}
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>File Name</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Project</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Type</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Uploaded On</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Size</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={18} color="var(--primary)" />
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {f.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {f.project}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ background: '#EEF2FF', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600 }}>
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
                      style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}
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
