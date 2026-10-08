import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, ChevronDown, User, Settings, LogOut, Menu } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { Avatar } from '../ui/Avatar';
import { auth } from '../../services/firebase';
import { dataStore } from '../../services/demoData';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { clearSession } from '../../redux/sessionSlice';
import type { Role } from '../../types';
import styles from './Topbar.module.css';

interface TopbarProps {
  role: Role;
  onOpenNavigation?: () => void;
  onOpenCreateModal?: () => void;
  createButtonLabel?: string;
}

interface SearchHit {
  kind: string;
  id: string;
  title: string;
  path: string;
}

export function Topbar({ role, onOpenNavigation, onOpenCreateModal, createButtonLabel }: TopbarProps): JSX.Element {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const session = useAppSelector((s) => s.session);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [, setTick] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => dataStore.subscribe(() => setTick((t) => t + 1)), []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') { setShowProfileMenu(false); setSearchOpen(false); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true); searchRef.current?.focus(); }
    };
    const outside = (event: PointerEvent): void => {
      if (!profileRef.current?.contains(event.target as Node)) setShowProfileMenu(false);
      if (!searchWrapperRef.current?.contains(event.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', outside); };
  }, []);

  const me = dataStore.getActiveUser();
  // Fallback chain: dataStore user -> Redux session -> loading placeholder
  // Prevents the blank white profile pill during the dataStore boot window.
  const displayName = me.uid !== '' ? (me.name !== '' ? me.name : me.email)
    : session.name !== '' ? session.name
    : session.email !== '' ? session.email
    : '';
  const displayEmail = me.uid !== '' ? me.email : session.email;
  // getNotifications() already returns only the current user's notifications
  // (Firestore query is uid-scoped), so no userId arg needed.
  const unreadCount = dataStore.getNotifications().filter((n) => !n.read).length;

  async function handleLogout(): Promise<void> {
    setShowProfileMenu(false);
    await signOut(auth);
    dispatch(clearSession());
    navigate('/login');
  }

  function taskPath(taskId: string): string {
    if (role === 'client') return `/client/projects/${dataStore.getTaskById(taskId)?.projectId ?? ''}`;
    if (role === 'manager') return `/manager/tasks/${taskId}`;
    if (role === 'assignee') return `/assignee/tasks/${taskId}`;
    return `/reviewer/reviews/${taskId}`;
  }

  function projectPath(projectId: string): string {
    if (role === 'manager') return `/manager/projects/${projectId}`;
    if (role === 'client') return `/client/projects/${projectId}`;
    if (role === 'assignee') return '/assignee/tasks';
    return '/reviewer/queue';
  }

  const q = searchQuery.trim().toLowerCase();
  const hits: SearchHit[] = q === '' ? [] : [
    ...dataStore.getProjects()
      .filter((p) => p.title.toLowerCase().includes(q))
      .slice(0, 4)
      .map((p) => ({ kind: 'Project', id: p.id, title: p.title, path: projectPath(p.id) })),
    ...dataStore.getTasks()
      .filter((t) => t.title.toLowerCase().includes(q))
      .slice(0, 6)
      .map((t) => ({ kind: 'Task', id: t.id, title: t.title, path: taskPath(t.id) })),
  ];

  const actionLabel = createButtonLabel
    ?? (role === 'manager' ? 'Create Task' : role === 'client' ? 'New Request' : null);

  return (
    <header className={styles.topbar}>
      <button type="button" className={`${styles.iconBtn} ${styles.mobileMenu}`} aria-label="Open navigation" onClick={onOpenNavigation}><Menu size={19} /></button>
      <div ref={searchWrapperRef} className={`${styles.searchWrapper} ${searchOpen ? styles.searchExpanded : ''}`} role="search" onClick={() => { setSearchOpen(true); searchRef.current?.focus(); }}>
        <Search size={16} className={styles.searchIcon} />
        <input
          ref={searchRef}
          type="search"
          className={styles.searchInput}
          onFocus={() => setSearchOpen(true)}
          placeholder="Search projects and tasks…"
          aria-label="Search projects and tasks"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchOpen && q !== '' && (
          <div className={styles.profileDropdown} role="listbox" aria-label="Search results">
            {hits.length === 0 && <div className={styles.dropdownHeader} style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>No matching projects or tasks.</div>}
            {hits.map((h) => (
              <button
                key={`${h.kind}-${h.id}`}
                className={styles.dropdownItem}
                role="option"
                onClick={(event) => { event.stopPropagation(); setSearchOpen(false); setSearchQuery(''); navigate(h.path); }}
              >
                <span>{h.kind}: {h.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        {actionLabel !== null && actionLabel.trim() !== '' && (
          <button type="button" className={styles.createBtn} onClick={onOpenCreateModal}>
            <Plus size={16} />
            <span>{actionLabel}</span>
          </button>
        )}

        <button type="button" className={styles.iconBtn} onClick={() => navigate('/notifications')} title="Notifications" aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}>
          <Bell size={18} />
          {unreadCount > 0 && <span className={styles.unreadDot} />}
        </button>

        <div ref={profileRef} className={styles.profileWrapper}>
          <button
            type="button"
            className={styles.profilePill}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-label="Account menu"
            aria-haspopup="menu"
            aria-expanded={showProfileMenu}
          >
            <Avatar name={displayName === '' ? displayEmail : displayName} size="sm" />
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{displayName === '' ? displayEmail : displayName}</span>
              <span className={styles.profileRole}>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
            </div>
            <ChevronDown size={14} className={styles.profileChevron} />
          </button>

          {showProfileMenu && (
            <div className={styles.profileDropdown} role="menu" aria-label="Account">
              <div className={styles.dropdownHeader}>
                <div className={styles.dropdownName}>{displayName === '' ? displayEmail : displayName}</div>
                <div className={styles.dropdownEmail}>{displayEmail}</div>
              </div>
              <div className={styles.dropdownDivider} />
              <button
                type="button"
                className={styles.dropdownItem}
                role="menuitem"
                onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
              >
                <User size={15} />
                <span>My Profile</span>
              </button>
              <button
                type="button"
                className={styles.dropdownItem}
                role="menuitem"
                onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
              >
                <Settings size={15} />
                <span>Settings</span>
              </button>
              <div className={styles.dropdownDivider} />
              <button type="button" className={`${styles.dropdownItem} ${styles.logoutItem}`} role="menuitem" onClick={() => { void handleLogout(); }}>
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
