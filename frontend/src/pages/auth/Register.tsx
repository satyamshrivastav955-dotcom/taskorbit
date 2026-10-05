import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../services/firebase';
import { useAppDispatch } from '../../redux/hooks';
import { setSession } from '../../redux/sessionSlice';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import type { Role } from '../../types';
import styles from './Login.module.css';

const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:4000/api';

const HOME: Record<Role, string> = {
  client: '/client',
  manager: '/manager',
  assignee: '/assignee',
  reviewer: '/reviewer',
};

export function Register(): JSX.Element {
  const nav = useNavigate();
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('client');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    if (name.trim() === '') { setError('Enter your name.'); return; }
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) { setError('Enter a valid email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (!isFirebaseConfigured) {
      setError('Backend is not configured. Start the Express server, then try again.');
      return;
    }
    setPending(true);
    try {
      const res = await fetch(`${base}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: cleanEmail, password, role }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        setError(body?.error?.message ?? 'Registration failed. Try again.');
        return;
      }
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      dispatch(setSession({ uid: cred.user.uid, email: cleanEmail, name: name.trim(), role }));
      nav(HOME[role], { replace: true });
    } catch {
      setError('Could not reach the server. Is the backend running on port 4000?');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.side}>
        <div className={styles.brand}><span className={styles.mark} />TaskOrbit</div>
        <p className={styles.tag}>Create your account, pick your role, land on your dashboard.</p>
        <ul className={styles.roles}>
          <li>Client creates project + requirements</li>
          <li>Manager plans tasks, checks conflicts</li>
          <li>Assignee submits versioned work</li>
          <li>Reviewer approves or requests revision</li>
        </ul>
      </aside>
      <main className={styles.main}>
        <div className={styles.card}>
          <h1>Create account</h1>
          <p className={styles.sub}>Your role decides which dashboard you get.</p>
          <form onSubmit={onSubmit} noValidate>
            <Input label="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Select label="Role" value={role} onChange={(e) => setRole(e.target.value as Role)}
              options={[
                { value: 'client', label: 'Client' },
                { value: 'manager', label: 'Manager' },
                { value: 'assignee', label: 'Assignee' },
                { value: 'reviewer', label: 'Reviewer' },
              ]} />
            {error !== '' ? <p className={styles.error} role="alert">{error}</p> : null}
            <Button type="submit" pending={pending}>Create account</Button>
          </form>
          <p className={styles.hint}>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </main>
    </div>
  );
}
