import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { useDialog } from '../ui/useDialog';
import { useToast } from '../ui/Toast';
import { dataStore } from '../../services/dataService';
import { apiPut } from '../../services/api';
import type { Task, Priority } from '../../types';
import styles from './Modal.module.css';

export function EditTaskModal({ task, onClose }: { task: Task; onClose: () => void }): JSX.Element {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId);
  const [reviewerId, setReviewerId] = useState(task.reviewerId);
  const [startDate, setStartDate] = useState(task.startDate);
  const [deadline, setDeadline] = useState(task.deadline);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const ref = useDialog(onClose, pending);
  const people = dataStore.getUsers();
  const save = async (event: FormEvent): Promise<void> => {
    event.preventDefault(); setError('');
    if (!title.trim() || !startDate || !deadline || deadline < startDate) { setError('Add a title and valid start and due dates.'); return; }
    setPending(true);
    try {
      await apiPut(`/tasks/${task.id}`, { title: title.trim(), description: description.trim(), assigneeId, reviewerId, startDate, deadline, priority });
      await dataStore.refresh(); toast('Task updated. Scheduling conflicts have been recalculated.', 'success'); onClose();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save the task.'); }
    finally { setPending(false); }
  };
  return <div className={styles.backdrop} onClick={() => { if (!pending) onClose(); }}><div ref={ref} role="dialog" aria-modal="true" aria-label="Edit task" tabIndex={-1} className={styles.modal} onClick={(event) => event.stopPropagation()}>
    <div className={styles.header}><h2 className={styles.title}>Edit task</h2><button type="button" className={styles.closeBtn} disabled={pending} onClick={onClose} aria-label="Close task editor"><X size={18} /></button></div>
    <form className={styles.form} onSubmit={(event) => { void save(event); }}>
      <label className={styles.field}>Title<input className={styles.input} value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} autoFocus required /></label>
      <label className={styles.field}>Description<textarea className={styles.textarea} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
      <div className={styles.row}><label className={styles.field}>Assignee<select className={styles.select} value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}>{people.filter((person) => person.role === 'assignee').map((person) => <option value={person.uid} key={person.uid}>{person.name}</option>)}</select></label><label className={styles.field}>Reviewer<select className={styles.select} value={reviewerId} onChange={(event) => setReviewerId(event.target.value)}>{people.filter((person) => person.role === 'reviewer').map((person) => <option value={person.uid} key={person.uid}>{person.name}</option>)}</select></label></div>
      <div className={styles.row}><label className={styles.field}>Start date<input type="date" className={styles.input} value={startDate} onChange={(event) => setStartDate(event.target.value)} required /></label><label className={styles.field}>Due date<input type="date" className={styles.input} value={deadline} min={startDate} onChange={(event) => setDeadline(event.target.value)} required /></label><label className={styles.field}>Priority<select className={styles.select} value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>{['low', 'medium', 'high'].map((value) => <option key={value}>{value}</option>)}</select></label></div>
      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Changes to dates and assignees will update both sides of any scheduling overlap.</p>
      {error && <p role="alert" style={{ fontSize: '13px', color: 'var(--red-700)' }}>{error}</p>}
      <div className={styles.footer}><button type="button" disabled={pending} className={styles.cancelBtn} onClick={onClose}>Cancel</button><button type="submit" disabled={pending} className={styles.submitBtn}>{pending ? 'Saving…' : 'Save changes'}</button></div>
    </form>
  </div></div>;
}
