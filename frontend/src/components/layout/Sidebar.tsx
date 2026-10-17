import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Calendar,
  AlertTriangle,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  FileText,
  MessageSquare,
  TrendingUp,
  FileCheck,
  Layers,
  RotateCcw,
  X,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { Avatar } from '../ui/Avatar';
import { auth } from '../../services/firebase';
import { dataStore } from '../../services/demoData';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { clearSession } from '../../redux/sessionSlice';
import type { Role } from '../../types';
import styles from './Sidebar.module.css';

interface SidebarProps {
  role: Role;
  conflictCount?: number;
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ role, conflictCount, open = false, onClose }: SidebarProps): JSX.Element {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const session = useAppSelector((s) => s.session);
  const [, setTick] = useState(0);

  useEffect(() => dataStore.subscribe(() => setTick((t) => t + 1)), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent): void => { if (event.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const me = dataStore.getActiveUser();
  // Fallback chain: dataStore user -> Redux session -> placeholder
  // Prevents blank user card during the dataStore boot window.
  const displayName = me.uid !== '' ? (me.name !== '' ? me.name : me.email)
    : session.name !== '' ? session.name
    : session.email !== '' ? session.email
    : '';
  const displayEmail = me.uid !== '' ? me.email : session.email;
  // getNotifications() is already UID-scoped from the Firestore query.
  const unread = dataStore.getNotifications().filter((n) => !n.read).length;
  const conflicts = conflictCount ?? (role === 'manager' ? dataStore.getConflicts().length : 0);

  const roleNameMap: Record<Role, string> = {
    manager: 'Manager',
    client: 'Client',
    assignee: 'Assignee',
    reviewer: 'Reviewer',
  };

  async function handleLogout(): Promise<void> {
    await signOut(auth);
    dispatch(clearSession());
    navigate('/login');
  }

  return (
    <>
    {open && <button type="button" className={styles.navBackdrop} aria-label="Close navigation" onClick={onClose} />}
    <aside className={`${styles.sidebar} ${open ? styles.open : ''}`} aria-label="TaskOrbit workspace navigation" onClick={(event) => { if ((event.target as HTMLElement).closest('a')) onClose?.(); }}>
      <div className={styles.brand}>
        <div className={styles.logoIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#FFFFFF" strokeWidth="2.2" />
            <path d="M7 12A5 5 0 0 1 17 12" stroke="var(--primary-300)" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
          </svg>
        </div>
        <span className={styles.brandTitle}>TaskOrbit</span>
        <button type="button" className={styles.mobileClose} onClick={onClose} aria-label="Close navigation"><X size={19} /></button>
      </div>

      <div className={styles.userCardWrapper}>
        <button
          className={styles.userCard}
          type="button"
          onClick={() => navigate('/profile')}
          title="Open my profile"
          aria-label={`Open profile for ${displayName === '' ? displayEmail : displayName}`}
        >
          <Avatar name={displayName} size="md" />
          <div className={styles.userInfo}>
            <span className={styles.userName}>{displayName === '' ? displayEmail : displayName}</span>
            <span className={styles.userRole}>{roleNameMap[role]}</span>
          </div>
        </button>
      </div>

      <nav className={styles.nav} aria-label={`${roleNameMap[role]} workspace`}>
        {role === 'manager' && (
          <>
            <NavLink to="/manager" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/manager/projects" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <FolderKanban size={18} />
              <span>Projects</span>
            </NavLink>
            <NavLink to="/manager/tasks" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <CheckSquare size={18} />
              <span>Tasks</span>
            </NavLink>
            <NavLink to="/manager/team" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <Users size={18} />
              <span>Team</span>
            </NavLink>
            <NavLink to="/manager/timeline" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <Calendar size={18} />
              <span>Timeline</span>
            </NavLink>
            <NavLink to="/manager/conflicts" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <AlertTriangle size={18} />
              <span>Conflicts</span>
              {conflicts > 0 && <span className={styles.badgeDanger}>{conflicts}</span>}
            </NavLink>
            <NavLink to="/manager/reports" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <BarChart3 size={18} />
              <span>Reports</span>
            </NavLink>
          </>
        )}

        {role === 'client' && (
          <>
            <NavLink to="/client" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/client/projects" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <FolderKanban size={18} />
              <span>Projects</span>
            </NavLink>
            <NavLink to="/client/requirements" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <FileCheck size={18} />
              <span>Requirements</span>
            </NavLink>
            <NavLink to="/client/documents" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <FileText size={18} />
              <span>Documents</span>
            </NavLink>
            <NavLink to="/client/feedback" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <MessageSquare size={18} />
              <span>Feedback</span>
            </NavLink>
            <NavLink to="/client/progress" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <TrendingUp size={18} />
              <span>Progress</span>
            </NavLink>
          </>
        )}

        {role === 'assignee' && (
          <>
            <NavLink to="/assignee" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/assignee/tasks" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <CheckSquare size={18} />
              <span>My Tasks</span>
            </NavLink>
            <NavLink to="/assignee/revisions" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><RotateCcw size={18} /><span>Revisions</span></NavLink>
            <NavLink to="/assignee/history" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><Layers size={18} /><span>Work History</span></NavLink>
            <NavLink to="/assignee/timeline" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <Calendar size={18} />
              <span>Timeline</span>
            </NavLink>
            <NavLink to="/assignee/documents" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <FileText size={18} />
              <span>Documents</span>
            </NavLink>
          </>
        )}

        {role === 'reviewer' && (
          <>
            <NavLink to="/reviewer" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/reviewer/queue" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <CheckSquare size={18} />
              <span>Review Queue</span>
            </NavLink>
            <NavLink to="/reviewer/history" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <Layers size={18} />
              <span>My Reviews</span>
            </NavLink>
            <NavLink to="/reviewer/documents" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <FileText size={18} />
              <span>Documents</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className={styles.bottomNav}>
        <NavLink to="/notifications" className={({ isActive }) => `${styles.bottomNavItem} ${isActive ? styles.active : ''}`}>
          <Bell size={18} />
          <span>Notifications</span>
          {unread > 0 && <span className={styles.badgeDanger}>{unread}</span>}
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `${styles.bottomNavItem} ${isActive ? styles.active : ''}`}>
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
        <button type="button" className={styles.bottomNavItem} onClick={() => { void handleLogout(); }}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
    </>
  );
}
