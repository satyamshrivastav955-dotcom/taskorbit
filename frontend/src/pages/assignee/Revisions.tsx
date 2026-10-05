import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, ArrowRight, CheckCircle2, MessageSquare, Paperclip } from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { Avatar } from '../../components/ui/Avatar';
import { SubmitWorkModal } from '../../components/modals/SubmitWorkModal';

export function AssigneeRevisions(): JSX.Element {
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [activeTaskTitle, setActiveTaskTitle] = useState('');

  const revisions = [
    {
      id: 'rev-1',
      title: 'Adjust spacing and alignment',
      project: 'Website Redesign',
      taskCode: 'TASK-101',
      taskId: 'task-1',
      reviewerName: 'Rahul Sharma',
      reviewerRole: 'Manager',
      date: 'Mar 14, 2025',
      status: 'Open',
      comment: 'Increase the spacing between the heading and CTA button. Also align the text to follow the new brand guidelines.',
    },
    {
      id: 'rev-2',
      title: 'Update mobile layout',
      project: 'Mobile Application',
      taskCode: 'TASK-205',
      taskId: 'task-mobile-ui',
      reviewerName: 'Neha Verma',
      reviewerRole: 'Reviewer',
      date: 'Mar 12, 2025',
      status: 'In Progress',
      comment: 'The mobile layout needs better spacing and the icons should be updated as per the latest designs.',
    },
    {
      id: 'rev-3',
      title: 'Change button color',
      project: 'Client Portal',
      taskCode: 'TASK-310',
      taskId: 'task-db-schema',
      reviewerName: 'Amit Patel',
      reviewerRole: 'Client',
      date: 'Mar 10, 2025',
      status: 'Resolved',
      comment: 'Please use the updated button color from the brand palette.',
    },
  ];

  const filtered = revisions.filter((r) => {
    if (filterTab === 'open') return r.status === 'Open';
    if (filterTab === 'in_progress') return r.status === 'In Progress';
    if (filterTab === 'resolved') return r.status === 'Resolved';
    return true;
  });

  return (
    <AppLayout role="assignee">
      <PageContainer>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Revision Requests</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              View and address feedback or revision requests from managers and reviewers.
            </p>
          </div>
        </div>

        {/* Filter Pills matching Reference Image 2 screen 5 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['all', 'open', 'in_progress', 'resolved'] as const).map((t) => (
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
              {t === 'all'
                ? 'All (3)'
                : t === 'open'
                ? 'Open (2)'
                : t === 'in_progress'
                ? 'In Progress (1)'
                : 'Resolved (1)'}
            </button>
          ))}
        </div>

        {/* Revision Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((rev) => (
            <div
              key={rev.id}
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RotateCcw size={18} color="#EF4444" />
                  </div>
                  <div>
                    <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {rev.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {rev.project} | {rev.taskCode}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    <Avatar name={rev.reviewerName} size="sm" />
                    <span>{rev.reviewerName} ({rev.reviewerRole})</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{rev.date}</span>
                  <span
                    style={{
                      background: rev.status === 'Open' ? '#FEE2E2' : rev.status === 'In Progress' ? '#EEF2FF' : '#DCFCE7',
                      color: rev.status === 'Open' ? '#DC2626' : rev.status === 'In Progress' ? '#4F46E5' : '#16A34A',
                      padding: '2px 10px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    {rev.status}
                  </span>
                </div>
              </div>

              {/* Feedback comment quote */}
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {rev.comment}
              </div>

              {/* Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={() => {
                    setActiveTaskTitle(rev.title);
                    setShowResubmitModal(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: 'var(--primary-gradient)',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  <span>View & Resolve</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {showResubmitModal && (
          <SubmitWorkModal
            taskId="task-1"
            taskTitle={activeTaskTitle || 'Homepage UI Design'}
            onClose={() => setShowResubmitModal(false)}
            onSubmitted={() => {
              alert('Updated deliverables resubmitted for review!');
            }}
          />
        )}
      </PageContainer>
    </AppLayout>
  );
}
