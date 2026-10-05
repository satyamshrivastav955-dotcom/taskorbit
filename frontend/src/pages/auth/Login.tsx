import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';
import { auth, db, isFirebaseConfigured } from '../../services/firebase';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setSession } from '../../redux/sessionSlice';
import { dataStore } from '../../services/demoData';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import type { Role } from '../../types';
import styles from './Login.module.css';

const HOME: Record<Role, string> = {
  client: '/client',
  manager: '/manager',
  assignee: '/assignee',
  reviewer: '/reviewer',
};

export function Login(): JSX.Element {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const session = useAppSelector((s) => s.session);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (session.ready && session.uid !== '' && session.role !== '') {
      navigate(HOME[session.role as Role] ?? '/manager', { replace: true });
    }
  }, [session, navigate]);

  // Instant 1-Click Role Login for demo/evaluation
  const handleQuickLogin = (role: Role) => {
    const users = dataStore.getUsers();
    const user = users.find((u) => u.role === role) || users[0];
    dataStore.setActiveUser(user.uid);
    dispatch(
      setSession({
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
      })
    );
    navigate(HOME[role], { replace: true });
  };

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Please enter your email.');
      return;
    }

    // Check if entered email matches any local demo user
    const users = dataStore.getUsers();
    const demoMatch = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (demoMatch) {
      handleQuickLogin(demoMatch.role);
      return;
    }

    if (!isFirebaseConfigured) {
      // Allow fallback if credentials entered
      handleQuickLogin('manager');
      return;
    }

    setPending(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const token = await cred.user.getIdTokenResult();
      let role = (token.claims.role as string | undefined) ?? '';
      let name = cred.user.email ?? cleanEmail;
      try {
        const snap = await getDoc(doc(db, 'users', cred.user.uid));
        if (snap.exists()) {
          const data = snap.data() as { role?: string; name?: string };
          if (!role) role = data.role ?? '';
          name = data.name ?? name;
        }
      } catch {
        // Fallback to claim role
      }

      const validRole = (['manager', 'client', 'assignee', 'reviewer'] as Role[]).includes(role as Role)
        ? (role as Role)
        : 'manager';

      dispatch(setSession({ uid: cred.user.uid, email: cred.user.email ?? cleanEmail, name, role: validRole }));
      navigate(HOME[validRole], { replace: true });
    } catch (err: any) {
      setError('Invalid credentials or Firebase configuration missing. Use quick demo buttons above.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.shell}>
      {/* Left Marketing Panel matching Reference Image 9 */}
      <aside className={styles.side}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#FFFFFF" strokeWidth="2.2" />
              <path
                d="M7 12A5 5 0 0 1 17 12"
                stroke="#60A5FA"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
            </svg>
          </div>
          <span className={styles.brandText}>TaskOrbit</span>
        </div>

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Orchestrate every phase of your <span>project lifecycle</span>.
          </h1>
          <p className={styles.heroDesc}>
            From client brief to manager allocation, team execution, automated conflict detection, and visual reviewer approval.
          </p>

          {/* Floating Glass Dashboard Preview Card */}
          <div className={styles.floatingGlassCard}>
            <div className={styles.glassHeader}>
              <span className={styles.glassTitle}>Nebula AI Platform</span>
              <span className={styles.glassBadge}>On Track</span>
            </div>
            <div className={styles.glassProgressWrap}>
              <div className={styles.glassProgressLabel}>
                <span>Sprint Progress</span>
                <span>84%</span>
              </div>
              <div className={styles.glassProgressBar}>
                <div className={styles.glassProgressFill} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '11.5px', color: '#94A3B8' }}>
              <span>✓ 28 Tasks Done</span>
              <span>⚡ 0 Conflicts</span>
              <span>👁 3 In Review</span>
            </div>
          </div>

          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <div className={styles.featureDot}>
                <AlertTriangle size={12} />
              </div>
              <span>Automated conflict detection: a.start ≤ b.end && b.start ≤ a.end</span>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureDot}>
                <Sparkles size={12} />
              </div>
              <span>Interactive visual canvas with pinned annotations</span>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureDot}>
                <ShieldCheck size={12} />
              </div>
              <span>Strict role isolation for Manager, Client, Assignee, Reviewer</span>
            </div>
          </div>
        </div>

        <div className={styles.sideFooter}>
          TaskOrbit Enterprise Platform v2.4 • Built with React & TypeScript
        </div>
      </aside>

      {/* Right Form Card */}
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.headingArea}>
            <h2 className={styles.title}>Welcome to TaskOrbit</h2>
            <p className={styles.subtitle}>
              Select a demo role for 1-click immediate access, or enter your credentials.
            </p>
          </div>

          {/* Quick Demo 1-Click Role Logins */}
          <div className={styles.demoRolesSection}>
            <span className={styles.demoRolesLabel}>Quick Demo Access (1-Click)</span>
            <div className={styles.rolesGrid}>
              <button
                type="button"
                className={styles.roleBtn}
                onClick={() => handleQuickLogin('manager')}
              >
                <Avatar name="Alex Morgan" size="sm" />
                <div>
                  <span className={styles.roleBtnTitle}>Manager</span>
                  <span className={styles.roleBtnUser}>Alex Morgan</span>
                </div>
              </button>

              <button
                type="button"
                className={styles.roleBtn}
                onClick={() => handleQuickLogin('client')}
              >
                <Avatar name="David Chen" size="sm" />
                <div>
                  <span className={styles.roleBtnTitle}>Client</span>
                  <span className={styles.roleBtnUser}>David Chen</span>
                </div>
              </button>

              <button
                type="button"
                className={styles.roleBtn}
                onClick={() => handleQuickLogin('assignee')}
              >
                <Avatar name="Elena Rostova" size="sm" />
                <div>
                  <span className={styles.roleBtnTitle}>Assignee</span>
                  <span className={styles.roleBtnUser}>Elena Rostova</span>
                </div>
              </button>

              <button
                type="button"
                className={styles.roleBtn}
                onClick={() => handleQuickLogin('reviewer')}
              >
                <Avatar name="Marcus Brody" size="sm" />
                <div>
                  <span className={styles.roleBtnTitle}>Reviewer</span>
                  <span className={styles.roleBtnUser}>Marcus Brody</span>
                </div>
              </button>
            </div>
          </div>

          <div className={styles.divider}>or sign in with email</div>

          <form onSubmit={onSubmit} className={styles.form}>
            <Input
              label="Email"
              type="email"
              placeholder="name@taskorbit.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.submitBtn} disabled={pending}>
              {pending ? 'Signing in...' : 'Sign In to Workspace'}
            </button>
          </form>

          <div className={styles.footer}>
            Don't have an account? <Link to="/register">Create an account</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
