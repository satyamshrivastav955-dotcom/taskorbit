import React, { useState } from 'react';
import { X, UploadCloud, FileText } from 'lucide-react';
import { dataStore } from '../../services/demoData';
import { ErrorDialog } from '../ui/Dialogs';
import styles from './Modal.module.css';
import { useDialog } from '../ui/useDialog';

interface SubmitWorkModalProps {
  taskId: string;
  taskTitle: string;
  onClose: () => void;
  onSubmitted: () => void;
}

const ACCEPT = '.png,.jpg,.jpeg,.pdf,.fig,.zip';
const MAX_BYTES = 50 * 1024 * 1024;

export function SubmitWorkModal({ taskId, taskTitle, onClose, onSubmitted }: SubmitWorkModalProps): JSX.Element {
  const [step, setStep] = useState<1 | 2>(1);
  const [note, setNote] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState('');
  const dialogRef = useDialog(onClose, pending);

  function pick(list: FileList | null): void {
    if (list === null || pending) return;
    const picked = Array.from(list);
    if (picked.some((file) => file.size <= 0 || file.size > MAX_BYTES)) {
      setFailed('Each deliverable must be between 1 byte and 50 MB. Choose smaller, non-empty files.');
      return;
    }
    const next = [...files];
    for (const file of picked) {
      if (!next.some((existing) => existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified)) next.push(file);
    }
    if (next.length > 10) { setFailed('Attach no more than 10 deliverables per submission.'); return; }
    setFiles(next);
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (files.length === 0) {
      setFailed('Attach at least one deliverable file.');
      return;
    }
    setPending(true);
    setFailed('');
    try {
      await dataStore.submitTask(
        taskId,
        { note: note.trim() === '' ? 'Deliverable uploaded for review.' : note.trim(), files },
        (pct) => setProgress(pct),
      );
      onSubmitted();
      onClose();
    } catch (err) {
      setFailed(err instanceof Error ? err.message : 'Upload failed. Check your connection and try again.');
    } finally {
      setPending(false);
    }
  }

  if (failed !== '') {
    return <ErrorDialog title="Upload Failed" body={failed} onRetry={() => setFailed('')} onCancel={onClose} />;
  }

  return (
    <div className={styles.backdrop} onClick={() => { if (!pending) onClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Submit work for review" tabIndex={-1} className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Submit for Review</h2>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{taskTitle}</div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} disabled={pending} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '12px 24px', gap: '24px', background: '#F8FAFC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 600, color: step === 1 ? 'var(--primary)' : 'var(--text-secondary)' }}>
            <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: step === 1 ? 'var(--primary)' : '#E2E8F0', color: step === 1 ? '#FFF' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>1</span>
            <span>Upload Files</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 600, color: step === 2 ? 'var(--primary)' : 'var(--text-secondary)' }}>
            <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: step === 2 ? 'var(--primary)' : '#E2E8F0', color: step === 2 ? '#FFF' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>2</span>
            <span>Add Notes &amp; Submit</span>
          </div>
        </div>

        <form onSubmit={(e) => { void handleSubmit(e); }} className={styles.content}>
          {step === 1 && (
            <>
              <label className={styles.dropzone} htmlFor="submit-files" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); pick(event.dataTransfer.files); }}>
                <UploadCloud size={32} className={styles.dropIcon} />
                <div className={styles.dropText}>
                  <span>Drag and drop files here or click to upload</span>
                  <span className={styles.dropSub}>PNG, JPG, PDF, FIG, ZIP up to 50 MB each</span>
                </div>
              </label>
              <input id="submit-files" type="file" multiple accept={ACCEPT} style={{ display: 'none' }}
                onChange={(e) => pick(e.target.files)} />

              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Selected Files ({files.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {files.map((f) => (
                    <div key={`${f.name}-${f.size}`}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', background: '#FFFFFF' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={18} color="var(--primary)" />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 500 }}>{f.name}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{(f.size / 1048576).toFixed(1)} MB</div>
                        </div>
                      </div>
                      <button type="button" onClick={() => setFiles(files.filter((x) => x !== f))}
                        style={{ color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }} aria-label={`Remove ${f.name}`}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {pending && progress > 0 && (
                <div style={{ height: '8px', borderRadius: '9999px', background: '#E2E8F0', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)' }} />
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div className={styles.field}>
                <label className={styles.label}>Submission Notes &amp; Comments</label>
                <textarea className={styles.textarea} rows={4} value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Detail changes made, reference links, or instructions for the reviewer..." autoFocus />
              </div>
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>Summary:</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>• {files.length} deliverable(s) attached</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>• Reviewer will receive a review notification immediately</div>
              </div>
            </>
          )}

          {pending && <div role="status" aria-live="polite" className={styles.uploadFeedback}>
            <span>{progress < 100 ? `Uploading deliverables · ${progress}%` : 'Saving your submission…'}</span>
            <div role="progressbar" aria-label="Deliverable upload" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className={styles.uploadTrack}><div style={{ width: `${progress}%` }} /></div>
          </div>}

          <div className={styles.footer} style={{ margin: '0 -24px -24px -24px' }}>
            {step === 1 ? (
              <>
                <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                <button type="button" className={styles.submitBtn} onClick={() => setStep(2)} disabled={files.length === 0}>
                  Next: Add Notes →
                </button>
              </>
            ) : (
              <>
                <button type="button" className={styles.cancelBtn} onClick={() => setStep(1)} disabled={pending}>← Back</button>
                <button type="submit" className={styles.submitBtn} disabled={pending}>
                  {pending ? `Uploading ${progress}%...` : 'Submit for Review'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
