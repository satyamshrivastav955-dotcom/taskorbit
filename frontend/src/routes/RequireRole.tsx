import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import type { Role } from '../types';

const home: Record<Role, string> = { client: '/client', manager: '/manager', assignee: '/assignee', reviewer: '/reviewer' };

export function RequireRole({ role }: { role: Role }): JSX.Element {
  const session = useAppSelector((s) => s.session);
  if (!session.ready) return <p>Loading…</p>;
  if (session.uid === '') return <Navigate to="/login" replace />;
  if (session.role !== role) return <Navigate to={home[session.role as Role] ?? '/login'} replace />;
  return <Outlet />;
}
