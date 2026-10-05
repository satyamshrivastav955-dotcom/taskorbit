import React, { useState } from 'react';
import { Calendar, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';

export function AssigneeTimeline(): JSX.Element {
  const [timeRange, setTimeRange] = useState('Month');

  const myTimelineTasks = [
    { title: 'Design hero section', dateRange: 'Mar 10 – Mar 16', start: '15%', span: '20%', color: '#818CF8' },
    { title: 'Create feature cards', dateRange: 'Mar 12 – Mar 18', start: '25%', span: '18%', color: '#C084FC' },
    { title: 'Design testimonials', dateRange: 'Mar 15 – Mar 22', start: '38%', span: '15%', color: '#F472B6' },
    { title: 'Mobile responsive', dateRange: 'Mar 18 – Mar 25', start: '50%', span: '22%', color: '#34D399' },
    { title: 'Fix UI issues', dateRange: 'Mar 20 – Mar 26', start: '60%', span: '18%', color: '#FCD34D' },
    { title: 'Update icons', dateRange: 'Mar 22 – Mar 27', start: '68%', span: '14%', color: '#FCA5A5' },
    { title: 'Implement dark mode', dateRange: 'Mar 25 – Mar 30', start: '78%', span: '18%', color: '#60A5FA' },
    { title: 'Resolve feedback', dateRange: 'Mar 28 – Apr 2', start: '88%', span: '12%', color: '#A78BFA' },
  ];

  return (
    <AppLayout role="assignee">
      <PageContainer>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>My Timeline</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              View your personal task timeline and upcoming delivery deadlines.
            </p>
          </div>
        </div>

        {/* Toolbar matching Reference Image 2 screen 6 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '12px 18px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <Calendar size={15} color="var(--primary)" />
            <span>Mar 1, 2025 – Mar 31, 2025</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: '#FFFFFF', fontSize: '12.5px', fontWeight: 600 }}>
              Month
            </button>
            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: '#FFFFFF', fontSize: '12.5px', fontWeight: 600 }}>
              Today
            </button>
            <div style={{ display: 'flex', gap: '2px' }}>
              <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--border)', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={16} />
              </button>
              <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--border)', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Personal Gantt Viewport */}
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px', position: 'relative', overflowX: 'auto' }}>
          {/* Timeline Days Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '200px repeat(7, 1fr)', borderBottom: '1px solid var(--border)', paddingBottom: '10px', fontSize: '11.5px', color: 'var(--text-secondary)', textAlign: 'center' }}>
            <div style={{ textAlign: 'left', fontWeight: 600 }}>Task</div>
            <div>Mar 1</div>
            <div>Mar 5</div>
            <div>Mar 10</div>
            <div style={{ position: 'relative' }}>
              Mar 15
              <span style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', background: '#EF4444', color: '#FFF', fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '3px' }}>
                Today
              </span>
            </div>
            <div>Mar 20</div>
            <div>Mar 25</div>
            <div>Mar 30</div>
          </div>

          {/* Vertical Today Line */}
          <div
            style={{
              position: 'absolute',
              top: '55px',
              bottom: '25px',
              left: 'calc(200px + (100% - 200px) * 0.5)',
              width: '1px',
              borderLeft: '1.5px dashed #EF4444',
              pointerEvents: 'none',
            }}
          />

          {/* Task Timeline Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
            {myTimelineTasks.map((t, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {t.title}
                </span>

                <div style={{ position: 'relative', height: '24px', background: '#F8FAFC', borderRadius: '6px' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: t.start,
                      width: t.span,
                      height: '20px',
                      top: '2px',
                      background: t.color,
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 8px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                    }}
                  >
                    {t.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
