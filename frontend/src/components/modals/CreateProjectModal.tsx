import React, { useState } from 'react';
import { X } from 'lucide-react';
import { dataStore } from '../../services/demoData';
import type { Priority } from '../../types';
import styles from './Modal.module.css';

interface CreateProjectModalProps {
  onClose: () => void;
}

export function CreateProjectModal({ onClose }: CreateProjectModalProps): JSX.Element {
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('Acme Corp');
  const [startDate, setStartDate] = useState('2025-03-01');
  const [deadline, setDeadline] = useState('2025-04-30');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('high');
  const [category, setCategory] = useState('Website Redesign');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a project name');
      return;
    }

    dataStore.createProject({
      title,
      description: description || 'Complete project implementation according to requirements and design standards.',
      clientId: 'user-client-acme',
      clientName,
      managerId: 'user-rahul',
      status: 'on_track',
      priority,
      startDate,
      deadline,
      teamIds: ['user-rahul', 'user-priya', 'user-arjun', 'user-neha'],
    });

    onClose();
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create New Project</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Project Name *</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. Website Redesign"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Client *</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. Acme Corp"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
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
              <label className={styles.label}>End Date *</label>
              <input
                type="date"
                className={styles.input}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              placeholder="Complete redesign of company website with modern UI/UX and improved performance..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Project Category *</label>
              <select
                className={styles.select}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Website Redesign">Website Redesign</option>
                <option value="Mobile Application">Mobile Application</option>
                <option value="Brand Identity">Brand Identity</option>
                <option value="Marketing Campaign">Marketing Campaign</option>
                <option value="Internal Dashboard">Internal Dashboard</option>
              </select>
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

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
