import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Calendar,
  Clock,
  X,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Paperclip,
  Inbox,
  Loader2,
} from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Avatar } from '../../components/ui/Avatar';
import { CreateTaskModal } from '../../components/modals/CreateTaskModal';
import { dataStore } from '../../services/demoData';
import { useToast } from '../../components/ui/Toast';
import type { Task, TaskStatus } from '../../types';
import styles from './Tasks.module.css';

export function ManagerTasks(): JSX.Element {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const setSelectedTask = (task: Task | null): void => setSelectedTaskId(task?.id ?? '');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'details' | 'subtasks' | 'files' | 'activity'>('details');

  useEffect(() => {
    return dataStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const tasks = dataStore.getTasks();
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;
  useEffect(() => {
    if (selectedTaskId === '') return;
    const onEscape = (event: KeyboardEvent): void => { if (event.key === 'Escape' && !document.querySelector('[role="dialog"]')) setSelectedTaskId(''); };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [selectedTaskId]);
  const users = dataStore.getUsers();
  const projects = dataStore.getProjects();
  const loading = dataStore.isLoading();
  const error = dataStore.getError();
  const selectedActivities = selectedTask === null ? [] : dataStore.getActivities().filter((activity) => activity.targetId === selectedTask.id || activity.projectId === selectedTask.projectId);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.projectName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAssignee = assigneeFilter === 'all' || t.assigneeId === assigneeFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesAssignee && matchesPriority;
  });

  const columns: { status: TaskStatus; label: string; count: number }[] = [
    { status: 'todo', label: 'To Do', count: filteredTasks.filter((t) => t.status === 'todo').length },
    { status: 'in_progress', label: 'In Progress', count: filteredTasks.filter((t) => t.status === 'in_progress').length },
    { status: 'submitted', label: 'Submitted', count: filteredTasks.filter((t) => t.status === 'submitted').length },
    { status: 'in_review', label: 'In Review', count: filteredTasks.filter((t) => t.status === 'in_review').length },
    { status: 'revision', label: 'Revision', count: filteredTasks.filter((t) => t.status === 'revision').length },
    { status: 'approved', label: 'Completed', count: filteredTasks.filter((t) => t.status === 'approved').length },
  ];

  return (
    <AppLayout role="manager">
      <PageContainer>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Tasks</h1>
            <p className={styles.subtitle}>
              Manage, assign, and track team deliverables across all active projects.
            </p>
          </div>
          <button className={styles.createTaskBtn} onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            <span>Create Task</span>
          </button>
        </div>

        {/* Filter and Control Bar */}
        <div className={styles.controlBar}>
          <div className={styles.searchWrapper}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <select
              className={styles.select}
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
            >
              <option value="all">All Assignees</option>
              {users.map((u) => (
                <option key={u.uid} value={u.uid}>
                  {u.name}
                </option>
              ))}
            </select>

            <select
              className={styles.select}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <div className={styles.viewToggle}>
              <button
                className={`${styles.toggleBtn} ${viewMode === 'board' ? styles.activeToggle : ''}`}
                onClick={() => setViewMode('board')}
                title="Kanban Board View"
              >
                <LayoutGrid size={16} />
                <span>Board</span>
              </button>
              <button
                className={`${styles.toggleBtn} ${viewMode === 'table' ? styles.activeToggle : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <List size={16} />
                <span>Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className={styles.mainLayout}>
          {/* Kanban Board View */}
          {viewMode === 'board' ? (
            <div className={styles.boardGrid}>
              {loading && tasks.length === 0 ? (
                <div className={styles.emptyState} role="status">
                  <Loader2 size={28} color="var(--primary)" className={styles.spinner} aria-hidden="true" />
                  <p>Loading tasks…</p>
                </div>
              ) : error !== '' && tasks.length === 0 ? (
                <div className={styles.emptyState} role="alert">
                  <p>Tasks unavailable</p>
                  <span>{error}</span>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className={styles.emptyState}>
                  <Inbox size={28} color="var(--text-muted)" aria-hidden="true" />
                  <p>{tasks.length === 0 ? 'No tasks yet' : 'No matching tasks'}</p>
                  <span>{tasks.length === 0 ? 'Create a task to start managing delivery.' : 'Try a different search or filter.'}</span>
                </div>
              ) : columns.map((col) => {
                const colTasks = filteredTasks.filter((t) => t.status === col.status);

                return (
                  <div key={col.status} className={styles.boardColumn}>
                    <div className={styles.columnHeader}>
                      <div className={styles.columnTitleWrap}>
                        <span className={styles.columnTitle}>{col.label}</span>
                        <span className={styles.columnCount}>{colTasks.length}</span>
                      </div>
                      <button
                        className={styles.addColumnBtn}
                        onClick={() => setShowCreateModal(true)}
                        aria-label="Create task" title="Create task"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className={styles.columnCards}>
                      {colTasks.map((t) => {
                        const assignee = users.find((u) => u.uid === t.assigneeId);
                        const isSelected = selectedTask?.id === t.id;

                        return (
                          <div
                            key={t.id}
                            className={`${styles.taskCard} ${isSelected ? styles.selectedCard : ''}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedTask(t)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                setSelectedTask(t);
                              }
                            }}
                          >
                            <div className={styles.cardTop}>
                              <div className={styles.cardTitle}>{t.title}</div>
                              <div className={styles.cardProject}>{t.projectName}</div>
                            </div>

                            <div className={styles.cardDateRow}>
                              <Calendar size={13} color="#EF4444" />
                              <span className={styles.cardDateText}>{t.deadline}</span>
                            </div>

                            <div className={styles.cardFooter}>
                              <div className={styles.assigneeRow}>
                                <Avatar name={assignee?.name} src={assignee?.avatar} size="sm" />
                                <span className={styles.assigneeName}>{assignee?.name ?? 'Unassigned'}</span>
                              </div>
                              <PriorityBadge priority={t.priority} size="sm" />
                            </div>

                            {t.conflictWith && t.conflictWith.length > 0 && (
                              <div className={styles.cardConflictWarning}>
                                <AlertCircle size={12} />
                                <span>Conflict ({t.conflictWith.length})</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Project</th>
                    <th>Assignee</th>
                    <th>Start Date</th>
                    <th>Deadline</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className={styles.tableEmptyState}>
                        {loading ? 'Loading tasks…' : error !== '' ? error : 'No matching tasks.'}
                      </td>
                    </tr>
                  ) : filteredTasks.map((t) => {
                    const assignee = users.find((u) => u.uid === t.assigneeId);
                    return (
                      <tr key={t.id} onClick={() => setSelectedTask(t)} style={{ cursor: 'pointer' }}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.title}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.taskIdCode || '—'}</div>
                        </td>
                        <td>{t.projectName}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Avatar name={assignee?.name} src={assignee?.avatar} size="sm" />
                            <span>{assignee?.name ?? 'Unassigned'}</span>
                          </div>
                        </td>
                        <td>{t.startDate}</td>
                        <td>{t.deadline}</td>
                        <td><PriorityBadge priority={t.priority} size="sm" /></td>
                        <td><StatusBadge status={t.status} size="sm" /></td>
                        <td>
                          <button
                            className={styles.viewLink}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/manager/tasks/${t.id}`);
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Slide-over / Task Details Drawer (Reference Image 15 right panel) */}
          {selectedTask && (
            <aside className={styles.drawer} aria-labelledby="task-drawer-title">
              <div className={styles.drawerHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StatusBadge status={selectedTask.status} size="sm" />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className={styles.drawerIconBtn}
                    onClick={() => navigate(`/manager/tasks/${selectedTask.id}`)}
                    aria-label="Open task detail" title="Open full page"
                  >
                    <MoreVertical size={16} />
                  </button>
                  <button
                    className={styles.drawerIconBtn}
                    onClick={() => setSelectedTask(null)}
                    aria-label="Close task details" title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className={styles.drawerBody}>
                <h2 id="task-drawer-title" className={styles.drawerTitle}>{selectedTask.title}</h2>
                <div className={styles.drawerMeta}>
                  <div className={styles.metaRow}>
                    <span className={styles.metaKey}>Project:</span>
                    <span className={styles.metaVal}>{selectedTask.projectName}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaKey}>Assignee:</span>
                    <span className={styles.metaVal}>
                      {users.find((u) => u.uid === selectedTask.assigneeId)?.name}
                    </span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaKey}>Deadline:</span>
                    <span className={styles.metaVal}>{selectedTask.deadline}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaKey}>Priority:</span>
                    <PriorityBadge priority={selectedTask.priority} size="sm" />
                  </div>
                </div>

                {/* Drawer Tabs */}
                <div className={styles.drawerTabs}>
                  {(['details', 'subtasks', 'files', 'activity'] as const).map((tab) => (
                    <button
                      key={tab}
                      className={`${styles.drawerTabBtn} ${drawerTab === tab ? styles.activeDrawerTab : ''}`}
                      onClick={() => setDrawerTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                {drawerTab === 'details' && (
                  <div className={styles.drawerDetails}>
                    <div className={styles.sectionHeader}>Description</div>
                    <p className={styles.descText}>{selectedTask.description}</p>

                    <div className={styles.sectionHeader} style={{ marginTop: '16px' }}>Requirements</div>
                    <ul className={styles.reqList}>
                      {(selectedTask.requirementsList || []).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {drawerTab === 'subtasks' && (
                  <div className={styles.drawerSubtasks}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className={styles.sectionHeader}>Checklist</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {(selectedTask.subtasks || []).filter((s) => s.completed).length} / {(selectedTask.subtasks || []).length}
                      </span>
                    </div>
                    <ProgressBar
                      value={
                        (selectedTask.subtasks || []).length > 0
                          ? Math.round(
                              ((selectedTask.subtasks || []).filter((s) => s.completed).length /
                                (selectedTask.subtasks || []).length) *
                                100
                            )
                          : 0
                      }
                      height={6}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
                      {(selectedTask.subtasks || []).map((st) => (
                        <label
                          key={st.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            background: '#F8FAFC',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={st.completed}
                            onChange={() => { void dataStore.toggleSubtask(selectedTask.id, st.id).catch((error: unknown) => toast(error instanceof Error ? error.message : 'Checklist update failed.', 'error')); }}
                          />
                          <span style={{ textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                            {st.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {drawerTab === 'files' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(selectedTask.attachments || []).map((f, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                        }}
                      >
                        <Paperclip size={16} color="var(--primary)" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 500 }}>{f.url ? <a href={f.url} target="_blank" rel="noreferrer">{f.name}</a> : f.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{f.size}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {drawerTab === 'activity' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedActivities.length === 0 ? <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>No activity recorded yet.</div> : selectedActivities.slice(0, 8).map((activity) => <div key={activity.id} style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>• {activity.actorName} {activity.description} · {activity.timeAgo}</div>)}
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>

        {showCreateModal && (
          <CreateTaskModal onClose={() => setShowCreateModal(false)} />
        )}
      </PageContainer>
    </AppLayout>
  );
}
