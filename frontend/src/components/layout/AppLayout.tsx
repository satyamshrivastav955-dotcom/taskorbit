import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastProvider } from '../ui/Toast';
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
    <ToastProvider>
      <div className={styles.shell}>
        {/* Left Sidebar */}
        <Sidebar role={role} conflictCount={count} />

        {/* Main Content Viewport */}
        <div className={styles.main}>
          <Topbar
            role={role}
            onOpenCreateModal={handleOpenCreate}
            createButtonLabel={createButtonLabel}
          />
          <main className={styles.content}>{children}</main>
        </div>

        {/* Global Modals */}
        {showCreateTask && (
          <CreateTaskModal onClose={() => setShowCreateTask(false)} />
        )}
        {showCreateProject && (
          <CreateProjectModal onClose={() => setShowCreateProject(false)} />
        )}
      </div>
    </ToastProvider>
  );
}

export function PageContainer({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className={styles.page}>{children}</div>;
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
