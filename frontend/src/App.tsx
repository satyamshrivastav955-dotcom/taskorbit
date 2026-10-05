import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Provider } from 'react-redux';
import { auth, db } from './services/firebase';
import { store } from './redux/store';
import { useAppDispatch } from './redux/hooks';
import { setSession, clearSession } from './redux/sessionSlice';
import { AppRoutes } from './pages/AppRoutes';
import type { Role } from './types';
import './styles/global.css';

const VALID_ROLES: Role[] = ['client', 'manager', 'assignee', 'reviewer'];

function SessionGate({ children }: { children: React.ReactNode }): JSX.Element {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
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
              if (role === '') role = data.role ?? '';
              name = data.name ?? name;
            }
          } catch {
            // Firestore read failed (rules/offline). Fall through with claim role.
          }
          if (!VALID_ROLES.includes(role as Role)) {
            dispatch(clearSession());
            await auth.signOut();
            return;
          }
          dispatch(setSession({ uid: user.uid, email: user.email ?? '', name, role: role as Role }));
        } catch {
          dispatch(clearSession());
        }
      })();
    });
    return unsub;
  }, [dispatch]);
  return <>{children}</>;
}

export function App(): JSX.Element {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <SessionGate>
          <AppRoutes />
        </SessionGate>
      </BrowserRouter>
    </Provider>
  );
}
