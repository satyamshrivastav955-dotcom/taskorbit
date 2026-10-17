import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { dataStore } from '../../services/demoData';
import type { ConflictDetail } from '../../types';
import styles from './Modal.module.css';
import { useDialog } from '../ui/useDialog';

interface ConflictResolutionModalProps {
  conflict: ConflictDetail;
  onClose: () => void;
  onResolved: () => void;
}

export function ConflictResolutionModal({
  conflict,
  onClose,
  onResolved,
}: ConflictResolutionModalProps): JSX.Element {
  const users = dataStore.getUsers().filter((u) => u.role === 'assignee');
  const [resolutionType, setResolutionType] = useState<'reassign' | 'reschedule' | 'keep_both'>('reassign');
  const [selectedAssignee, setSelectedAssignee] = useState(
    users.find((u) => u.uid !== conflict.assigneeId)?.uid ?? users[0]?.uid ?? ''
  );
  const editableTasks = [conflict.taskA, conflict.taskB].filter((task) => !['submitted', 'in_review', 'approved'].includes(task.status));
  const defaultTask = editableTasks.find((task) => task.id === conflict.taskB.id) ?? editableTasks[0] ?? conflict.taskB;
  const [targetTaskId, setTargetTaskId] = useState(defaultTask.id);
  const [newStartDate, setNewStartDate] = useState(defaultTask.startDate);
  const [newDeadline, setNewDeadline] = useState(defaultTask.deadline);
  const targetTask = editableTasks.find((task) => task.id === targetTaskId) ?? defaultTask;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const dialogRef = useDialog(onClose, pending);

  async function handleResolve(): Promise<void> {
    setError('');
    setPending(true);
    try {
      await dataStore.resolveConflict(conflict.id, resolutionType, {
        newAssigneeId: selectedAssignee,
        newStartDate,
        newDeadline,
        targetTaskId,
      });
      onResolved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Resolution failed. Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Resolve schedule conflict" tabIndex={-1} className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Resolve Conflict</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.content}>
          {/* Warning Banner */}
          <div className={styles.warningBanner}>
            <AlertTriangle size={18} className={styles.warningIcon} />
            <div>
              <div className={styles.warningTitle}>This task has a deadline conflict</div>
              <div className={styles.warningText}>
                {conflict.assigneeName} has overlapping active tasks ({conflict.overlapDays} days overlap between {conflict.taskA.title} and {conflict.taskB.title}).
              </div>
            </div>
          </div>

          {/* Conflict Details */}
          <div className={styles.detailsBox}>
            <div className={styles.detailsRow}>
              <span className={styles.detailsLabel}>Task A:</span>
              <span className={styles.detailsValue}>{conflict.taskA.title} ({conflict.taskA.projectName})</span>
            </div>
            <div className={styles.detailsRow}>
              <span className={styles.detailsLabel}>Dates A:</span>
              <span className={styles.detailsValue}>{conflict.taskA.startDate} – {conflict.taskA.deadline}</span>
            </div>
            <div className={styles.detailsRow}>
              <span className={styles.detailsLabel}>Overlaps with:</span>
              <span className={styles.detailsValue} style={{ color: 'var(--danger-dark)', fontWeight: 600 }}>
                {conflict.taskB.title} ({conflict.taskB.startDate} – {conflict.taskB.deadline})
              </span>
            </div>
            <div className={styles.detailsRow}>
              <span className={styles.detailsLabel}>Overlap Span:</span>
              <span className={styles.detailsValue}>{conflict.overlapDateRange} ({conflict.overlapDays} days)</span>
            </div>
          </div>

          {/* Resolution Options */}
          <div className={styles.sectionHeader}>Resolution Options</div>
          {editableTasks.length > 0 ? <label className={styles.field}>Task to change
            <select className={styles.select} value={targetTaskId} onChange={(event) => {
              setTargetTaskId(event.target.value);
              const selected = editableTasks.find((task) => task.id === event.target.value);
              if (selected) { setNewStartDate(selected.startDate); setNewDeadline(selected.deadline); }
            }}>{editableTasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}</select>
          </label> : <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Both tasks are locked for review. You can acknowledge the overlap; scheduling edits become available if a revision is requested.</p>}

          <div className={styles.radioGroup}>
            <label className={`${styles.radioCard} ${resolutionType === 'reassign' ? styles.selectedRadio : ''}`}>
              <input
                type="radio"
                name="resolution"
                checked={resolutionType === 'reassign'}
                onChange={() => setResolutionType('reassign')}
                disabled={editableTasks.length === 0}
              />
              <div className={styles.radioContent}>
                <div className={styles.radioTitle}>Reassign to another team member</div>
                <div className={styles.radioDesc}>
                  Transfer &apos;{targetTask.title}&apos; to another assignee.
                </div>
                {resolutionType === 'reassign' && (
                  <select
                    className={styles.select}
                    style={{ marginTop: '8px' }}
                    value={selectedAssignee}
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                  >
                    {users.map((u) => (
                      <option key={u.uid} value={u.uid}>
                        {u.name} — {u.availabilityStatus} ({u.jobTitle})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </label>

            <label className={`${styles.radioCard} ${resolutionType === 'reschedule' ? styles.selectedRadio : ''}`}>
              <input
                type="radio"
                name="resolution"
                checked={resolutionType === 'reschedule'}
                onChange={() => setResolutionType('reschedule')}
                disabled={editableTasks.length === 0}
              />
              <div className={styles.radioContent}>
                <div className={styles.radioTitle}>Reschedule deadline</div>
                <div className={styles.radioDesc}>
                  Shift dates so tasks occur sequentially without overlapping.
                </div>
                {resolutionType === 'reschedule' && (
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Start date
                      <input type="date" className={styles.input} value={newStartDate} onChange={(event) => setNewStartDate(event.target.value)} />
                    </label>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>New Deadline:</span>
                    <input
                      type="date"
                      className={styles.input}
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </label>

            <label className={`${styles.radioCard} ${resolutionType === 'keep_both' ? styles.selectedRadio : ''}`}>
              <input
                type="radio"
                name="resolution"
                checked={resolutionType === 'keep_both'}
                onChange={() => setResolutionType('keep_both')}
              />
              <div className={styles.radioContent}>
                <div className={styles.radioTitle}>Keep both (Acknowledge overlap)</div>
                <div className={styles.radioDesc}>
                  Assignee confirms they will multitask concurrently across both items.
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={styles.submitBtn} onClick={() => { void handleResolve(); }} disabled={pending || (resolutionType !== 'keep_both' && editableTasks.length === 0)}>
            {pending ? 'Resolving...' : 'Resolve Conflict'}
          </button>
        </div>
        {error !== '' && <p role="alert" style={{ color: 'var(--danger-dark)', fontSize: '13px', padding: '0 24px 16px 24px' }}>{error}</p>}
      </div>
    </div>
  );
}
