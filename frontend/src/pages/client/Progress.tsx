import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, FolderKanban } from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { dataStore } from '../../services/demoData';

export function ClientProgress(): JSX.Element {
  const projects = dataStore.getProjects();
  const [selectedProjectId, setSelectedProjectId] = useState('proj-1');
  const project = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const milestones = [
    { title: 'Project Planning', start: '5%', span: '20%', color: '#93C5FD', completed: true },
    { title: 'Design Phase', start: '25%', span: '25%', color: '#93C5FD', completed: true },
    { title: 'Development', start: '48%', span: '24%', color: '#60A5FA', completed: false, isCurrent: true },
    { title: 'Testing & QA', start: '62%', span: '18%', color: '#FCD34D', completed: false },
    { title: 'Content Creation', start: '72%', span: '18%', color: '#86EFAC', completed: false },
    { title: 'Final Review', start: '82%', span: '12%', color: '#FCA5A5', completed: false },
    { title: 'Launch', start: '94%', span: '6%', color: '#C084FC', completed: false, isDiamond: true },
  ];

  return (
    <AppLayout role="client">
      <PageContainer>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Project Progress</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Visualize project timelines, milestones, and overall progress.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: '#FFFFFF', fontSize: '13px', outline: 'none', fontWeight: 600 }}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Milestone Timeline Grid + Right Progress Card matching Reference Image 12 screen 7 */}
        <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr', gap: '20px' }}>
          {/* Milestone Gantt */}
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px', position: 'relative', overflowX: 'auto' }}>
            {/* Header Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '180px repeat(4, 1fr)', borderBottom: '1px solid var(--border)', paddingBottom: '10px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <div>Stage</div>
              <div style={{ textAlign: 'center' }}>Jan 2025</div>
              <div style={{ textAlign: 'center' }}>Feb 2025</div>
              <div style={{ textAlign: 'center', position: 'relative' }}>
                Mar 2025
                <span style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', background: '#EF4444', color: '#FFF', fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '3px' }}>
                  Today
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>Apr 2025</div>
            </div>

            {/* Vertical Today line */}
            <div
              style={{
                position: 'absolute',
                top: '55px',
                bottom: '25px',
                left: 'calc(180px + (100% - 180px) * 0.62)',
                width: '1px',
                borderLeft: '1.5px dashed #EF4444',
                pointerEvents: 'none',
              }}
            />

            {/* Milestone Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              {milestones.map((m, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <CheckCircle2 size={16} color={m.completed ? '#10B981' : '#CBD5E1'} />
                    <span style={{ fontWeight: 500, color: m.completed ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {m.title}
                    </span>
                  </div>

                  <div style={{ position: 'relative', height: '24px', background: '#F8FAFC', borderRadius: '6px' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: m.start,
                        width: m.span,
                        height: '20px',
                        top: '2px',
                        background: m.color,
                        borderRadius: '4px',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        color: '#1E293B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                      }}
                    >
                      {m.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Progress Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ margin: '10px 0' }}>
                <ProgressRing percentage={72} size={130} strokeWidth={12} sublabel="On Track" color="#10B981" />
              </div>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                    Completed
                  </span>
                  <strong>28%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8' }} />
                    In Progress
                  </span>
                  <strong>48%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FBBF24' }} />
                    Pending
                  </span>
                  <strong>16%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
                    Overdue
                  </span>
                  <strong>8%</strong>
                </div>
              </div>
            </div>

            {/* Upcoming Milestones */}
            <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Upcoming Milestones</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>Testing & QA</span>
                  <span style={{ color: 'var(--text-muted)' }}>Apr 5, 2025</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>Content Creation</span>
                  <span style={{ color: 'var(--text-muted)' }}>Apr 15, 2025</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>Final Review</span>
                  <span style={{ color: 'var(--text-muted)' }}>Apr 25, 2025</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>Launch</span>
                  <span style={{ color: 'var(--text-muted)' }}>Apr 30, 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
