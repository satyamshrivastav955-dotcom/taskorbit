import React, { useState } from 'react';
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
  HelpCircle,
  LogOut,
  FileText,
  MessageSquare,
  TrendingUp,
  FileCheck,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { dataStore } from '../../services/demoData';
import { useAppDispatch } from '../../redux/hooks';
import { setSession, clearSession } from '../../redux/sessionSlice';
import type { Role } from '../../types';
import styles from './Sidebar.module.css';

interface SidebarProps {
  role: Role;
  conflictCount?: number;
}

export function Sidebar({ role, conflictCount = 3 }: SidebarProps): JSX.Element {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const activeUser = dataStore.getActiveUser();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const handleRoleSwitch = (newRole: Role) => {
    // Find representative user for this role
    const users = dataStore.getUsers();
    const targetUser = users.find((u) => u.role === newRole) || users[0];
    dataStore.setActiveUser(targetUser.uid);
    dispatch(
      setSession({
        uid: targetUser.uid,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role,
      })
    );
    setShowRoleSwitcher(false);
    navigate(`/${newRole}`);
  };

  const handleLogout = () => {
    dispatch(clearSession());
    navigate('/login');
  };

  const roleNameMap: Record<Role, string> = {
    manager: 'Manager',
    client: 'Client',
    assignee: 'Assignee',
    reviewer: 'Reviewer',
  };

  return (
    <aside className={styles.sidebar}>
      {/* Top Logo */}
      <div className={styles.brand}>
        <div className={styles.logoIcon}>
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
        <span className={styles.brandTitle}>TaskOrbit</span>
      </div>

      {/* User Card Pill */}
      <div className={styles.userCardWrapper}>
        <div
          className={styles.userCard}
          onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
          title="Click to switch role"
        >
          <Avatar name={activeUser.name} src={activeUser.avatar} size="md" />
          <div className={styles.userInfo}>
            <span className={styles.userName}>{activeUser.name}</span>
            <span className={styles.userRole}>{roleNameMap[role]}</span>
          </div>
          <ChevronDown size={14} className={styles.roleChevron} />
        </div>

        {/* Role Quick Switcher Dropdown */}
        {showRoleSwitcher && (
          <div className={styles.roleDropdown}>
            <div className={styles.roleDropdownHeader}>Switch Role View</div>
            {(['manager', 'client', 'assignee', 'reviewer'] as Role[]).map((r) => (
              <button
                key={r}
                className={`${styles.roleOption} ${role === r ? styles.activeRoleOption : ''}`}
                onClick={() => handleRoleSwitch(r)}
              >
                <span>{roleNameMap[r]}</span>
                {role === r && <span className={styles.activeCheck}>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className={styles.nav}>
        {role === 'manager' && (
          <>
            <NavLink
              to="/manager"
              end
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/manager/projects"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <FolderKanban size={18} />
              <span>Projects</span>
            </NavLink>
            <NavLink
              to="/manager/tasks"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <CheckSquare size={18} />
              <span>Tasks</span>
            </NavLink>
            <NavLink
              to="/manager/team"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Users size={18} />
              <span>Team</span>
            </NavLink>
            <NavLink
              to="/manager/timeline"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Calendar size={18} />
              <span>Timeline</span>
            </NavLink>
            <NavLink
              to="/manager/conflicts"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <AlertTriangle size={18} />
              <span>Conflicts</span>
              {conflictCount > 0 && <span className={styles.badgeDanger}>{conflictCount}</span>}
            </NavLink>
            <NavLink
              to="/manager/reports"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <BarChart3 size={18} />
              <span>Reports</span>
            </NavLink>
          </>
        )}

        {role === 'client' && (
          <>
            <NavLink
              to="/client"
              end
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/client/projects"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <FolderKanban size={18} />
              <span>Projects</span>
            </NavLink>
            <NavLink
              to="/client/requirements"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <FileCheck size={18} />
              <span>Requirements</span>
            </NavLink>
            <NavLink
              to="/client/documents"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <FileText size={18} />
              <span>Documents</span>
            </NavLink>
            <NavLink
              to="/client/feedback"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <MessageSquare size={18} />
              <span>Feedback</span>
            </NavLink>
            <NavLink
              to="/client/progress"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <TrendingUp size={18} />
              <span>Progress</span>
            </NavLink>
          </>
        )}

        {role === 'assignee' && (
          <>
            <NavLink
              to="/assignee"
              end
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/assignee/tasks"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <CheckSquare size={18} />
              <span>My Tasks</span>
            </NavLink>
            <NavLink
              to="/assignee/timeline"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Calendar size={18} />
              <span>Timeline</span>
            </NavLink>
            <NavLink
              to="/assignee/documents"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <FileText size={18} />
              <span>Documents</span>
            </NavLink>
          </>
        )}

        {role === 'reviewer' && (
          <>
            <NavLink
              to="/reviewer"
              end
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/reviewer/queue"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <CheckSquare size={18} />
              <span>Review Queue</span>
            </NavLink>
            <NavLink
              to="/reviewer/history"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Layers size={18} />
              <span>My Reviews</span>
            </NavLink>
            <NavLink
              to="/reviewer/documents"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <FileText size={18} />
              <span>Documents</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Plan Assign Deliver Card */}
      <div className={styles.promoCard}>
        <div className={styles.promoSphere} />
        <div className={styles.promoContent}>
          <div className={styles.promoHeading}>
            <span>Plan</span>
            <span>Assign</span>
            <span className={styles.highlight}>Deliver</span>
          </div>
          <p className={styles.promoDesc}>
            Keep your projects on track with smart tools and real-time insights.
          </p>
        </div>
      </div>

      {/* Bottom Utility Menu */}
      <div className={styles.bottomNav}>
        <NavLink
          to="/notifications"
          className={({ isActive }) => `${styles.bottomNavItem} ${isActive ? styles.active : ''}`}
        >
          <Bell size={18} />
          <span>Notifications</span>
          <span className={styles.badgeDanger}>5</span>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) => `${styles.bottomNavItem} ${isActive ? styles.active : ''}`}
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
        <button
          className={styles.bottomNavItem}
          onClick={() => alert('TaskOrbit Help & Documentation')}
        >
          <HelpCircle size={18} />
          <span>Help</span>
        </button>
        <button className={styles.bottomNavItem} onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
