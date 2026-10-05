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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Avatar, AvatarGroup } from '../../components/ui/Avatar';
import { CreateProjectModal } from '../../components/modals/CreateProjectModal';
import { dataStore } from '../../services/demoData';
import styles from './Projects.module.css';

export function ManagerProjects(): JSX.Element {
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'at_risk' | 'delayed' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-1');
  const [sideTab, setSideTab] = useState<'overview' | 'tasks' | 'team' | 'activity'>('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    return dataStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const projects = dataStore.getProjects();
  const users = dataStore.getUsers();
  const tasks = dataStore.getTasks();
  const activities = dataStore.getActivities();

  // Counts
  const activeCount = projects.filter((p) => p.status === 'on_track' || p.status === 'active').length;
  const atRiskCount = projects.filter((p) => p.status === 'at_risk').length;
  const delayedCount = projects.filter((p) => p.status === 'delayed').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.clientName || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTab === 'active') return p.status === 'on_track' || p.status === 'active';
    if (filterTab === 'at_risk') return p.status === 'at_risk';
    if (filterTab === 'delayed') return p.status === 'delayed';
    if (filterTab === 'completed') return p.status === 'completed';
    return true;
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
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} />
            <span>New Project</span>
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
              className={`${styles.pillBtn} ${filterTab === 'at_risk' ? styles.activePill : ''}`}
              onClick={() => setFilterTab('at_risk')}
            >
              At Risk <span className={styles.pillCount}>{atRiskCount}</span>
            </button>
            <button
              className={`${styles.pillBtn} ${filterTab === 'delayed' ? styles.activePill : ''}`}
              onClick={() => setFilterTab('delayed')}
            >
              Delayed <span className={styles.pillCount}>{delayedCount}</span>
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
            <button className={styles.sortBtn}>
              <span>Sort by</span>
              <ArrowUpDown size={14} />
            </button>
            <button className={styles.filterBtn}>
              <Filter size={14} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Two-Column Layout matching Reference Image 13 */}
        <div className={styles.projectsLayout}>
          {/* Projects List (Left Column) */}
          <div className={styles.listCard}>
            <div className={styles.projectList}>
              {filteredProjects.map((p) => {
                const team = (p.teamIds || [])
                  .map((uid) => users.find((u) => u.uid === uid))
                  .filter(Boolean) as { name: string; avatar?: string }[];
                const isSelected = p.id === selectedProjectId;

                return (
                  <div
                    key={p.id}
                    className={`${styles.projectCardItem} ${isSelected ? styles.selectedProjectItem : ''}`}
                    onClick={() => setSelectedProjectId(p.id)}
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
                      {p.tasksCompleted ?? 12} / {p.totalTasks ?? 17} tasks
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

            {/* Pagination footer */}
            <div className={styles.paginationFooter}>
              <button className={styles.pageArrow}>
                <ChevronLeft size={16} />
              </button>
              <button className={`${styles.pageNum} ${styles.activePageNum}`}>1</button>
              <button className={styles.pageNum}>2</button>
              <button className={styles.pageArrow}>
                <ChevronRight size={16} />
              </button>
              <span className={styles.showingText}>
                Showing 1-{filteredProjects.length} of {projects.length} projects
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
                        {selectedProject.tasksCompleted ?? 12} of {selectedProject.totalTasks ?? 17} tasks completed
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

        {showCreateModal && (
          <CreateProjectModal onClose={() => setShowCreateModal(false)} />
        )}
      </PageContainer>
    </AppLayout>
  );
}
