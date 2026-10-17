import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, UploadCloud } from 'lucide-react';
import { dataStore } from '../../services/demoData';
import { ConflictDialog } from '../project/ConflictDialog';
import { SuccessDialog, ErrorDialog } from '../ui/Dialogs';
import type { Priority, Task } from '../../types';
import styles from './Modal.module.css';
import { useDialog } from '../ui/useDialog';

interface CreateTaskModalProps {
  onClose: () => void;
  defaultProjectId?: string;
  defaultAssigneeId?: string;
  defaultReviewerId?: string;
}

interface Draft {
  projectId: string;
  title: string;
  description: string;
  assigneeId: string;
  reviewerId: string;
  startDate: string;
  deadline: string;
  priority: Priority;
  labels: string[];
  requirementIds: string[];
  subtaskTitles: string[];
}

export function CreateTaskModal({ onClose, defaultProjectId, defaultAssigneeId, defaultReviewerId }: CreateTaskModalProps): JSX.Element {
  const navigate = useNavigate();
  const projects = dataStore.getProjects();
  const users = dataStore.getUsers().filter((u) => u.role === 'assignee');
  const reviewers = dataStore.getUsers().filter((u) => u.role === 'reviewer');

  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId ?? projects[0]?.id ?? '');
  const [assigneeId, setAssigneeId] = useState(defaultAssigneeId ?? users[0]?.uid ?? '');
  const [reviewerId, setReviewerId] = useState(defaultReviewerId ?? reviewers[0]?.uid ?? '');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [description, setDescription] = useState('');
  const [labels, setLabels] = useState('');
  const [checklist, setChecklist] = useState('');
  const [requirementIds, setRequirementIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [failed, setFailed] = useState('');
  const [pending, setPending] = useState(false);
  const saving = useRef(false);
  const [created, setCreated] = useState<Task | null>(null);
  const [conflict, setConflict] = useState<{ items: Array<{ taskTitle: string; range: string }>; draft: Draft } | null>(null);
  const requirements = dataStore.getRequirements(projectId);
  const dialogRef = useDialog(onClose, pending);
  const hasAssignees = users.length > 0;
  const hasReviewers = reviewers.length > 0;

  function draft(): Draft {
    return { projectId, title: title.trim(), description, assigneeId, reviewerId, startDate, deadline: dueDate, priority, labels: labels.split(',').map((label) => label.trim()).filter(Boolean), requirementIds, subtaskTitles: checklist.split('\n').map((item) => item.trim()).filter(Boolean) };
  }

  async function save(d: Draft, force: boolean): Promise<void> {
    if (saving.current) return;
    saving.current = true;
    setPending(true);
    setFailed('');
    try {
      const res = await dataStore.createTask({ ...d, force });
      if (res.conflicts.length > 0 && !force) {
        setConflict({
          items: res.conflicts.map((c) => ({ taskTitle: c.taskB.title, range: c.overlapDateRange })),
          draft: d,
        });
        return;
      }
      setConflict(null);
      setCreated(res.task);
    } catch (e) {
      setFailed(e instanceof Error ? e.message : 'Task creation failed. Try again.');
    } finally {
      saving.current = false;
      setPending(false);
    }
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    setError('');
    const d = draft();
    if (d.title === '') { setError('Task title is required.'); return; }
    if (d.projectId === '') { setError('Choose a project.'); return; }
    if (d.assigneeId === '' || d.reviewerId === '') { setError('Choose an assignee and a reviewer.'); return; }
    if (d.startDate === '' || d.deadline === '') { setError('Start and due dates are required.'); return; }
    if (new Date(d.deadline) < new Date(d.startDate)) { setError('Due date must be on or after start date.'); return; }
    void save(d, false);
  }

  if (created !== null) {
    const assignee = users.find((u) => u.uid === created.assigneeId);
    return (
      <SuccessDialog
        title="Task Created Successfully!"
        body={`The task has been created and assigned to ${assignee?.name ?? 'the assignee'}.`}
        primaryLabel="View Task"
        onPrimary={() => navigate(`/manager/tasks/${created.id}`)}
        secondaryLabel="Create Another"
        onSecondary={() => { setCreated(null); setTitle(''); setDescription(''); }}
      />
    );
  }

  if (failed !== '') {
    return <ErrorDialog title="Creation Failed" body={failed} onRetry={() => setFailed('')} onCancel={onClose} />;
  }

  if (conflict !== null && conflict.items.length > 0) {
    const assigneeName = users.find((u) => u.uid === conflict.draft.assigneeId)?.name ?? 'Assignee';
    return (
      <ConflictDialog
        assignee={assigneeName}
        pending={pending}
        items={conflict.items}
        assignees={users.filter((u) => u.role === 'assignee').map((u) => ({ id: u.uid, name: u.name }))}
        onAssign={() => { void save(conflict.draft, true); }}
        onDates={() => setConflict(null)}
        onReassign={(id) => { void save({ ...conflict.draft, assigneeId: id }, false); }}
      />
    );
  }

  return (
    <div className={styles.backdrop} onClick={() => { if (!pending) onClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Create task" tabIndex={-1} className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create New Task</h2>
          <button type="button" disabled={pending} className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

          <form onSubmit={handleSubmit} className={styles.form} aria-describedby={error !== '' ? 'create-task-error' : undefined}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="create-task-title">Task Title *</label>
                <input id="create-task-title" type="text" className={styles.input} placeholder="e.g. Design hero section"
                  value={title} onChange={(e) => setTitle(e.target.value)} required aria-required="true" />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="create-task-project">Project *</label>
                <select id="create-task-project" className={styles.select} value={projectId} onChange={(e) => { setProjectId(e.target.value); setRequirementIds([]); }} required aria-required="true">
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
            </div>

          {requirements.length > 0 && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="create-task-requirements">Requirements covered</label>
              <select id="create-task-requirements" className={styles.select} multiple value={requirementIds} onChange={(e) => setRequirementIds(Array.from(e.target.selectedOptions).map((option) => option.value))} style={{ minHeight: '84px' }}>
                {requirements.map((requirement) => <option key={requirement.id} value={requirement.id}>{requirement.title}</option>)}
              </select>
              <span className={styles.dropSub}>Select the requirements this task delivers.</span>
            </div>
          )}

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="create-task-assignee">Assignee *</label>
                <select id="create-task-assignee" className={styles.select} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} required aria-required="true">
                  {!hasAssignees ? <option value="">No assignees available</option> : users.map((u) => <option key={u.uid} value={u.uid}>{u.name} ({u.jobTitle ?? u.role})</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="create-task-reviewer">Reviewer *</label>
                <select id="create-task-reviewer" className={styles.select} value={reviewerId} onChange={(e) => setReviewerId(e.target.value)} required aria-required="true">
                  {!hasReviewers ? <option value="">No reviewers available</option> : reviewers.map((u) => <option key={u.uid} value={u.uid}>{u.name}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="create-task-start">Start Date *</label>
                <input id="create-task-start" type="date" className={styles.input} value={startDate}
                  onChange={(e) => setStartDate(e.target.value)} required aria-required="true" />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="create-task-deadline">Due Date *</label>
                <input id="create-task-deadline" type="date" className={styles.input} value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)} required aria-required="true" />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="create-task-priority">Priority *</label>
                <select id="create-task-priority" className={styles.select} value={priority} onChange={(e) => setPriority(e.target.value as Priority)} required aria-required="true">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="create-task-description">Description</label>
            <textarea id="create-task-description" className={styles.textarea} placeholder="Create a modern, responsive hero section..."
              rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="create-task-labels">Labels (comma separated)</label>
            <input id="create-task-labels" type="text" className={styles.input} placeholder="UI/UX, Design, Frontend"
              value={labels} onChange={(e) => setLabels(e.target.value)} />
          </div>

          <label className={styles.field}>Task checklist (one item per line)
            <textarea className={styles.textarea} rows={3} value={checklist} onChange={(event) => setChecklist(event.target.value)} placeholder="Define acceptance criteria&#10;Check keyboard navigation" />
          </label>

          <div className={styles.field}>
            <label className={styles.label}>Attachments</label>
            <div className={styles.dropzone}>
              <UploadCloud size={24} className={styles.dropIcon} />
              <div className={styles.dropText}>
                <span>Attach files on the task after creation</span>
                <span className={styles.dropSub}>Files upload to Firebase Storage with the first submission</span>
              </div>
            </div>
          </div>

          {error !== '' && <p id="create-task-error" role="alert" style={{ color: 'var(--danger-dark)', fontSize: '13px' }}>{error}</p>}

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={pending}>
              {pending ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
