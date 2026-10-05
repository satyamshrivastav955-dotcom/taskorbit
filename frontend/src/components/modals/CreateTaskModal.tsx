import React, { useState } from 'react';
import { X, UploadCloud } from 'lucide-react';
import { dataStore } from '../../services/demoData';
import type { Priority } from '../../types';
import styles from './Modal.module.css';

interface CreateTaskModalProps {
  onClose: () => void;
  defaultProjectId?: string;
}

export function CreateTaskModal({ onClose, defaultProjectId }: CreateTaskModalProps): JSX.Element {
  const projects = dataStore.getProjects();
  const users = dataStore.getUsers().filter((u) => u.role !== 'client');
  const reviewers = dataStore.getUsers().filter((u) => u.role === 'reviewer' || u.role === 'manager');

  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || projects[0]?.id || '');
  const [assigneeId, setAssigneeId] = useState(users[0]?.uid || '');
  const [reviewerId, setReviewerId] = useState(reviewers[0]?.uid || '');
  const [startDate, setStartDate] = useState('2025-03-15');
  const [dueDate, setDueDate] = useState('2025-03-22');
  const [priority, setPriority] = useState<Priority>('medium');
  const [description, setDescription] = useState('');
  const [labels, setLabels] = useState('UI/UX, Design');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    const selectedProj = projects.find((p) => p.id === projectId);

    dataStore.createTask({
      projectId,
      projectName: selectedProj?.title || 'Project',
      title,
      description,
      assigneeId,
      reviewerId,
      startDate,
      deadline: dueDate,
      priority,
      status: 'todo',
      labels: labels.split(',').map((l) => l.trim()).filter(Boolean),
    });

    onClose();
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create New Task</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Task Title *</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Design hero section"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Project *</label>
              <select
                className={styles.select}
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Assignee *</label>
              <select
                className={styles.select}
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                {users.map((u) => (
                  <option key={u.uid} value={u.uid}>
                    {u.name} ({u.jobTitle || u.role})
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Reviewer *</label>
              <select
                className={styles.select}
                value={reviewerId}
                onChange={(e) => setReviewerId(e.target.value)}
              >
                {reviewers.map((u) => (
                  <option key={u.uid} value={u.uid}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Start Date *</label>
              <input
                type="date"
                className={styles.input}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Due Date *</label>
              <input
                type="date"
                className={styles.input}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Priority *</label>
              <select
                className={styles.select}
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              placeholder="Create a modern, responsive hero section..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Labels (comma separated)</label>
            <input
              type="text"
              className={styles.input}
              placeholder="UI/UX, Design, Frontend"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Attachments</label>
            <div className={styles.dropzone}>
              <UploadCloud size={24} className={styles.dropIcon} />
              <div className={styles.dropText}>
                <span>Drag and drop files here</span>
                <span className={styles.dropSub}>or click to upload (PNG, JPG, PDF, FIG up to 50MB)</span>
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
