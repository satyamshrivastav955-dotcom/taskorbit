import React, { useEffect, useState } from 'react';
import { Download, FileText, Search, Plus, File, FileImage, Archive, Loader2 } from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { dataStore } from '../../services/dataService';

type FileType = 'all' | 'designs' | 'documents' | 'other';

function getFileType(fileName: string): 'Design' | 'Document' | 'Other' {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (['fig', 'sketch', 'xd', 'png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(ext)) return 'Design';
  if (['pdf', 'doc', 'docx', 'txt', 'md', 'xlsx', 'csv', 'ppt', 'pptx'].includes(ext)) return 'Document';
  return 'Other';
}

function FileTypeIcon({ fileName }: { fileName: string }) {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif', 'fig', 'sketch'].includes(ext)) {
    return <FileImage size={18} color="#6366F1" />;
  }
  if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ext)) {
    return <Archive size={18} color="#F59E0B" />;
  }
  return <File size={18} color="var(--primary)" />;
}

function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ClientDocuments(): JSX.Element {
  const [filterTab, setFilterTab] = useState<FileType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [, setTick] = useState(0);

  // Subscribe so component updates when Firestore data arrives
  useEffect(() => dataStore.subscribe(() => setTick((t) => t + 1)), []);

  const me = dataStore.getActiveUser();
  const projects = dataStore.getProjects();
  const tasks = dataStore.getTasks();
  const loading = dataStore.isLoading();

  // Build documents list from real submissions data + task attachments
  const submissions = dataStore.getSubmissions();
  const requirements = dataStore.getRequirements();
  const subFiles = submissions
    .filter((s) => s.fileUrl !== '')
    .map((s) => {
      const task = dataStore.getTaskById(s.taskId);
      const project = task ? projects.find((p) => p.id === task.projectId) : undefined;
      const fileType = getFileType(s.fileName);
      return {
        id: s.id,
        name: s.fileName || 'untitled deliverable',
        project: project?.title ?? task?.projectName ?? 'Project',
        type: fileType,
        size: formatFileSize(undefined),
        date: s.submittedAt ? s.submittedAt.slice(0, 10) : '—',
        url: s.fileUrl,
        taskTitle: task?.title ?? '',
      };
    });

  const taskFiles = tasks.flatMap((t) => {
    const project = projects.find((p) => p.id === t.projectId);
    return (t.attachments ?? []).map((att) => ({
      id: att.id,
      name: att.name,
      project: project?.title ?? t.projectName ?? 'Project',
      type: getFileType(att.name),
      size: att.size || '—',
      date: att.uploadedAt ? att.uploadedAt.slice(0, 10) : '—',
      url: att.url,
      taskTitle: t.title,
    }));
  });

  const requirementFiles = requirements.flatMap((requirement) => {
    const project = projects.find((item) => item.id === requirement.projectId);
    return (requirement.files ?? []).map((file) => ({
      id: file.id,
      name: file.name,
      project: project?.title ?? 'Project',
      type: getFileType(file.name),
      size: file.size || '—',
      date: file.uploadedAt ? file.uploadedAt.slice(0, 10) : requirement.createdAt.slice(0, 10),
      url: file.url,
      taskTitle: `Requirement: ${requirement.title}`,
    }));
  });

  const files = [...subFiles, ...taskFiles, ...requirementFiles];

  const filtered = files.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.taskTitle.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterTab === 'designs') return f.type === 'Design';
    if (filterTab === 'documents') return f.type === 'Document';
    if (filterTab === 'other') return f.type === 'Other';
    return true;
  });

  return (
    <AppLayout role="client">
      <PageContainer>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Documents</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Access and download project documents, designs, and deliverables.
            </p>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', overflowX: 'auto' }}>
          {loading && files.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Loader2 size={32} color="var(--primary)" style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Loading documents…
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {files.length === 0 ? 'No documents yet' : 'No files match your search'}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto' }}>
                {files.length === 0
                  ? 'Deliverable files submitted by your team will appear here automatically.'
                  : 'Try a different search term or filter.'}
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>File Name</th>
                  <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Project</th>
                  <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Task</th>
                  <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Type</th>
                  <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Submitted On</th>
                  <th style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => (
                  <tr key={f.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileTypeIcon fileName={f.name} />
                        <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {f.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {f.project}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {f.taskTitle}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ background: '#EEF2FF', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600 }}>
                        {f.type}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      {f.date}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noreferrer"
                        download={f.name}
                        style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                        title={`Download ${f.name}`}
                      >
                        <Download size={16} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </PageContainer>
    </AppLayout>
  );
}
