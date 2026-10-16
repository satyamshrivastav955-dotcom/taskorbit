import { Component, useEffect, type ErrorInfo, type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { useAppDispatch } from './redux/hooks';
import { setSession, clearSession } from './redux/sessionSlice';
import { AppRoutes } from './pages/AppRoutes';
import { ToastProvider } from './components/ui/Toast';
import { getDevSession } from './services/devAuth';
import { dataStore } from './services/dataService';
import './styles/global.css';

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
    const devSession = getDevSession();
    if (devSession) {
      dispatch(setSession(devSession));
      dataStore.bootDev(devSession);
    } else {
      dispatch(clearSession());
    }
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
