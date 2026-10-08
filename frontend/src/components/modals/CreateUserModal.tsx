import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { apiPost } from '../../services/api';
import type { Role } from '../../types';
import styles from './Modal.module.css';
import { useDialog } from '../ui/useDialog';

export function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }): JSX.Element {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('assignee');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const dialogRef = useDialog(onClose, pending);
  async function submit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError('');
    if (name.trim() === '' || !/^\S+@\S+\.\S+$/.test(email.trim())) { setError('Enter a name and a valid email.'); return; }
    if (password.length < 6) { setError('Temporary password must be at least 6 characters.'); return; }
    setPending(true);
    try { await apiPost('/users', { name: name.trim(), email: email.trim().toLowerCase(), password, role }); onCreated(); onClose(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not create this team account.'); }
    finally { setPending(false); }
  }
  return <div className={styles.backdrop} onClick={onClose}><div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Add team member" tabIndex={-1} className={styles.modal} onClick={(event) => event.stopPropagation()}><div className={styles.header}><h2 className={styles.title}>Add team member</h2><button className={styles.closeBtn} onClick={onClose} aria-label="Close"><X size={18} /></button></div><form onSubmit={(event) => { void submit(event); }} className={styles.form}><div className={styles.field}><label className={styles.label}>Full name</label><input className={styles.input} value={name} onChange={(event) => setName(event.target.value)} autoFocus /></div><div className={styles.field}><label className={styles.label}>Email</label><input className={styles.input} type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div><div className={styles.row}><div className={styles.field}><label className={styles.label}>Role</label><select className={styles.select} value={role} onChange={(event) => setRole(event.target.value as Role)}><option value="assignee">Assignee</option><option value="reviewer">Reviewer</option></select></div><div className={styles.field}><label className={styles.label}>Temporary password</label><input className={styles.input} type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></div></div>{error !== '' && <p role="alert" style={{ color: '#B91C1C', fontSize: '13px' }}>{error}</p>}<div className={styles.footer}><button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button><button type="submit" className={styles.submitBtn} disabled={pending}>{pending ? 'Creating…' : 'Create account'}</button></div></form></div></div>;
}
