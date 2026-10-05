import { useState } from 'react';
import { Download, FileText, Search } from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';

export function ReviewerDocuments(): JSX.Element {
  const [filterTab, setFilterTab] = useState<'all' | 'submitted' | 'approved' | 'guidelines'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const files = [
    { id: 'f-1', name: 'nebula_dashboard_v2.fig', project: 'Nebula AI Platform', status: 'In Review', type: 'Figma Design', size: '12.4 MB', date: 'Oct 04, 2026', author: 'Elena Rostova' },
    { id: 'f-2', name: 'brand_design_tokens_v2.1.json', project: 'Design System Unification', status: 'Approved', type: 'Design Tokens', size: '240 KB', date: 'Oct 03, 2026', author: 'Alex Morgan' },
    { id: 'f-3', name: 'taskorbit_brand_guidelines_2026.pdf', project: 'General Reference', status: 'Approved', type: 'Guidelines', size: '5.2 MB', date: 'Sep 15, 2026', author: 'System' },
    { id: 'f-4', name: 'payment_flow_audit_report.pdf', project: 'Mobile Banking App', status: 'Approved', type: 'Audit Spec', size: '1.4 MB', date: 'Sep 29, 2026', author: 'Marcus Brody' },
    { id: 'f-5', name: 'cloud_migration_architecture.pdf', project: 'Cloud Migration', status: 'In Review', type: 'Architecture', size: '3.8 MB', date: 'Oct 01, 2026', author: 'Sarah Jenkins' },
  ];

  const filtered = files.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.project.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterTab === 'submitted') return f.status === 'In Review';
    if (filterTab === 'approved') return f.status === 'Approved';
    if (filterTab === 'guidelines') return f.type === 'Guidelines';
    return true;
  });

  return (
    <AppLayout role="reviewer">
      <PageContainer>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Review Documents & Artifacts</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Inspect deliverables, review submitted specs, and check evaluation guidelines.
            </p>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['all', 'submitted', 'approved', 'guidelines'] as const).map((t) => (
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
                  : t === 'submitted'
                  ? 'Awaiting Review'
                  : t === 'approved'
                  ? 'Approved'
                  : 'Design Guidelines'}
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
              placeholder="Search deliverables or projects..."
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
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Deliverable</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Project</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Author</th>
                <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Status</th>
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
                      <div>
                        <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                          {f.name}
                        </span>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{f.type}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {f.project}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {f.author}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span
                      style={{
                        background: f.status === 'Approved' ? '#DCFCE7' : '#FEF3C7',
                        color: f.status === 'Approved' ? '#15803D' : '#B45309',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                      }}
                    >
                      {f.status}
                    </span>
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
