import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { uploadFiles } from '../../services/uploads';
import { dataStore } from '../../services/demoData';
import { SuccessDialog, ErrorDialog } from '../ui/Dialogs';
import type { Priority, Project } from '../../types';
import styles from './Modal.module.css';
import { useDialog } from '../ui/useDialog';

interface CreateProjectModalProps {
  onClose: () => void;
}

export function CreateProjectModal({ onClose }: CreateProjectModalProps): JSX.Element {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('Website Redesign');
  const [requirements, setRequirements] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [failed, setFailed] = useState('');
  const [pending, setPending] = useState(false);
  const [created, setCreated] = useState<Project | null>(null);
  const [savedProject, setSavedProject] = useState<Project | null>(null);
  const dialogRef = useDialog(onClose, pending);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError('');
    setFailed('');
    if (title.trim() === '') { setError('Project name is required.'); return; }
    if (startDate === '' || deadline === '') { setError('Start and end dates are required.'); return; }
    if (new Date(deadline) < new Date(startDate)) { setError('End date must be on or after start date.'); return; }
    setPending(true);
    try {
      const project = await dataStore.createProject({
        title: title.trim(),
        description: description.trim() === '' ? `${category} project.` : description.trim(),
        priority,
        startDate,
        deadline,
      });
      setSavedProject(project);
      const uploaded = await uploadFiles(
        files,
        dataStore.getActiveUser().uid,
        `projects/${project.id}/requirements/`,
      );
      const lines = requirements.split('\n').map((l) => l.trim()).filter((l) => l !== '');
      for (let i = 0; i < lines.length; i++) {
        await dataStore.addRequirement({
          projectId: project.id,
          title: lines[i],
          details: category,
          files: i === 0 ? uploaded.map(({ name, storagePath }) => ({ name, storagePath })) : [],
        });
      }
      if (lines.length === 0 && uploaded.length > 0) {
        await dataStore.addRequirement({
          projectId: project.id,
          title: 'Attachments',
          details: category,
          files: uploaded.map(({ name, storagePath }) => ({ name, storagePath })),
        });
      }
      setCreated(project);
    } catch (e) {
      setFailed(e instanceof Error ? e.message : 'Project creation failed. Try again.');
    } finally {
      setPending(false);
    }
  }

  if (created !== null) {
    return (
      <SuccessDialog
        title="Project Created Successfully!"
        body={`'${created.title}' is ready. Add requirements or break it into tasks next.`}
        primaryLabel="View Project"
        onPrimary={() => navigate(`/client/projects/${created.id}`)}
        secondaryLabel="Close"
        onSecondary={onClose}
      />
    );
  }

  if (failed !== '') {
    return <ErrorDialog title={savedProject ? 'Project saved, attachments incomplete' : 'Creation failed'} body={savedProject ? `${failed} Your project is saved. Open it and add the remaining requirements or files; no duplicate project will be created.` : failed} retryLabel={savedProject ? 'Open saved project' : 'Try Again'} onRetry={() => { if (savedProject) navigate(`/client/projects/${savedProject.id}`); else setFailed(''); }} onCancel={onClose} />;
  }

  return (
    <div className={styles.backdrop} onClick={() => { if (!pending) onClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Create project" tabIndex={-1} className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create New Project</h2>
          <button type="button" disabled={pending} className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={(e) => { void handleSubmit(e); }} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="create-project-title">Project Name *</label>
            <input id="create-project-title" type="text" className={styles.input} placeholder="e.g. Website Redesign"
              value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="create-project-start">Start Date *</label>
              <input id="create-project-start" type="date" className={styles.input} value={startDate}
                onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="create-project-end">End Date *</label>
              <input id="create-project-end" type="date" className={styles.input} value={deadline}
                onChange={(e) => setDeadline(e.target.value)} required />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="create-project-description">Description</label>
            <textarea id="create-project-description" className={styles.textarea} rows={3} value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope, goals and success criteria..." />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="create-project-category">Project Category *</label>
              <select id="create-project-category" className={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Website Redesign">Website Redesign</option>
                <option value="Mobile Application">Mobile Application</option>
                <option value="Brand Identity">Brand Identity</option>
                <option value="Marketing Campaign">Marketing Campaign</option>
                <option value="Internal Dashboard">Internal Dashboard</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="create-project-priority">Priority *</label>
              <select id="create-project-priority" className={styles.select} value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="create-project-requirements">Requirements (one per line)</label>
            <textarea id="create-project-requirements" className={styles.textarea} rows={3} value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Draft onboarding flow wireframes&#10;Set up staging environment" />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="create-project-files">Attachments</label>
            <input id="create-project-files" type="file" multiple className={styles.input}
              onChange={(e) => setFiles(e.target.files !== null ? Array.from(e.target.files) : [])} />
            {files.length > 0 && <small>{files.length} file(s) selected</small>}
          </div>

          {error !== '' && <p role="alert" style={{ color: 'var(--danger-dark)', fontSize: '13px' }}>{error}</p>}

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={pending}>
              {pending ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
