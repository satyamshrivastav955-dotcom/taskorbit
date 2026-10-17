import { useEffect, useState } from 'react';
import { AlertTriangle, Calendar, CheckCircle2, Clock, ArrowRight, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { Avatar } from '../../components/ui/Avatar';
import { ConflictResolutionModal } from '../../components/modals/ConflictResolutionModal';
import { dataStore } from '../../services/dataService';
import type { ConflictDetail } from '../../types';

const panelStyle = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' };

export function Conflicts(): JSX.Element {
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [selected, setSelected] = useState<ConflictDetail | null>(null);
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [showResolve, setShowResolve] = useState(false);
  useEffect(() => dataStore.subscribe(() => setTick((t) => t + 1)), []);
  const conflicts = dataStore.getConflicts();
  const users = dataStore.getUsers().filter((user) => user.role === 'assignee');
  const visible = filterAssignee === 'all' ? conflicts : conflicts.filter((conflict) => conflict.assigneeId === filterAssignee);

  return (
    <AppLayout role="manager" conflictCount={conflicts.length}>
      <PageContainer>
        <div style={{ marginBottom: '8px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Conflicts</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>Server-detected overlapping schedules for active work.</p>
        </div>
        <div className="responsive-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '18px' }}>
          <div style={panelStyle}>
            <AlertTriangle size={21} color="var(--danger)" />
            <strong style={{ display: 'block', fontSize: '25px', marginTop: '12px' }}>{conflicts.length}</strong>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Active conflicts</span>
          </div>
          <div style={panelStyle}>
            <Clock size={21} color="var(--action-blue)" />
            <strong style={{ display: 'block', fontSize: '25px', marginTop: '12px' }}>{new Set(conflicts.map((conflict) => conflict.assigneeId)).size}</strong>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Assignees affected</span>
          </div>
          <div style={panelStyle}>
            <CheckCircle2 size={21} color="var(--success)" />
            <strong style={{ display: 'block', fontSize: '25px', marginTop: '12px' }}>{dataStore.getTasks().filter((task) => task.status === 'approved').length}</strong>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Approved tasks excluded</span>
          </div>
        </div>
        <div style={{ ...panelStyle, padding: '12px 16px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <label htmlFor="conflict-assignee" style={{ fontSize: '13px', fontWeight: 600 }}>Assignee</label>
          <select id="conflict-assignee" value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)} style={{ maxWidth: '100%', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: '7px', background: 'var(--surface)' }}>
            <option value="all">Everyone</option>
            {users.map((user) => <option key={user.uid} value={user.uid}>{user.name}</option>)}
          </select>
        </div>
        {visible.length === 0 ? (
          <div style={{ ...panelStyle, textAlign: 'center', padding: '72px 20px' }}>
            <Inbox size={42} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>No active conflicts</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '5px' }}>New overlaps are calculated on every task create, edit, or reassignment.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {visible.map((conflict) => (
              <button key={conflict.id} onClick={() => setSelected(conflict)} style={{ ...panelStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', textAlign: 'left', borderColor: selected?.id === conflict.id ? 'var(--primary)' : 'var(--border)', padding: '15px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{ width: '34px', height: '34px', flexShrink: 0, borderRadius: '8px', background: 'var(--danger-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertTriangle size={16} color="var(--danger)" /></div>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ display: 'block', fontSize: '13.5px', overflowWrap: 'anywhere' }}>{conflict.taskA.title} ↔ {conflict.taskB.title}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '5px', marginTop: '4px' }}><Avatar name={conflict.assigneeName} size="sm" />{conflict.assigneeName} · {conflict.overlapDateRange}</span>
                  </div>
                </div>
                <span style={{ color: 'var(--danger-dark)', fontSize: '12px', fontWeight: 700 }}>{conflict.overlapDays} day{conflict.overlapDays === 1 ? '' : 's'}<br />overlap</span>
              </button>
            ))}
          </div>
        )}
        {selected && (
          <div style={panelStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div><h2 style={{ fontSize: '16px', fontWeight: 700 }}>Resolve schedule conflict</h2><p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>{selected.taskA.title} and {selected.taskB.title} overlap for {selected.assigneeName}.</p></div>
              <Calendar size={20} color="var(--danger)" style={{ flexShrink: 0 }} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '16px' }}>
              <button onClick={() => { setShowResolve(true); }} style={{ padding: '8px 14px', background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>Choose a resolution</button>
              <button onClick={() => navigate(`/manager/tasks/${selected.taskA.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px' }}>Open task <ArrowRight size={14} /></button>
            </div>
          </div>
        )}
        {showResolve && selected && <ConflictResolutionModal conflict={selected} onClose={() => setShowResolve(false)} onResolved={() => { setShowResolve(false); setSelected(null); }} />}
      </PageContainer>
    </AppLayout>
  );
}
