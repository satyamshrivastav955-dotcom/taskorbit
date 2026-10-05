import React, { useState } from 'react';
import { MessageSquare, Paperclip, Send, CheckCircle2, Clock } from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Avatar } from '../../components/ui/Avatar';

export function ClientFeedback(): JSX.Element {
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'resolved'>('all');
  const [selectedTask, setSelectedTask] = useState('Homepage Design');
  const [feedbackText, setFeedbackText] = useState('');

  const [feedbacks, setFeedbacks] = useState([
    {
      id: 'fb-1',
      task: 'Homepage Design',
      project: 'Website Redesign',
      comment: 'The homepage looks great! Can we make the hero section CTA button slightly more prominent?',
      date: 'Mar 12, 2025',
      status: 'Resolved',
      repliesCount: 3,
    },
    {
      id: 'fb-2',
      task: 'Mobile App Screens',
      project: 'Mobile Application',
      comment: 'Please update the color scheme for dark mode to match our newer brand guidelines.',
      date: 'Mar 10, 2025',
      status: 'In Progress',
      repliesCount: 5,
    },
    {
      id: 'fb-3',
      task: 'Logo Concepts',
      project: 'Brand Identity',
      comment: 'Option B is our favorite. Can we see it rendered on light and dark backgrounds?',
      date: 'Mar 5, 2025',
      status: 'Resolved',
      repliesCount: 2,
    },
    {
      id: 'fb-4',
      task: 'Blog Page Layout',
      project: 'Website Redesign',
      comment: 'Please ensure author bios and estimated reading times are included.',
      date: 'Feb 28, 2025',
      status: 'Pending',
      repliesCount: 4,
    },
    {
      id: 'fb-5',
      task: 'Marketing Banners',
      project: 'Marketing Campaign',
      comment: 'Approved for social distribution.',
      date: 'Feb 20, 2025',
      status: 'Resolved',
      repliesCount: 1,
    },
    {
      id: 'fb-6',
      task: 'Color Scheme Options',
      project: 'Brand Identity',
      comment: 'Secondary palette confirmed by marketing team.',
      date: 'Feb 15, 2025',
      status: 'Resolved',
      repliesCount: 2,
    },
  ]);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setFeedbacks([
      {
        id: `fb-${Date.now()}`,
        task: selectedTask,
        project: 'Website Redesign',
        comment: feedbackText,
        date: 'Today',
        status: 'Pending',
        repliesCount: 0,
      },
      ...feedbacks,
    ]);
    setFeedbackText('');
    alert('Your feedback has been submitted to the project manager and team!');
  };

  const filtered = feedbacks.filter((f) => {
    if (filterTab === 'pending') return f.status === 'Pending' || f.status === 'In Progress';
    if (filterTab === 'resolved') return f.status === 'Resolved';
    return true;
  });

  return (
    <AppLayout role="client">
      <PageContainer>
        {/* Header matching Reference Image 12 screen 6 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Feedback</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Review and provide feedback on project deliverables.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['all', 'pending', 'resolved'] as const).map((t) => (
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
              {t === 'all' ? 'All (6)' : t === 'pending' ? 'Pending (2)' : 'Resolved (4)'}
            </button>
          ))}
        </div>

        {/* Two-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px' }}>
          {/* Left: Feedback Threads */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map((fb) => (
              <div
                key={fb.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {fb.task}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                      ({fb.project})
                    </span>
                  </div>
                  <span
                    style={{
                      background: fb.status === 'Resolved' ? '#DCFCE7' : fb.status === 'In Progress' ? '#EEF2FF' : '#FEF3C7',
                      color: fb.status === 'Resolved' ? '#16A34A' : fb.status === 'In Progress' ? '#4F46E5' : '#D97706',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    {fb.status}
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '4px 0' }}>
                  {fb.comment}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-light)', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Avatar name="Acme Corp" size="sm" />
                    <span>Acme Corp • {fb.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 600 }}>
                    <MessageSquare size={14} />
                    <span>{fb.repliesCount} replies</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Add Feedback Form matching Reference Image 12 */}
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Add Feedback</h3>

            <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>Select Task *</label>
                <select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: '#F8FAFC', marginTop: '4px', fontSize: '13px', outline: 'none' }}
                >
                  <option value="Homepage Design">Homepage Design</option>
                  <option value="Mobile App Screens">Mobile App Screens</option>
                  <option value="Logo Concepts">Logo Concepts</option>
                  <option value="Blog Page Layout">Blog Page Layout</option>
                  <option value="Marketing Banners">Marketing Banners</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>Your Feedback *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Write your feedback..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <button
                type="button"
                onClick={() => alert('Attach file')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12.5px',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  alignSelf: 'flex-start',
                }}
              >
                <Paperclip size={15} />
                <span>Attach Files</span>
              </button>

              <button
                type="submit"
                style={{
                  padding: '10px',
                  background: 'var(--primary-gradient)',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  boxShadow: '0 2px 6px rgba(79, 70, 229, 0.2)',
                  marginTop: '4px',
                }}
              >
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
