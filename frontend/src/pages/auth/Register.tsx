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

const ROLE_OPTIONS = [
  { value: 'client', label: 'Client' },
  { value: 'manager', label: 'Manager' },
  { value: 'assignee', label: 'Assignee' },
  { value: 'reviewer', label: 'Reviewer' },
] as const;

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
      // Registration sets the custom claim server-side. Refresh the ID token
      // before routing so SessionGate and API requests see the new role.
      await cred.user.getIdToken(true);
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
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardBrand}><span className={styles.orbitMark} />TaskOrbit</div>
          <h2>Create account</h2>
          <p className={styles.sub}>Choose your workspace role and create your TaskOrbit account.</p>
          <form onSubmit={onSubmit} noValidate>
            <Input label="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Select
              label="Role"
              id="register-role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              options={[...ROLE_OPTIONS]}
            />
            {error !== '' ? <p className={styles.error} role="alert">{error}</p> : null}
            <Button type="submit" pending={pending}>Create account</Button>
          </form>
          <p className={styles.hint}>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </main>
    </div>
  );
}
