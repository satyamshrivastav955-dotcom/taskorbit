import { Component, useEffect, type ErrorInfo, type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { onIdTokenChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Provider } from 'react-redux';
import { auth, db } from './services/firebase';
import { store } from './redux/store';
import { useAppDispatch } from './redux/hooks';
import { setSession, clearSession } from './redux/sessionSlice';
import { AppRoutes } from './pages/AppRoutes';
import type { Role } from './types';
import { apiPost } from './services/api';
import { ToastProvider } from './components/ui/Toast';
import './styles/global.css';

const VALID_ROLES: Role[] = ['client', 'manager', 'assignee', 'reviewer'];

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[TaskOrbit] UI error', error, info.componentStack);
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem', background: 'var(--background)' }}>
        <section role="alert" style={{ width: 'min(32rem, 100%)', padding: '2rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', background: 'var(--surface)', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
          <h1>TaskOrbit needs a refresh</h1>
          <p style={{ margin: '0.75rem 0 1.25rem', color: 'var(--text-secondary)' }}>This workspace could not finish rendering. Your saved work is unaffected.</p>
          <button type="button" onClick={() => window.location.reload()} style={{ minHeight: '2.5rem', padding: '0 1rem', borderRadius: '0.65rem', color: '#fff', background: 'var(--primary-gradient)' }}>Reload workspace</button>
        </section>
      </main>
    );
  }
}

function SessionGate({ children }: { children: ReactNode }): JSX.Element {
  const dispatch = useAppDispatch();
  useEffect(() => {
    let revision = 0;
    const unsub = onIdTokenChanged(auth, (user) => {
      const currentRevision = ++revision;
      if (user === null) {
        dispatch(clearSession());
        return;
      }
      void (async () => {
        try {
          const token = await user.getIdTokenResult();
          let role = (token.claims.role as string | undefined) ?? '';
          let name = user.email ?? '';
          try {
            const snap = await getDoc(doc(db, 'users', user.uid));
            if (snap.exists()) {
              const data = snap.data() as { role?: string; name?: string };
              name = data.name ?? name;
            }
          } catch {
            // Firestore read failed (rules/offline). Fall through with claim role.
          }
           if (!VALID_ROLES.includes(role as Role) && role === '' && user.providerData.some(provider => provider.providerId === 'google.com')) {
             const provisioned = await apiPost('/auth/google', {}) as { role?: string; name?: string };
             await user.getIdToken(true);
             role = ((await user.getIdTokenResult()).claims.role as string | undefined) ?? '';
             name = provisioned.name ?? name;
           }
           if (currentRevision !== revision || auth.currentUser?.uid !== user.uid) return;
           if (!VALID_ROLES.includes(role as Role)) {
            dispatch(clearSession());
            await auth.signOut();
            return;
          }
          dispatch(setSession({ uid: user.uid, email: user.email ?? '', name, role: role as Role }));
        } catch {
          if (currentRevision === revision) dispatch(clearSession());
        }
      })();
    });
    return () => { revision++; unsub(); };
  }, [dispatch]);
  return <>{children}</>;
}

export function App(): JSX.Element {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <SessionGate>
          <AppErrorBoundary>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </AppErrorBoundary>
        </SessionGate>
      </BrowserRouter>
    </Provider>
  );
}
