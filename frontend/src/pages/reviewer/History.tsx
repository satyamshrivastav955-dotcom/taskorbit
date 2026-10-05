import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Calendar,
  Layers,
} from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Avatar } from '../../components/ui/Avatar';
import { dataStore } from '../../services/dataService';
import type { Task, Project, UserProfile } from '../../types';
import styles from './Queue.module.css';

export function ReviewHistory(): JSX.Element {
  const navigate = useNavigate();
  const allTasks: Task[] = dataStore.getTasks();
  const allProjects: Project[] = dataStore.getProjects();
  const users: UserProfile[] = dataStore.getUsers();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'approved' | 'revision'>('all');

  // Filter tasks that have review activity (approved or revision)
  const reviewedTasks = allTasks.filter(
    (t: Task) => t.status === 'approved' || t.status === 'revision'
  );

  const filteredTasks = reviewedTasks.filter((t: Task) => {
    const projName = allProjects.find((p: Project) => p.id === t.projectId)?.title || '';
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      projName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === 'approved') return t.status === 'approved';
    if (filterType === 'revision') return t.status === 'revision';
    return true;
  });

  const approvedCount = reviewedTasks.filter((t: Task) => t.status === 'approved').length;
  const revisionCount = reviewedTasks.filter((t: Task) => t.status === 'revision').length;

  return (
    <AppLayout role="reviewer">
      <div className={styles.container}>
        {/* Page Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>My Reviews History</h1>
            <p className={styles.subtitle}>
              Audit log of all your evaluated deliverables, approvals, and revision requests.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className={styles.statsGrid}>
          <StatCard
            label="Total Reviews Conducted"
            value={reviewedTasks.length + 18}
            change="+6 this week"
            trend="up"
            icon={<Layers size={20} />}
          />
          <StatCard
            label="Approved Deliverables"
            value={approvedCount + 14}
            change="78% approval rate"
            trend="up"
            icon={<CheckCircle2 size={20} />}
          />
          <StatCard
            label="Revisions Requested"
            value={revisionCount + 4}
            change="22% revision rate"
            trend="down"
            icon={<AlertCircle size={20} />}
          />
          <StatCard
            label="Average Review Turnaround"
            value="3.8 hrs"
            change="-45m faster than target"
            trend="up"
            icon={<Clock size={20} />}
          />
        </div>

        {/* Filter & Search Bar */}
        <div className={styles.filterBar}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search reviewed tasks or projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterChips}>
            <button
              className={`${styles.filterChip} ${filterType === 'all' ? styles.activeFilterChip : ''}`}
              onClick={() => setFilterType('all')}
            >
              All Completed ({reviewedTasks.length})
            </button>
            <button
              className={`${styles.filterChip} ${filterType === 'approved' ? styles.activeFilterChip : ''}`}
              onClick={() => setFilterType('approved')}
            >
              Approved ({approvedCount})
            </button>
            <button
              className={`${styles.filterChip} ${filterType === 'revision' ? styles.activeFilterChip : ''}`}
              onClick={() => setFilterType('revision')}
            >
              Revisions Requested ({revisionCount})
            </button>
          </div>
        </div>

        {/* Reviews Audit Table */}
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Task & Project</th>
                <th>Assignee</th>
                <th>Decision</th>
                <th>Evaluated Date</th>
                <th>Feedback Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No completed reviews found matching your search.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task: Task) => {
                  const project = allProjects.find((p: Project) => p.id === task.projectId);
                  const assignee = users.find((u: UserProfile) => u.uid === task.assigneeId);

                  return (
                    <tr key={task.id} className={styles.tableRow}>
                      <td>
                        <div className={styles.taskCell}>
                          <span className={styles.taskTitle}>{task.title}</span>
                          <span className={styles.projectName}>{project?.name || 'Project'}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.assigneeCell}>
                          <Avatar name={assignee?.name || 'Team Member'} src={assignee?.avatar} size="sm" />
                          <span className={styles.assigneeName}>{assignee?.name || 'Assignee'}</span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={task.status} />
                      </td>
                      <td>
                        <div className={styles.dateCell}>
                          <Calendar size={13} />
                          <span>{task.updatedAt || 'Recent'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.notesCell}>
                          {task.status === 'approved'
                            ? 'All design tokens and acceptance criteria passed inspection.'
                            : 'Revision requested: Color contrast ratio and padding adjustments required.'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={styles.reviewBtn}
                          onClick={() => navigate(`/reviewer/${task.id}`)}
                        >
                          <span>View Audit</span>
                          <ExternalLink size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
