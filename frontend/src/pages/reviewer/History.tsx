import { useEffect, useState } from 'react';
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
  const [, setTick] = useState(0);
  useEffect(() => dataStore.subscribe(() => setTick((value) => value + 1)), []);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'approved' | 'revision'>('all');

  // Filter tasks that have review activity (approved or revision)
  const myReviews = dataStore.getReviews().filter((review) => review.reviewerId === dataStore.getActiveUser().uid);
  const reviewedTasks = allTasks.filter((task: Task) => myReviews.some((review) => review.taskId === task.id));
  const turnaroundHours = myReviews
    .map((review) => {
      const submission = dataStore.getSubmissions(review.taskId).find((item) => item.id === review.submissionId);
      if (!submission) return null;
      const hours = (new Date(review.createdAt).getTime() - new Date(submission.submittedAt).getTime()) / 3600000;
      return Number.isFinite(hours) && hours >= 0 ? hours : null;
    })
    .filter((hours): hours is number => hours !== null);
  const averageTurnaroundHours = turnaroundHours.length === 0
    ? null
    : Math.round((turnaroundHours.reduce((total, hours) => total + hours, 0) / turnaroundHours.length) * 10) / 10;

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
            value={reviewedTasks.length}
            change={reviewedTasks.length > 0 ? `${reviewedTasks.length} total logged` : 'No reviews yet'}
            trend="neutral"
            icon={<Layers size={20} />}
          />
          <StatCard
            label="Approved Deliverables"
            value={approvedCount}
            change={reviewedTasks.length > 0 ? `${Math.round((approvedCount / reviewedTasks.length) * 100)}% approval rate` : '0% approval rate'}
            trend="up"
            icon={<CheckCircle2 size={20} />}
          />
          <StatCard
            label="Revisions Requested"
            value={revisionCount}
            change={reviewedTasks.length > 0 ? `${Math.round((revisionCount / reviewedTasks.length) * 100)}% revision rate` : '0% revision rate'}
            trend={revisionCount > 0 ? 'down' : 'neutral'}
            icon={<AlertCircle size={20} />}
          />
          <StatCard
            label="Average Review Turnaround"
             value={averageTurnaroundHours === null ? '—' : `${averageTurnaroundHours}h`}
             change={averageTurnaroundHours === null ? 'No timestamp pair recorded' : 'Average submission to decision'}
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
                           <span className={styles.projectName}>{project?.title || '—'}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.assigneeCell}>
                          <Avatar name={assignee?.name} src={assignee?.avatar} size="sm" />
                          <span className={styles.assigneeName}>{assignee?.name || '—'}</span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={task.status} />
                      </td>
                      <td>
                        <div className={styles.dateCell}>
                          <Calendar size={13} />
                          <span>{task.updatedAt ? task.updatedAt.slice(0, 10) : '—'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.notesCell}>
                           {myReviews.find((review) => review.taskId === task.id)?.comments || 'No review comments recorded.'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={styles.reviewBtn}
                          onClick={() => navigate(`/reviewer/reviews/${task.id}`)}
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
