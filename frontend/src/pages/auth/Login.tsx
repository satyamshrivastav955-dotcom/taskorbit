import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { CheckCircle2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { auth, db, isFirebaseConfigured } from '../../services/firebase';
import { apiPost } from '../../services/api';
import { useAppDispatch } from '../../redux/hooks';
import { setSession } from '../../redux/sessionSlice';
import { Button } from '../../components/ui/Button';
import type { Role } from '../../types';
import styles from './Login.module.css';

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

const ROLE_LABELS: Record<Role, string> = {
  client: 'Client',
  manager: 'Manager',
  assignee: 'Assignee',
  reviewer: 'Reviewer',
};

type AuthState = 'login' | 'forgot' | 'forgot-sent';

function routeFor(role: string): string {
  return HOME[role as Role] ?? '/login';
}

/** Real Google "G" coloured SVG icon (4-colour, as per reference) */
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export function Login(): JSX.Element {
  const nav = useNavigate();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [mode, setMode] = useState<AuthState>('login');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function finishEmailLogin(cleanEmail: string, requestedRole: Role): Promise<void> {
    const token = await auth.currentUser?.getIdTokenResult(true);
    const assignedRole = (token?.claims.role as string | undefined) ?? '';
    let name = cleanEmail;
    try {
      const snap = await getDoc(doc(db, 'users', auth.currentUser?.uid ?? 'x'));
      if (snap.exists()) {
        const data = snap.data() as { role?: string; name?: string };
        name = data.name ?? name;
      }
    } catch {
      // Rules/offline: claim role alone routes correctly.
    }
    if (!Object.keys(HOME).includes(assignedRole)) {
      await auth.signOut();
      setError('This account has no role yet. Contact your administrator.');
      return;
    }
    if (assignedRole !== requestedRole) {
      await auth.signOut();
      setError(`That account is assigned to the ${ROLE_LABELS[assignedRole as Role]} workspace. Choose that role and try again.`);
      return;
    }
    dispatch(setSession({ uid: auth.currentUser?.uid ?? '', email: cleanEmail, name, role: assignedRole as Role }));
    nav(routeFor(assignedRole), { replace: true });
  }

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) { setError('Enter a valid email address.'); return; }
    if (mode === 'forgot') {
      if (!isFirebaseConfigured) { setError('Unable to connect. Please try again.'); return; }
      setPending(true);
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
        setMode('forgot-sent');
      } catch {
        setError('Unable to connect. Please try again.');
      } finally {
        setPending(false);
      }
      return;
    }
    if (password === '') { setError('Enter your password.'); return; }
    if (role === '') { setError('Select your workspace role.'); return; }
    if (!isFirebaseConfigured) { setError('Unable to connect. Please try again.'); return; }
    setPending(true);
    try {
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      await finishEmailLogin(cleanEmail, role);
    } catch (e) {
      const code = e instanceof Error && 'code' in e ? String((e as { code: unknown }).code) : '';
      if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) {
        setError('Incorrect email or password.');
      } else if (code.includes('network-request-failed')) {
        setError('Unable to connect. Please try again.');
      } else if (code.includes('too-many-requests')) {
        setError('Too many attempts. Wait a minute and try again.');
      } else {
        setError('Unable to connect. Please try again.');
      }
    } finally {
      setPending(false);
    }
  }

  async function onGoogle(): Promise<void> {
    setError('');
    if (role === '') { setError('Select your workspace role.'); return; }
    if (!isFirebaseConfigured) { setError('Unable to connect. Please try again.'); return; }
    setPending(true);
    try {
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      // Existing Google accounts keep their authoritative role. New accounts use
      // the selected role, just like email registration.
      const res = (await apiPost('/auth/google', { role })) as { role: string; name: string };
      await cred.user.getIdToken(true);
      if (res.role !== role) {
        await auth.signOut();
        setError(`That account is assigned to the ${ROLE_LABELS[res.role as Role] ?? 'other'} workspace. Choose that role and try again.`);
        return;
      }
      dispatch(setSession({ uid: cred.user.uid, email: cred.user.email ?? '', name: res.name, role: res.role as Role }));
      nav(routeFor(res.role), { replace: true });
    } catch (e) {
      const code = e instanceof Error && 'code' in e ? String((e as { code: unknown }).code) : '';
      if (code.includes('popup-closed-by-user')) {
        setError('');
      } else if (code.includes('network-request-failed')) {
        setError('Unable to connect. Please try again.');
      } else {
        setError('Google sign-in failed. Try again.');
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.shell}>
      {/* ── LEFT PANEL ─────────────────────────── */}
      <aside className={styles.panel} aria-hidden="true">
        {/* Orbit SVG lines */}
        <svg className={styles.orbitSvg} viewBox="0 0 760 820" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          {/* large sweeping arc from top-right to bottom-left */}
          <path
            d="M 720 60 Q 380 400 140 700"
            stroke="rgba(53,185,194,0.3)"
            strokeWidth="1.5"
            fill="none"
          />
          {/* secondary arc crossing the panel */}
          <path
            d="M 600 -40 Q 200 380 80 780"
            stroke="rgba(130,144,245,0.24)"
            strokeWidth="1"
            fill="none"
          />
          {/* small arc near top */}
          <path
            d="M 420 240 Q 560 300 680 220"
            stroke="rgba(53,185,194,0.2)"
            strokeWidth="1"
            fill="none"
          />
        </svg>

        {/* Glowing orbit nodes */}
        <div className={styles.nodeA} />
        <div className={styles.nodeB} />

        {/* Top-right accent dot (matches the reference's purple globe) */}
        <div className={styles.accentDot} />

        <div className={styles.panelContent}>
          {/* Brand */}
          <div className={styles.brand}>
            <span className={styles.orbitMark} />
            TaskOrbit
          </div>

          <p className={styles.pill}>Role-based Project Management</p>

          <h1>
            Orchestrate every<br />phase of your<br />
            <span className={styles.accent}>project lifecycle.</span>
          </h1>

          <p className={styles.lede}>
            From client brief to manager allocation, team execution, automated conflict detection, and visual reviewer approval.
          </p>

          <ul className={styles.features}>
            <li><CheckCircle2 size={17} strokeWidth={2} color="#35B9C2" /> Role-based workflow</li>
            <li><CheckCircle2 size={17} strokeWidth={2} color="#35B9C2" /> Smart task allocation</li>
            <li><CheckCircle2 size={17} strokeWidth={2} color="#35B9C2" /> Deadline conflict detection</li>
            <li><CheckCircle2 size={17} strokeWidth={2} color="#35B9C2" /> Real-time project progress</li>
          </ul>

          {/* Floating dashboard preview */}
          <div className={styles.preview}>
            {/* "On track" badge — top of preview, offset right */}
            <div className={styles.onTrack}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={14} strokeWidth={2.5} color="#fff" />
              </span>
              <div>
                On track
                <small>All milestones aligned</small>
              </div>
            </div>

            {/* Mini nav sidebar */}
            <div className={styles.miniNav}>
              <div className={`${styles.miniNavItem} ${styles.miniActive}`}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                Projects
              </div>
              <div className={styles.miniNavItem}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                Tasks
              </div>
              <div className={styles.miniNavItem}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Timeline
              </div>
              <div className={styles.miniNavItem}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                Team
              </div>
              <div className={styles.miniNavItem}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                Reports
              </div>
            </div>

            {/* Progress card */}
            <div className={styles.progressCard}>
              <div className={styles.progressTitle}>Project Progress</div>
              <div className={styles.ringRow}>
                <div className={styles.ring}>
                  <span>72%</span>
                </div>
                <div className={styles.ringBars}>
                  <div className={`${styles.bar} ${styles.barFull}`} />
                  <div className={`${styles.bar} ${styles.barShort}`} />
                </div>
              </div>
              <p className={styles.upcoming}>Upcoming Tasks</p>
              <ul className={styles.taskList}>
                <li>
                  <i className={styles.dotA} />
                  Design UI Screens
                  <b className={styles.taskDue}>Today</b>
                </li>
                <li>
                  <i className={styles.dotB} />
                  API Integration
                  <b className={styles.taskTomorrow}>Tomorrow</b>
                </li>
                <li>
                  <i className={styles.dotC} />
                  Client Review
                  <b className={styles.taskDate}>Mar 28</b>
                </li>
              </ul>
            </div>
          </div>

          {/* Stats bar */}
          <div className={styles.stats}>
            <span>
              <b>4</b>
              Roles
            </span>
            <span>
              <b>End-to-end</b>
              Project Lifecycle
            </span>
            <span>
              <b>Smarter</b>
              Task Management
            </span>
            <span>
              <b>Better</b>
              Team Collaboration
            </span>
          </div>
        </div>
      </aside>

      {/* ── RIGHT SIDE ─────────────────────────── */}
      <main className={styles.main}>
        <div className={styles.card}>
          {/* Card brand/logo */}
          <div className={styles.cardBrand}>
            <span className={styles.cardOrbitMark} />
            TaskOrbit
          </div>

          {mode === 'forgot-sent' ? (
            <>
              <h2>Check your inbox</h2>
              <p className={styles.sub}>A password reset link is on its way to {email.trim()}.</p>
              <Button variant="secondary" onClick={() => setMode('login')}>Back to sign in</Button>
            </>
          ) : (
            <>
              <h2>Welcome back</h2>
              <p className={styles.sub}>
                {mode === 'forgot'
                  ? 'Enter your email to reset your password'
                  : 'Sign in to your account to continue'}
              </p>

              <form onSubmit={onSubmit} noValidate>
                {/* Email field */}
                <label className={styles.field} htmlFor="login-email">
                  <Mail size={16} strokeWidth={1.75} />
                  <input
                    id="login-email"
                    aria-label="Email address"
                    type="email"
                    placeholder="Email address"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>

                {/* Password field */}
                {mode === 'login' ? (
                  <label className={styles.field} htmlFor="login-password">
                    <Lock size={16} strokeWidth={1.75} />
                    <input
                      id="login-password"
                      aria-label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.eye}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
                    </button>
                  </label>
                ) : null}

                {mode === 'login' ? (
                  <label className={styles.roleField} htmlFor="login-role">
                    <span>Workspace role</span>
                    <select
                      id="login-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role | '')}
                      required
                    >
                      <option value="">Select your role</option>
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                ) : null}

                {/* Remember me + Forgot password */}
                {mode === 'login' ? (
                  <div className={styles.row}>
                    <label className={styles.remember}>
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                      />
                      Remember me
                    </label>
                    <button
                      type="button"
                      className={styles.link}
                      onClick={() => { setMode('forgot'); setError(''); }}
                    >
                      Forgot password?
                    </button>
                  </div>
                ) : null}

                {/* Error message */}
                {error !== '' ? (
                  <p className={styles.error} role="alert">{error}</p>
                ) : null}

                {/* Sign in button */}
                <button type="submit" className={styles.primary} disabled={pending}>
                  {pending
                    ? 'Signing in...'
                    : mode === 'forgot'
                    ? 'Send reset link'
                    : <>Sign in &rarr;</>}
                </button>
              </form>

              {mode === 'login' ? (
                <>
                  <div className={styles.or}><span>OR</span></div>

                  {/* Google button with real 4-colour G logo */}
                  <button
                    type="button"
                    className={styles.google}
                    onClick={onGoogle}
                    disabled={pending}
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>

                  <p className={styles.signup}>
                    Don&apos;t have an account? <Link to="/register">Sign up</Link>
                  </p>
                </>
              ) : (
                <p className={styles.signup}>
                  <button type="button" className={styles.link} onClick={() => setMode('login')}>
                    Back to sign in
                  </button>
                </p>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
