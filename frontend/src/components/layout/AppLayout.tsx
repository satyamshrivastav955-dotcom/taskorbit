import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CreateTaskModal } from '../modals/CreateTaskModal';
import { CreateProjectModal } from '../modals/CreateProjectModal';
import { dataStore } from '../../services/demoData';
import type { Role } from '../../types';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  role: Role;
  breadcrumb?: string;
  children: React.ReactNode;
  conflictCount?: number;
  createButtonLabel?: string;
}

export function AppLayout({
  role,
  breadcrumb,
  children,
  conflictCount,
  createButtonLabel,
}: AppLayoutProps): JSX.Element {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);

  // Dynamic conflicts count
  const activeConflicts = dataStore.getConflicts().length;
  const count = conflictCount !== undefined ? conflictCount : activeConflicts;

  const handleOpenCreate = () => {
    if (role === 'manager') {
      setShowCreateTask(true);
    } else if (role === 'client') {
      setShowCreateProject(true);
    }
  };

  return (
      <div className={styles.shell}>
        {/* Left Sidebar */}
        <a className={styles.skipLink} href="#workspace-content">Skip to workspace</a>
        <Sidebar role={role} conflictCount={count} open={navigationOpen} onClose={() => setNavigationOpen(false)} />

        {/* Main Content Viewport */}
        <div className={styles.main}>
          <Topbar
            role={role}
            onOpenNavigation={() => setNavigationOpen(true)}
            onOpenCreateModal={handleOpenCreate}
            createButtonLabel={createButtonLabel}
          />
          <main id="workspace-content" tabIndex={-1} className={styles.content}>{children}</main>
        </div>

        {/* Global Modals */}
        {showCreateTask && (
          <CreateTaskModal onClose={() => setShowCreateTask(false)} />
        )}
        {showCreateProject && (
          <CreateProjectModal onClose={() => setShowCreateProject(false)} />
        )}
      </div>
  );
}

export function PageContainer({ children }: { children: React.ReactNode }): JSX.Element {
  const { pathname } = useLocation();
  return <div key={pathname} className={styles.page}>{children}</div>;
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}): JSX.Element {
  return (
    <div className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        {description && <p className={styles.pageDesc}>{description}</p>}
      </div>
      {action && <div className={styles.pageActions}>{action}</div>}
    </div>
  );
}
