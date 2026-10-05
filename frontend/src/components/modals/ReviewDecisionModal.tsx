import React, { useState } from 'react';
import { X, CheckCircle2, RotateCcw } from 'lucide-react';
import styles from './Modal.module.css';

interface ReviewDecisionModalProps {
  taskTitle: string;
  onClose: () => void;
  onSubmit: (decision: 'approved' | 'rejected', comments: string) => void;
}

export function ReviewDecisionModal({
  taskTitle,
  onClose,
  onSubmit,
}: ReviewDecisionModalProps): JSX.Element {
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [comments, setComments] = useState('');
  const [notifyAssignee, setNotifyAssignee] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (decision === 'rejected' && !comments.trim()) {
      alert('Feedback comments are required when requesting a revision.');
      return;
    }
    onSubmit(decision, comments);
    onClose();
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Submit Review Decision</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.content}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Reviewing submission for: <strong>{taskTitle}</strong>
          </div>

          <div className={styles.radioGroup}>
            <label
              className={`${styles.radioCard} ${decision === 'approved' ? styles.selectedRadio : ''}`}
            >
              <input
                type="radio"
                name="decision"
                checked={decision === 'approved'}
                onChange={() => setDecision('approved')}
              />
              <div className={styles.radioContent}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <span className={styles.radioTitle} style={{ color: '#10B981' }}>Approve</span>
                </div>
                <div className={styles.radioDesc}>
                  The submission meets all requirements and is approved. Task will be marked as complete.
                </div>
              </div>
            </label>

            <label
              className={`${styles.radioCard} ${decision === 'rejected' ? styles.selectedRadio : ''}`}
            >
              <input
                type="radio"
                name="decision"
                checked={decision === 'rejected'}
                onChange={() => setDecision('rejected')}
              />
              <div className={styles.radioContent}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RotateCcw size={16} color="#EF4444" />
                  <span className={styles.radioTitle} style={{ color: '#EF4444' }}>Request Revision</span>
                </div>
                <div className={styles.radioDesc}>
                  The submission needs changes before it can be approved. Assignee will be notified.
                </div>
              </div>
            </label>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Feedback Comments {decision === 'rejected' && <span style={{ color: '#EF4444' }}>*</span>}
            </label>
            <textarea
              className={styles.textarea}
              placeholder={
                decision === 'approved'
                  ? 'Great work! The deliverables look solid...'
                  : 'Please specify the exact revisions needed (e.g. typography adjustments, mobile alignment)...'
              }
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              required={decision === 'rejected'}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
            <input
              type="checkbox"
              checked={notifyAssignee}
              onChange={(e) => setNotifyAssignee(e.target.checked)}
            />
            <span>Send immediate notification to assignee</span>
          </label>

          <div className={styles.footer} style={{ margin: '0 -24px -24px -24px' }}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              style={{
                background: decision === 'approved' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              }}
            >
              {decision === 'approved' ? 'Approve Task' : 'Request Revision'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
