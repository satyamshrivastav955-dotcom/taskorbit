import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, ChevronDown, User, Settings, LogOut, CheckCircle2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { dataStore } from '../../services/demoData';
import { useAppDispatch } from '../../redux/hooks';
import { clearSession } from '../../redux/sessionSlice';
import type { Role } from '../../types';
import styles from './Topbar.module.css';

interface TopbarProps {
  role: Role;
  onOpenCreateModal?: () => void;
  createButtonLabel?: string;
}

export function Topbar({
  role,
  onOpenCreateModal,
  createButtonLabel,
}: TopbarProps): JSX.Element {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const activeUser = dataStore.getActiveUser();
  const unreadCount = dataStore.getNotifications().filter((n) => !n.read).length;

  const handleLogout = () => {
    dispatch(clearSession());
    navigate('/login');
  };

  const getActionLabel = () => {
    if (createButtonLabel) return createButtonLabel;
    if (role === 'manager') return 'Create Task';
    if (role === 'client') return 'New Request';
    return null;
  };

  const actionLabel = getActionLabel();

  return (
    <header className={styles.topbar}>
      {/* Global Search Bar */}
      <div className={styles.searchWrapper}>
        <Search size={16} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search projects, tasks, people..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Right Controls */}
      <div className={styles.actions}>
        {/* Create Action Button (if applicable for role) */}
        {actionLabel && (
          <button
            className={styles.createBtn}
            onClick={onOpenCreateModal}
          >
            <Plus size={16} />
            <span>{actionLabel}</span>
          </button>
        )}

        {/* Notifications Icon with Red Dot */}
        <button
          className={styles.iconBtn}
          onClick={() => navigate('/notifications')}
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className={styles.unreadDot} />}
        </button>

        {/* User Profile Pill & Dropdown */}
        <div className={styles.profileWrapper}>
          <div
            className={styles.profilePill}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <Avatar name={activeUser.name} src={activeUser.avatar} size="sm" />
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{activeUser.name}</span>
              <span className={styles.profileRole}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            </div>
            <ChevronDown size={14} className={styles.profileChevron} />
          </div>

          {showProfileMenu && (
            <div className={styles.profileDropdown}>
              <div className={styles.dropdownHeader}>
                <div className={styles.dropdownName}>{activeUser.name}</div>
                <div className={styles.dropdownEmail}>{activeUser.email}</div>
              </div>
              <div className={styles.dropdownDivider} />
              <button
                className={styles.dropdownItem}
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/profile');
                }}
              >
                <User size={15} />
                <span>My Profile</span>
              </button>
              <button
                className={styles.dropdownItem}
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/settings');
                }}
              >
                <Settings size={15} />
                <span>Settings</span>
              </button>
              <button
                className={styles.dropdownItem}
                onClick={() => {
                  dataStore.resetToDefault();
                  alert('Demo database reset to initial state!');
                  setShowProfileMenu(false);
                  window.location.reload();
                }}
              >
                <CheckCircle2 size={15} />
                <span>Reset Demo Data</span>
              </button>
              <div className={styles.dropdownDivider} />
              <button className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>
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
