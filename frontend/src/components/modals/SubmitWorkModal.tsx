import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { dataStore } from '../../services/demoData';
import styles from './Modal.module.css';

interface SubmitWorkModalProps {
  taskId: string;
  taskTitle: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export function SubmitWorkModal({
  taskId,
  taskTitle,
  onClose,
  onSubmitted,
}: SubmitWorkModalProps): JSX.Element {
  const [step, setStep] = useState<1 | 2>(1);
  const [note, setNote] = useState('');
  const [files, setFiles] = useState([
    { id: 'f-1', name: 'hero-section-final.fig', size: '2.4 MB', type: 'figma', url: '#' },
    { id: 'f-2', name: 'hero-section-preview.png', size: '1.2 MB', type: 'image', url: '#' },
  ]);

  const handleAddFile = () => {
    const fileName = prompt('Enter simulated deliverable file name:', 'deliverable-v2.zip');
    if (fileName) {
      setFiles([
        ...files,
        { id: `f-${Date.now()}`, name: fileName, size: '3.5 MB', type: 'archive', url: '#' },
      ]);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      alert('Please upload at least one deliverable file.');
      return;
    }
    dataStore.submitTask(taskId, {
      note: note || 'Deliverable uploaded for review.',
      files,
    });
    onSubmitted();
    onClose();
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Submit for Review</h2>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {taskTitle}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '12px 24px', gap: '24px', background: '#F8FAFC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 600, color: step === 1 ? 'var(--primary)' : 'var(--text-secondary)' }}>
            <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: step === 1 ? 'var(--primary)' : '#E2E8F0', color: step === 1 ? '#FFF' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
              1
            </span>
            <span>Upload Files</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 600, color: step === 2 ? 'var(--primary)' : 'var(--text-secondary)' }}>
            <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: step === 2 ? 'var(--primary)' : '#E2E8F0', color: step === 2 ? '#FFF' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
              2
            </span>
            <span>Add Notes & Submit</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.content}>
          {step === 1 && (
            <>
              <div className={styles.dropzone} onClick={handleAddFile}>
                <UploadCloud size={32} className={styles.dropIcon} />
                <div className={styles.dropText}>
                  <span>Drag and drop files here</span>
                  <span className={styles.dropSub}>or click to upload deliverables (PNG, JPG, PDF, FIG, ZIP max 50 MB)</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Uploaded Files ({files.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {files.map((f) => (
                    <div
                      key={f.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        background: '#FFFFFF',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={18} color="var(--primary)" />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 500 }}>{f.name}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{f.size}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(f.id)}
                        style={{ color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className={styles.field}>
                <label className={styles.label}>Submission Notes & Comments</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Detail changes made, reference links, or instructions for the reviewer..."
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>Summary:</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  • {files.length} deliverables attached
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  • Reviewer will receive a review notification immediately
                </div>
              </div>
            </>
          )}

          <div className={styles.footer} style={{ margin: '0 -24px -24px -24px' }}>
            {step === 1 ? (
              <>
                <button type="button" className={styles.cancelBtn} onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.submitBtn}
                  onClick={() => setStep(2)}
                  disabled={files.length === 0}
                >
                  Next: Add Notes →
                </button>
              </>
            ) : (
              <>
                <button type="button" className={styles.cancelBtn} onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Submit for Review
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
