import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Avatar } from '../../components/ui/Avatar';
import { dataStore } from '../../services/dataService';
import type { ProjectMilestone, UserProfile } from '../../types';

interface TimelineTask {
  id: string;
  title: string;
  assignee: string;
  progress: number;
  startCol: number;
  span: number;
  color: string;
  hasConflict?: boolean;
}

interface TimelinePhase {
  name: string;
  tasks: TimelineTask[];
  milestone?: { title: string; col: number };
}

export function ManagerTimeline(): JSX.Element {
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState('proj-1');
  const [viewUnit, setViewUnit] = useState<'day' | 'week' | 'month'>('week');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('task-1');

  useEffect(() => {
    return dataStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const projects = dataStore.getProjects();
  const tasks = dataStore.getTasks();
  const users = dataStore.getUsers();
  const conflicts = dataStore.getConflicts();

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const activeTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];

  const phases: TimelinePhase[] = [
    {
      name: '1. Planning & Research',
      tasks: [
        { id: 't-p1', title: 'Project Brief', assignee: 'Rahul Sharma', progress: 100, startCol: 1, span: 3, color: '#10B981' },
        { id: 't-p2', title: 'Requirement Analysis', assignee: 'Rahul Sharma', progress: 100, startCol: 2, span: 3, color: '#10B981' },
        { id: 't-p3', title: 'Client Meeting', assignee: 'Neha Verma', progress: 100, startCol: 3, span: 3, color: '#10B981' },
      ],
      milestone: { title: 'Planning Complete', col: 6 },
    },
    {
      name: '2. Design',
      tasks: [
        { id: 'task-1', title: 'Homepage UI Design', assignee: 'Rahul Sharma', progress: 60, startCol: 3, span: 4, color: '#818CF8' },
        { id: 'task-video-edit', title: 'Video Editing', assignee: 'Rahul Sharma', progress: 40, startCol: 4, span: 3, color: '#EF4444', hasConflict: true },
        { id: 'task-thumb-design', title: 'Thumbnail Design', assignee: 'Rahul Sharma', progress: 80, startCol: 5, span: 3, color: '#F472B6', hasConflict: true },
      ],
    },
    {
      name: '3. Development',
      tasks: [
        { id: 't-d1', title: 'Frontend Development', assignee: 'Priya Mehta', progress: 0, startCol: 5, span: 4, color: '#60A5FA' },
        { id: 't-d2', title: 'Backend Integration', assignee: 'Arjun Kapoor', progress: 0, startCol: 7, span: 4, color: '#60A5FA' },
        { id: 't-d3', title: 'Database Schema', assignee: 'Arjun Kapoor', progress: 0, startCol: 6, span: 3, color: '#60A5FA' },
      ],
    },
    {
      name: '4. Testing',
      tasks: [
        { id: 't-t1', title: 'Testing & QA', assignee: 'Karan Sethi', progress: 0, startCol: 5, span: 3, color: '#FBBF24' },
        { id: 't-t2', title: 'Bug Fixing', assignee: 'Priya Mehta', progress: 0, startCol: 6, span: 2, color: '#FBBF24' },
      ],
      milestone: { title: 'Testing Complete', col: 8 },
    },
    {
      name: '5. Review & Launch',
      tasks: [
        { id: 't-r1', title: 'Client Review', assignee: 'Amit Patel', progress: 0, startCol: 7, span: 4, color: '#A78BFA' },
      ],
      milestone: { title: 'Project Launch', col: 10 },
    },
  ];

  return (
    <AppLayout role="manager" conflictCount={conflicts.length}>
      <PageContainer>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Timeline</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Visualize project schedules, track progress, and identify conflicts.
            </p>
          </div>
        </div>

        {/* Filter Controls Row matching Reference Image 7 */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px' }}>
              <FolderKanban size={15} color="var(--primary)" />
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 600, fontSize: '13px' }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <Calendar size={14} />
              <span>Mar 1, 2025 – Mar 30, 2025</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              {(['day', 'week', 'month'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setViewUnit(u)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: viewUnit === u ? 'var(--primary)' : 'transparent',
                    color: viewUnit === u ? '#FFFFFF' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {u.charAt(0).toUpperCase() + u.slice(1)}
                </button>
              ))}
            </div>

            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px' }}>
              <Filter size={14} />
              <span>Filter</span>
            </button>
            <button style={{ padding: '6px 14px', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
              Today
            </button>
          </div>
        </div>

        {/* Main Gantt Grid + Right Info Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '20px' }}>
          {/* Gantt Timeline Viewport */}
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', overflowX: 'auto', position: 'relative' }}>
            {/* Header Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '220px repeat(4, 1fr)', borderBottom: '1px solid var(--border)', paddingBottom: '10px', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <div>Tasks ({tasks.length})</div>
              <div style={{ textAlign: 'center' }}>Mar 3 – Mar 9</div>
              <div style={{ textAlign: 'center' }}>Mar 10 – Mar 16</div>
              <div style={{ textAlign: 'center', position: 'relative' }}>
                Mar 17 – Mar 23
                {/* "Today" marker pin */}
                <div style={{ position: 'absolute', top: '-18px', left: '25%', transform: 'translateX(-50%)', background: '#4F46E5', color: '#FFF', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>
                  Today
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>Mar 24 – Mar 30</div>
            </div>

            {/* Vertical Today line */}
            <div
              style={{
                position: 'absolute',
                top: '55px',
                bottom: '20px',
                left: 'calc(220px + (100% - 220px) * 0.55)',
                width: '1.5px',
                borderLeft: '1.5px dashed #6366F1',
                zIndex: 5,
                pointerEvents: 'none',
              }}
            />

            {/* Phases and Task Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
              {phases.map((ph, pi) => (
                <div key={pi} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Phase Title */}
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {ph.name}
                  </div>

                  {/* Tasks in Phase */}
                  {ph.tasks.map((t, ti) => {
                    return (
                      <div
                        key={ti}
                        onClick={() => setSelectedTaskId(t.id)}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '220px 1fr',
                          alignItems: 'center',
                          padding: '6px 0',
                          borderBottom: '1px solid #F8FAFC',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                          <Avatar name={t.assignee} size="sm" />
                          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{t.title}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.progress}%</span>
                        </div>

                        {/* Gantt Bar Lane */}
                        <div style={{ position: 'relative', height: '26px', background: '#F8FAFC', borderRadius: '6px', overflow: 'hidden' }}>
                          <div
                            style={{
                              position: 'absolute',
                              left: `${t.startCol * 9}%`,
                              width: `${t.span * 13}%`,
                              height: '24px',
                              top: '1px',
                              borderRadius: '6px',
                              background: t.color,
                              color: '#FFFFFF',
                              fontSize: '11px',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0 8px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                              border: t.hasConflict ? '2px solid #EF4444' : 'none',
                            }}
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {t.title}
                            </span>
                            {t.hasConflict && (
                              <span style={{ background: '#EF4444', color: '#FFF', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                !
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Right Info Cards matching Reference Image 7 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Project Progress Ring */}
            <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Project Progress
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {activeProject.progress}%
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {activeProject.tasksCompleted ?? 12} of {activeProject.totalTasks ?? 17} tasks
                </span>
              </div>
              <ProgressBar value={activeProject.progress} height={8} />
            </div>

            {/* Milestones Card */}
            <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700 }}>Milestones</span>
                <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>View all →</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(activeProject.milestones || []).map((m: ProjectMilestone) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} color={m.completed ? '#10B981' : '#CBD5E1'} />
                      <span style={{ fontWeight: 500 }}>{m.title}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11.5px' }}>{m.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Members */}
            <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700 }}>Team Members</span>
                <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/manager/team')}>View all →</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {users.slice(0, 4).map((u: UserProfile) => (
                  <div key={u.uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar name={u.name} src={u.avatar} size="sm" />
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{u.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.jobTitle}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', background: '#F1F5F9', padding: '2px 8px', borderRadius: '9999px' }}>
                      {u.assignedTasksCount || 4} tasks
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Task Details Bottom Bar matching Reference Image 7 */}
        {activeTask && (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={20} color="var(--primary)" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{activeTask.title}</h3>
                  <span style={{ background: '#EEF2FF', color: 'var(--primary)', padding: '2px 8px', borderRadius: '9999px', fontSize: '11.5px', fontWeight: 600 }}>
                    In Progress
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {activeTask.description}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Assignee</div>
                <div style={{ fontSize: '12.5px', fontWeight: 600 }}>
                  {users.find((u: UserProfile) => u.uid === activeTask.assigneeId)?.name}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dates</div>
                <div style={{ fontSize: '12.5px', fontWeight: 600 }}>
                  {activeTask.startDate} – {activeTask.deadline}
                </div>
              </div>
              <div style={{ width: '120px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Progress</div>
                <ProgressBar value={activeTask.progress || 60} height={6} showLabel />
              </div>
              <button
                onClick={() => navigate(`/manager/tasks/${activeTask.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  background: 'var(--primary-gradient)',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                }}
              >
                <span>View Details</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </PageContainer>
    </AppLayout>
  );
}
