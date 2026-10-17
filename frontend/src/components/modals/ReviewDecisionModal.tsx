import React, { useState } from 'react';
import { X, CheckCircle2, RotateCcw } from 'lucide-react';
import styles from './Modal.module.css';
import { useDialog } from '../ui/useDialog';

interface ReviewDecisionModalProps {
  taskTitle: string;
  initialDecision?: 'approved' | 'rejected';
  onClose: () => void;
  onSubmit: (decision: 'approved' | 'rejected', comments: string) => void | Promise<void>;
}

export function ReviewDecisionModal({
  taskTitle,
  initialDecision = 'approved',
  onClose,
  onSubmit,
}: ReviewDecisionModalProps): JSX.Element {
  const [decision, setDecision] = useState<'approved' | 'rejected'>(initialDecision);
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const dialogRef = useDialog(onClose, pending);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (decision === 'rejected' && !comments.trim()) {
      setError('Feedback comments are required when requesting a revision.');
      return;
    }
    setError('');
    setPending(true);
    try {
      await onSubmit(decision, comments);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not save this review.');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={() => { if (!pending) onClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Review decision" tabIndex={-1} className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Submit Review Decision</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} disabled={pending} aria-label="Close review decision">
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
                  <CheckCircle2 size={16} color="var(--success)" />
                  <span className={styles.radioTitle} style={{ color: 'var(--green-600)' }}>Approve</span>
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
                  <RotateCcw size={16} color="var(--danger)" />
                  <span className={styles.radioTitle} style={{ color: 'var(--danger-dark)' }}>Request Revision</span>
                </div>
                <div className={styles.radioDesc}>
                  The submission needs changes before it can be approved. Assignee will be notified.
                </div>
              </div>
            </label>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Feedback Comments {decision === 'rejected' && <span style={{ color: 'var(--danger)' }}>*</span>}
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

          <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>The assignee will be notified automatically when your decision is saved.</p>

          {error !== '' && <p role="alert" style={{ color: 'var(--danger-dark)', fontSize: '13px' }}>{error}</p>}

          <div className={styles.footer} style={{ margin: '0 -24px -24px -24px' }}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={pending}>
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={pending}
              style={{
                  background: decision === 'approved' ? 'var(--success)' : 'var(--danger)',
              }}
            >
              {pending ? 'Saving…' : decision === 'approved' ? 'Approve Task' : 'Request Revision'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
