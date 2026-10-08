import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FolderKanban,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  MoreVertical,
  Calendar,
  Clock,
  Edit2,
  CheckCircle2,
  Inbox,
  Loader2,
} from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Avatar, AvatarGroup } from '../../components/ui/Avatar';
import { dataStore } from '../../services/demoData';
import styles from './Projects.module.css';

export function ManagerProjects(): JSX.Element {
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'submitted' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [sideTab, setSideTab] = useState<'overview' | 'tasks' | 'team' | 'activity'>('overview');
  const [sortBy, setSortBy] = useState<'deadline' | 'progress'>('deadline');

  useEffect(() => {
    return dataStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const projects = dataStore.getProjects();
  const users = dataStore.getUsers();
  const tasks = dataStore.getTasks();
  const activities = dataStore.getActivities();
  const loading = dataStore.isLoading();
  const error = dataStore.getError();

  // Counts
  const activeCount = projects.filter((p) => p.status === 'on_track' || p.status === 'active').length;
  const submittedCount = projects.filter((p) => p.status === 'submitted' || p.status === 'draft').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.clientName || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTab === 'active') return p.status === 'on_track' || p.status === 'active';
    if (filterTab === 'submitted') return p.status === 'submitted' || p.status === 'draft';
    if (filterTab === 'completed') return p.status === 'completed';
    return true;
  });

  const orderedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'progress') return b.progress - a.progress;
    return a.deadline.localeCompare(b.deadline);
  });
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const projectTasks = tasks.filter((t) => t.projectId === selectedProject?.id);
  const projectTeam = (selectedProject?.teamIds || [])
    .map((uid) => users.find((u) => u.uid === uid))
    .filter(Boolean) as { name: string; avatar?: string; jobTitle?: string }[];
  const projectActivities = activities.filter((a) => a.projectId === selectedProject?.id).slice(0, 4);

  return (
    <AppLayout role="manager">
      <PageContainer>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Projects</h1>
            <p className={styles.subtitle}>
              Manage and track all your assigned projects in one place.
            </p>
          </div>
          <button
            className={styles.newProjectBtn}
            onClick={() => setFilterTab('submitted')}
          >
            <Inbox size={16} />
            <span>Review requests</span>
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className={styles.topControlRow}>
          {/* Pills */}
          <div className={styles.filterPills}>
            <button
              className={`${styles.pillBtn} ${filterTab === 'all' ? styles.activePill : ''}`}
              onClick={() => setFilterTab('all')}
            >
              All Projects <span className={styles.pillCount}>{projects.length}</span>
            </button>
            <button
              className={`${styles.pillBtn} ${filterTab === 'active' ? styles.activePill : ''}`}
              onClick={() => setFilterTab('active')}
            >
              Active <span className={styles.pillCount}>{activeCount}</span>
            </button>
            <button
              className={`${styles.pillBtn} ${filterTab === 'submitted' ? styles.activePill : ''}`}
              onClick={() => setFilterTab('submitted')}
            >
              Needs review <span className={styles.pillCount}>{submittedCount}</span>
            </button>
            <button
              className={`${styles.pillBtn} ${filterTab === 'completed' ? styles.activePill : ''}`}
              onClick={() => setFilterTab('completed')}
            >
              Completed <span className={styles.pillCount}>{completedCount}</span>
            </button>
          </div>

          {/* Search & Actions */}
          <div className={styles.searchAndSort}>
            <div className={styles.searchBox}>
              <Search size={14} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              className={styles.sortBtn}
              onClick={() => setSortBy((current) => current === 'deadline' ? 'progress' : 'deadline')}
              aria-label={`Sort projects by ${sortBy === 'deadline' ? 'progress' : 'deadline'}`}
            >
              <span>{sortBy === 'deadline' ? 'By deadline' : 'By progress'}</span>
              <ArrowUpDown size={14} aria-hidden="true" />
            </button>
            <button
              className={styles.filterBtn}
              onClick={() => { setSearchQuery(''); setFilterTab('all'); }}
              aria-label="Clear project filters"
            >
              <Filter size={14} aria-hidden="true" />
              <span>Clear filters</span>
            </button>
          </div>
        </div>

        {/* Two-Column Layout matching Reference Image 13 */}
        <div className={styles.projectsLayout}>
          {/* Projects List (Left Column) */}
          <div className={styles.listCard}>
            <div className={styles.projectList}>
              {loading && projects.length === 0 ? (
                <div className={styles.emptyState} role="status">
                  <Loader2 size={28} color="var(--primary)" className={styles.spinner} aria-hidden="true" />
                  <p>Loading projects…</p>
                </div>
              ) : error !== '' && projects.length === 0 ? (
                <div className={styles.emptyState} role="alert">
                  <p>Projects unavailable</p>
                  <span>{error}</span>
                </div>
              ) : orderedProjects.length === 0 ? (
                <div className={styles.emptyState}>
                  <Inbox size={28} color="var(--text-muted)" aria-hidden="true" />
                  <p>{projects.length === 0 ? 'No projects yet' : 'No matching projects'}</p>
                  <span>{projects.length === 0 ? 'Create a project to begin tracking delivery.' : 'Try clearing the current filters.'}</span>
                </div>
              ) : orderedProjects.map((p) => {
                const team = (p.teamIds || [])
                  .map((uid) => users.find((u) => u.uid === uid))
                  .filter(Boolean) as { name: string; avatar?: string }[];
                const isSelected = p.id === selectedProjectId;

                return (
                  <div
                    key={p.id}
                    className={`${styles.projectCardItem} ${isSelected ? styles.selectedProjectItem : ''}`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedProjectId(p.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedProjectId(p.id);
                      }
                    }}
                  >
                    <div className={styles.projectCardIcon}>
                      <FolderKanban size={18} color="var(--primary)" />
                    </div>

                    <div className={styles.projectCardInfo}>
                      <div className={styles.projectCardTitle}>{p.title}</div>
                      <div className={styles.projectCardClient}>{p.clientName}</div>
                    </div>

                    <div className={styles.projectCardProgress}>
                      <div className={styles.progressNum}>{p.progress}%</div>
                      <div style={{ width: '90px' }}>
                        <ProgressBar value={p.progress} height={6} />
                      </div>
                    </div>

                    <div className={styles.projectCardFraction}>
                       {p.tasksCompleted ?? 0} / {p.totalTasks ?? 0} tasks
                    </div>

                    <div className={styles.projectCardDate}>{p.deadline}</div>

                    <div>
                      <StatusBadge status={p.status} size="sm" />
                    </div>

                    <AvatarGroup users={team} max={3} size="sm" />

                    <button
                      className={styles.moreBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/manager/projects/${p.id}`);
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className={styles.paginationFooter}>
              <span className={styles.showingText}>
                Showing {orderedProjects.length} of {projects.length} projects
              </span>
            </div>
          </div>

          {/* Project Details Panel (Right Column) */}
          {selectedProject && (
            <div className={styles.detailCard}>
              <div className={styles.detailHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className={styles.detailIcon}>
                    <FolderKanban size={22} color="var(--primary)" />
                  </div>
                  <div>
                    <h3 className={styles.detailTitle}>{selectedProject.title}</h3>
                    <div className={styles.detailClient}>{selectedProject.clientName}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className={styles.editBtn}
                    onClick={() => navigate(`/manager/projects/${selectedProject.id}`)}
                  >
                    <Edit2 size={14} />
                    <span>View Project</span>
                  </button>
                </div>
              </div>

              {/* Detail Tabs */}
              <div className={styles.detailTabs}>
                {(['overview', 'tasks', 'team', 'activity'] as const).map((tab) => (
                  <button
                    key={tab}
                    className={`${styles.detailTabBtn} ${sideTab === tab ? styles.activeDetailTab : ''}`}
                    onClick={() => setSideTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {sideTab === 'overview' && (
                <div className={styles.overviewBody}>
                  <div className={styles.descBox}>{selectedProject.description}</div>

                  <div className={styles.metaGrid}>
                    <div className={styles.metaItem}>
                      <div className={styles.metaLabel}>Start Date</div>
                      <div className={styles.metaValue}>
                        <Calendar size={13} />
                        <span>{selectedProject.startDate}</span>
                      </div>
                    </div>
                    <div className={styles.metaItem}>
                      <div className={styles.metaLabel}>End Date</div>
                      <div className={styles.metaValue}>
                        <Calendar size={13} />
                        <span>{selectedProject.deadline}</span>
                      </div>
                    </div>
                    <div className={styles.metaItem}>
                      <div className={styles.metaLabel}>Status</div>
                      <StatusBadge status={selectedProject.status} size="sm" />
                    </div>
                    <div className={styles.metaItem}>
                      <div className={styles.metaLabel}>Priority</div>
                      <PriorityBadge priority={selectedProject.priority} size="sm" />
                    </div>
                  </div>

                  <div className={styles.progressSection}>
                    <div className={styles.progressHeaderRow}>
                      <span className={styles.progressBig}>{selectedProject.progress}%</span>
                      <span className={styles.progressTasks}>
                         {selectedProject.tasksCompleted ?? 0} of {selectedProject.totalTasks ?? 0} tasks completed
                      </span>
                    </div>
                    <ProgressBar value={selectedProject.progress} height={8} />
                  </div>

                  <div className={styles.teamSection}>
                    <div className={styles.sectionHeaderRow}>
                      <span className={styles.sectionHeading}>Team Members</span>
                      <button
                        className={styles.sectionLink}
                        onClick={() => navigate('/manager/team')}
                      >
                        View team →
                      </button>
                    </div>
                    <div className={styles.teamAvatars}>
                      <AvatarGroup users={projectTeam} max={5} size="md" />
                    </div>
                  </div>

                  <div className={styles.activitySection}>
                    <div className={styles.sectionHeaderRow}>
                      <span className={styles.sectionHeading}>Recent Activity</span>
                      <button
                        className={styles.sectionLink}
                        onClick={() => navigate(`/manager/projects/${selectedProject.id}`)}
                      >
                        View all →
                      </button>
                    </div>
                    <div className={styles.activityList}>
                      {projectActivities.map((act) => (
                        <div key={act.id} className={styles.activityMiniItem}>
                          <Avatar name={act.actorName} src={act.actorAvatar} size="sm" />
                          <div className={styles.activityMiniText}>
                            <strong>{act.actorName}</strong> {act.description}
                          </div>
                          <div className={styles.activityMiniTime}>{act.timeAgo}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {sideTab === 'tasks' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {projectTasks.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        padding: '10px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/manager/tasks/${t.id}`)}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{t.title}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Due {t.deadline}</div>
                      </div>
                      <StatusBadge status={t.status} size="sm" />
                    </div>
                  ))}
                </div>
              )}

              {sideTab === 'team' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {projectTeam.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    >
                      <Avatar name={m.name} src={m.avatar} size="md" />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{m.name}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{m.jobTitle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sideTab === 'activity' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {projectActivities.map((act) => (
                    <div key={act.id} className={styles.activityMiniItem}>
                      <Avatar name={act.actorName} src={act.actorAvatar} size="sm" />
                      <div className={styles.activityMiniText}>
                        <strong>{act.actorName}</strong> {act.description}
                      </div>
                      <div className={styles.activityMiniTime}>{act.timeAgo}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </PageContainer>
    </AppLayout>
  );
}
