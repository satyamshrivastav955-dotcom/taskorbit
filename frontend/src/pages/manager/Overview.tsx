import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
  Clock,
  Calendar,
} from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Avatar, AvatarGroup } from '../../components/ui/Avatar';
import { CreateProjectModal } from '../../components/modals/CreateProjectModal';
import { dataStore } from '../../services/demoData';
import styles from './Manager.module.css';

export function ManagerOverview(): JSX.Element {
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [projectTab, setProjectTab] = useState<'all' | 'active' | 'at_risk' | 'delayed' | 'completed'>('active');
  const [showCreateProject, setShowCreateProject] = useState(false);

  useEffect(() => {
    return dataStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const projects = dataStore.getProjects();
  const tasks = dataStore.getTasks();
  const users = dataStore.getUsers();
  const conflicts = dataStore.getConflicts();
  const activities = dataStore.getActivities().slice(0, 5);

  const completedCount = tasks.filter((t) => t.status === 'approved').length;
  const filteredProjects = projects.filter((p) => {
    if (projectTab === 'active') return p.status === 'on_track' || p.status === 'active';
    if (projectTab === 'at_risk') return p.status === 'at_risk';
    if (projectTab === 'delayed') return p.status === 'delayed';
    if (projectTab === 'completed') return p.status === 'completed';
    return true;
  });

  return (
    <AppLayout role="manager" conflictCount={conflicts.length}>
      <PageContainer>
        {/* Welcome Header */}
        <div className={styles.dashboardHeader}>
          <div>
            <h1 className={styles.welcomeTitle}>Good morning, Rahul 👋</h1>
            <p className={styles.welcomeSubtitle}>
              Here&apos;s an overview of your projects and team&apos;s progress.
            </p>
          </div>
          <div className={styles.headerFilters}>
            <div className={styles.filterPill}>
              <FolderKanban size={14} />
              <span>All Projects</span>
            </div>
            <div className={styles.filterPill}>
              <Calendar size={14} />
              <span>This Week</span>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className={styles.statsGrid}>
          <StatCard
            label="Active Projects"
            value={projects.length}
            change="12% from last month"
            trend="up"
            color="purple"
            icon={<FolderKanban size={22} />}
          />
          <StatCard
            label="Total Tasks"
            value={tasks.length}
            change="8% from last month"
            trend="up"
            color="blue"
            icon={<CheckSquare size={22} />}
          />
          <StatCard
            label="Conflicting Tasks"
            value={conflicts.length}
            change="200% from last week"
            trend="down"
            color="red"
            icon={<AlertTriangle size={22} />}
          />
          <StatCard
            label="Completed Tasks"
            value={completedCount}
            change="28% from last month"
            trend="up"
            color="green"
            icon={<CheckCircle2 size={22} />}
          />
        </div>

        {/* Middle Row: Projects (Left) & Upcoming Deadlines (Right) */}
        <div className={styles.middleGrid}>
          {/* Projects Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <h3 className={styles.cardTitle}>Projects</h3>
                <div className={styles.tabsRow}>
                  {(['active', 'at_risk', 'delayed', 'completed'] as const).map((tab) => (
                    <button
                      key={tab}
                      className={`${styles.tabBtn} ${projectTab === tab ? styles.activeTabBtn : ''}`}
                      onClick={() => setProjectTab(tab)}
                    >
                      {tab === 'at_risk' ? 'At Risk' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.cardActions}>
                <button
                  className={styles.linkAction}
                  onClick={() => navigate('/manager/projects')}
                >
                  <span>View all</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  className={styles.primaryActionBtn}
                  onClick={() => setShowCreateProject(true)}
                >
                  <Plus size={15} />
                  <span>New Project</span>
                </button>
              </div>
            </div>

            <div className={styles.projectsList}>
              {filteredProjects.slice(0, 5).map((p) => {
                const team = (p.teamIds || [])
                  .map((uid) => users.find((u) => u.uid === uid))
                  .filter(Boolean) as { name: string; avatar?: string }[];

                return (
                  <div
                    key={p.id}
                    className={styles.projectRow}
                    onClick={() => navigate(`/manager/projects/${p.id}`)}
                  >
                    <div className={styles.projectIcon}>
                      <FolderKanban size={18} color="var(--primary)" />
                    </div>
                    <div className={styles.projectInfo}>
                      <span className={styles.projectName}>{p.title}</span>
                      <span className={styles.projectClient}>{p.clientName || 'Client'}</span>
                    </div>

                    <div className={styles.projectProgressCol}>
                      <div className={styles.progressPercent}>{p.progress}%</div>
                      <div style={{ width: '100px' }}>
                        <ProgressBar value={p.progress} height={6} />
                      </div>
                    </div>

                    <div className={styles.projectTasksCol}>
                      {p.tasksCompleted ?? 12} / {p.totalTasks ?? 17} tasks
                    </div>

                    <div className={styles.projectDeadlineCol}>{p.deadline}</div>

                    <div>
                      <StatusBadge status={p.status} size="sm" />
                    </div>

                    <AvatarGroup users={team} max={3} size="sm" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Upcoming Deadlines</h3>
              <button
                className={styles.linkAction}
                onClick={() => navigate('/manager/timeline')}
              >
                <span>View all</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className={styles.deadlinesList}>
              <div className={styles.deadlineBadgeGroup}>Today</div>
              {tasks.slice(0, 2).map((t) => {
                const assignee = users.find((u) => u.uid === t.assigneeId);
                return (
                  <div key={t.id} className={styles.deadlineItem}>
                    <div className={styles.deadlineIcon}>
                      <Clock size={16} color="var(--primary)" />
                    </div>
                    <div className={styles.deadlineContent}>
                      <div className={styles.deadlineTitle}>{t.title}</div>
                      <div className={styles.deadlineSub}>{t.projectName}</div>
                    </div>
                    <div className={styles.deadlineMeta}>
                      <Avatar name={assignee?.name} src={assignee?.avatar} size="sm" />
                      <PriorityBadge priority={t.priority} size="sm" />
                    </div>
                  </div>
                );
              })}

              <div className={styles.deadlineBadgeGroup} style={{ marginTop: '12px' }}>
                Mar 28, 2025
              </div>
              {tasks.slice(2, 4).map((t) => {
                const assignee = users.find((u) => u.uid === t.assigneeId);
                return (
                  <div key={t.id} className={styles.deadlineItem}>
                    <div className={styles.deadlineIcon}>
                      <Clock size={16} color="var(--primary)" />
                    </div>
                    <div className={styles.deadlineContent}>
                      <div className={styles.deadlineTitle}>{t.title}</div>
                      <div className={styles.deadlineSub}>{t.projectName}</div>
                    </div>
                    <div className={styles.deadlineMeta}>
                      <Avatar name={assignee?.name} src={assignee?.avatar} size="sm" />
                      <PriorityBadge priority={t.priority} size="sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Row: Team Workload (Left) & Recent Activity (Right) */}
        <div className={styles.bottomGrid}>
          {/* Team Workload */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Team Workload</h3>
              <button
                className={styles.linkAction}
                onClick={() => navigate('/manager/team')}
              >
                <span>View all</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className={styles.teamWorkloadList}>
              {users.slice(0, 4).map((u) => {
                const load = u.workloadPercentage || 60;
                const statusColor = load > 75 ? 'red' : load > 50 ? 'amber' : 'green';

                return (
                  <div key={u.uid} className={styles.workloadRow}>
                    <Avatar name={u.name} src={u.avatar} size="md" />
                    <div className={styles.workloadUserInfo}>
                      <div className={styles.workloadUserName}>{u.name}</div>
                      <div className={styles.workloadUserTitle}>{u.jobTitle}</div>
                    </div>
                    <div className={styles.workloadActiveTasks}>
                      {u.assignedTasksCount || 4} tasks
                    </div>
                    <div className={styles.workloadBarWrap}>
                      <ProgressBar
                        value={load}
                        color={statusColor}
                        height={6}
                      />
                    </div>
                    <div className={styles.workloadPercent}>{load}%</div>
                    <span
                      className={`${styles.workloadStatusBadge} ${
                        statusColor === 'red'
                          ? styles.statusRed
                          : statusColor === 'amber'
                          ? styles.statusAmber
                          : styles.statusGreen
                      }`}
                    >
                      {load > 75 ? 'High' : load > 50 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Recent Activity</h3>
              <button
                className={styles.linkAction}
                onClick={() => navigate('/manager/projects')}
              >
                <span>View all</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className={styles.activityFeed}>
              {activities.map((act) => (
                <div key={act.id} className={styles.activityItem}>
                  <Avatar name={act.actorName} src={act.actorAvatar} size="sm" />
                  <div className={styles.activityText}>
                    <span className={styles.activityActor}>{act.actorName}</span>{' '}
                    <span className={styles.activityDesc}>{act.description}</span>
                  </div>
                  <div className={styles.activityTime}>{act.timeAgo}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showCreateProject && (
          <CreateProjectModal onClose={() => setShowCreateProject(false)} />
        )}
      </PageContainer>
    </AppLayout>
  );
}
