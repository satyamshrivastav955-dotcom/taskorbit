import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronRight,
  ArrowRight,
  User,
  RotateCcw,
  Scissors,
  X,
} from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { Avatar } from '../../components/ui/Avatar';
import { ConflictResolutionModal } from '../../components/modals/ConflictResolutionModal';
import { dataStore } from '../../services/demoData';
import type { ConflictDetail } from '../../types';

export function Conflicts(): JSX.Element {
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [selectedConflict, setSelectedConflict] = useState<ConflictDetail | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [timeUnit, setTimeUnit] = useState<'week' | 'month'>('week');

  useEffect(() => {
    return dataStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const conflicts = dataStore.getConflicts();
  const users = dataStore.getUsers();

  useEffect(() => {
    if (!selectedConflict && conflicts.length > 0) {
      setSelectedConflict(conflicts[0]);
    }
  }, [conflicts, selectedConflict]);

  return (
    <AppLayout role="manager" conflictCount={conflicts.length}>
      <PageContainer>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Conflicts</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Identify and resolve overlapping tasks to keep your projects on track.
            </p>
          </div>
        </div>

        {/* 3 Metric Cards matching Reference Image 6 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={24} color="#EF4444" />
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {conflicts.length}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Active Conflicts</div>
              <div style={{ fontSize: '11.5px', color: '#EF4444' }}>Require immediate attention</div>
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={24} color="#0284C7" />
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>5</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Potential Conflicts</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>May need schedule review</div>
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={24} color="#16A34A" />
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>12</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Resolved</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>This month</div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#FFFFFF', padding: '12px 18px', borderRadius: '12px', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
          <select style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: '#F8FAFC', fontSize: '13px', outline: 'none' }}>
            <option>All Projects</option>
          </select>
          <select style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: '#F8FAFC', fontSize: '13px', outline: 'none' }}>
            <option>All Assignees</option>
          </select>
          <select style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: '#F8FAFC', fontSize: '13px', outline: 'none' }}>
            <option>All Statuses</option>
          </select>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            <Calendar size={14} />
            <span>Mar 1, 2025 – Mar 30, 2025</span>
          </div>
        </div>

        {/* Main Two-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: selectedConflict ? '1.8fr 1fr' : '1fr', gap: '20px' }}>
          {/* Left Column: Conflict Timeline + Conflict List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Visual Conflict Timeline */}
            <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Conflict Timeline</h3>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>March 2025</span>
                </div>
                <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
                  <button
                    onClick={() => setTimeUnit('week')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: timeUnit === 'week' ? 'var(--primary)' : 'transparent',
                      color: timeUnit === 'week' ? '#FFFFFF' : 'var(--text-secondary)',
                    }}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setTimeUnit('month')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: timeUnit === 'month' ? 'var(--primary)' : 'transparent',
                      color: timeUnit === 'month' ? '#FFFFFF' : 'var(--text-secondary)',
                    }}
                  >
                    Month
                  </button>
                </div>
              </div>

              {/* Day column headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '160px repeat(8, 1fr)', textAlign: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <div style={{ textAlign: 'left', fontWeight: 600 }}>Assignee</div>
                <div>Mar 10<br /><span style={{ fontSize: '10px' }}>Mon</span></div>
                <div>Mar 11<br /><span style={{ fontSize: '10px' }}>Tue</span></div>
                <div>Mar 12<br /><span style={{ fontSize: '10px' }}>Wed</span></div>
                <div>Mar 13<br /><span style={{ fontSize: '10px' }}>Thu</span></div>
                <div>Mar 14<br /><span style={{ fontSize: '10px' }}>Fri</span></div>
                <div>Mar 15<br /><span style={{ fontSize: '10px' }}>Sat</span></div>
                <div>Mar 16<br /><span style={{ fontSize: '10px' }}>Sun</span></div>
                <div>Mar 17<br /><span style={{ fontSize: '10px' }}>Mon</span></div>
              </div>

              {/* Lanes for each user */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
                {/* Rahul Sharma with real conflict */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar name="Rahul Sharma" size="sm" />
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Rahul Sharma</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>UI/UX Designer</div>
                    </div>
                  </div>
                  {/* Two overlapping bars with red alert */}
                  <div style={{ position: 'relative', height: '40px', background: '#F8FAFC', borderRadius: '6px' }}>
                    <div style={{ position: 'absolute', left: '15%', width: '45%', height: '18px', top: '2px', background: '#818CF8', borderRadius: '4px', fontSize: '10px', color: '#FFF', padding: '0 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Video Editing</span>
                      <span style={{ background: '#EF4444', borderRadius: '50%', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}>!</span>
                    </div>
                    <div style={{ position: 'absolute', left: '42%', width: '48%', height: '18px', bottom: '2px', background: '#F87171', borderRadius: '4px', fontSize: '10px', color: '#FFF', padding: '0 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Thumbnail Design</span>
                    </div>
                  </div>
                </div>

                {/* Priya Mehta */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar name="Priya Mehta" size="sm" />
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Priya Mehta</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Frontend Dev</div>
                    </div>
                  </div>
                  <div style={{ position: 'relative', height: '30px', background: '#F8FAFC', borderRadius: '6px' }}>
                    <div style={{ position: 'absolute', left: '25%', width: '50%', height: '22px', top: '4px', background: '#60A5FA', borderRadius: '4px', fontSize: '10px', color: '#FFF', padding: '0 6px', display: 'flex', alignItems: 'center' }}>
                      Homepage UI Design
                    </div>
                  </div>
                </div>

                {/* Arjun Kapoor */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar name="Arjun Kapoor" size="sm" />
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Arjun Kapoor</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Backend Dev</div>
                    </div>
                  </div>
                  <div style={{ position: 'relative', height: '30px', background: '#F8FAFC', borderRadius: '6px' }}>
                    <div style={{ position: 'absolute', left: '45%', width: '45%', height: '22px', top: '4px', background: '#34D399', borderRadius: '4px', fontSize: '10px', color: '#FFF', padding: '0 6px', display: 'flex', alignItems: 'center' }}>
                      API Integration
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conflict List (3 items) */}
            <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>
                  Conflict List ({conflicts.length})
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sort by: Start Date (Earliest)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {conflicts.map((c) => {
                  const isSelected = selectedConflict?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedConflict(c)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: isSelected ? '#F5F7FF' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <AlertTriangle size={16} color="#EF4444" />
                        </div>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {c.taskA.title} ↔ {c.taskB.title}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                            {c.taskA.projectName} • {c.assigneeName}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {c.taskA.startDate} – {c.taskA.deadline} ↔ {c.taskB.startDate} – {c.taskB.deadline}
                        </span>
                        <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '3px 10px', borderRadius: '9999px', fontSize: '11.5px', fontWeight: 700 }}>
                          {c.overlapDays} days overlap
                        </span>
                        <ChevronRight size={16} color="var(--text-muted)" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Slide-over / Details Panel matching Reference Image 6 */}
          {selectedConflict && (
            <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Conflict Details</h3>
                <button onClick={() => setSelectedConflict(null)} style={{ color: 'var(--text-muted)' }}>
                  <X size={18} />
                </button>
              </div>

              {/* Warning Card */}
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#991B1B' }}>Task Conflict Detected</div>
                  <div style={{ fontSize: '11.5px', color: '#B91C1C', marginTop: '2px' }}>
                    These tasks have overlapping date ranges for {selectedConflict.assigneeName}.
                  </div>
                </div>
              </div>

              {/* Conflicting Tasks Visual Comparison */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>Conflicting Tasks</div>

                {/* Task A */}
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600 }}>{selectedConflict.taskA.title}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{selectedConflict.taskA.projectName}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginTop: '8px', color: 'var(--text-secondary)' }}>
                    <span>Start: {selectedConflict.taskA.startDate}</span>
                    <span>End: {selectedConflict.taskA.deadline}</span>
                  </div>
                </div>

                {/* Overlaps with indicator */}
                <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase' }}>
                  ↑ Overlaps With ↓
                </div>

                {/* Task B */}
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600 }}>{selectedConflict.taskB.title}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{selectedConflict.taskB.projectName}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginTop: '8px', color: 'var(--text-secondary)' }}>
                    <span>Start: {selectedConflict.taskB.startDate}</span>
                    <span>End: {selectedConflict.taskB.deadline}</span>
                  </div>
                </div>
              </div>

              {/* Overlap Summary */}
              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={18} color="#EF4444" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#EF4444' }}>
                    {selectedConflict.overlapDays} days overlap
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    {selectedConflict.overlapDateRange}
                  </div>
                </div>
              </div>

              {/* Recommended Actions */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Recommended Actions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <Calendar size={14} color="var(--primary)" />
                    <span>Reschedule one of the tasks</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <RotateCcw size={14} color="var(--primary)" />
                    <span>Reassign task to another team member</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <Scissors size={14} color="var(--primary)" />
                    <span>Split the task into smaller subtasks</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                <button
                  onClick={() => setShowResolveModal(true)}
                  style={{
                    padding: '10px',
                    background: 'var(--primary-gradient)',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  Resolve Conflict →
                </button>
                <button
                  onClick={() => navigate(`/manager/tasks/${selectedConflict.taskA.id}`)}
                  style={{
                    padding: '8px',
                    background: '#FFFFFF',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                  }}
                >
                  View Both Tasks
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Resolution Modal */}
        {showResolveModal && selectedConflict && (
          <ConflictResolutionModal
            conflict={selectedConflict}
            onClose={() => setShowResolveModal(false)}
            onResolved={() => setSelectedConflict(null)}
          />
        )}
      </PageContainer>
    </AppLayout>
  );
}
