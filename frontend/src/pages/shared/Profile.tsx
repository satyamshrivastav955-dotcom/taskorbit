import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Shield, Calendar, Edit2 } from 'lucide-react';
import { signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { dataStore } from '../../services/dataService';
import { useAppDispatch } from '../../redux/hooks';
import { setSession, clearSession } from '../../redux/sessionSlice';
import type { Project } from '../../types';

type Tab = 'personal' | 'account' | 'security' | 'preferences';

export function Profile(): JSX.Element {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<Tab>('personal');
  const [, setTick] = useState(0);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [bio, setBio] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => dataStore.subscribe(() => setTick((t) => t + 1)), []);
  const me = dataStore.getActiveUser();

  useEffect(() => {
    if (!editing) {
      setName(me.name);
      setPhone(me.phone ?? '');
      setDepartment(me.department ?? '');
      setBio(me.bio ?? '');
      setJobTitle(me.jobTitle ?? '');
    }
  }, [me.uid, me.name, me.phone, me.department, me.bio, me.jobTitle, editing]);

  const allProjects = dataStore.getProjects();
  const allTasks = dataStore.getTasks();
  const allReqs = dataStore.getRequirements();
  const allFeedback = dataStore.getFeedbacks();

  const myTasks = allTasks.filter((t) => t.assigneeId === me.uid || t.reviewerId === me.uid);
  const approvedCount = myTasks.filter((t) => t.status === 'approved').length;
  const activeCount = myTasks.filter((t) => t.status !== 'approved').length;
  const conflicted = myTasks.filter((t) => t.conflictWith.length > 0).length;
  const approvalRate = myTasks.length === 0 ? 0 : Math.round((approvedCount / myTasks.length) * 100);
  const conflictRate = myTasks.length === 0 ? 0 : Math.round((conflicted / myTasks.length) * 100);
  const myProjects: Project[] = allProjects.slice(0, 4);

  async function save(): Promise<void> {
    setError('');
    if (name.trim() === '') { setError('Name cannot be empty.'); return; }
    try {
      await dataStore.updateProfile(me.uid, {
        name: name.trim(), phone: phone.trim(), department: department.trim(),
        bio: bio.trim(), jobTitle: jobTitle.trim(),
      });
      dispatch(setSession({ uid: me.uid, email: me.email, name: name.trim(), role: me.role }));
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed. Try again.');
    }
  }

  async function sendReset(): Promise<void> {
    setError('');
    try {
      await sendPasswordResetEmail(auth, me.email);
      setResetSent(true);
    } catch {
      setError('Could not send reset email. Try again.');
    }
  }

  async function logout(): Promise<void> {
    await signOut(auth);
    dispatch(clearSession());
    navigate('/login');
  }

  return (
    <AppLayout role={me.role}>
      <PageContainer>
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: '24px' }}>
          <div style={{ height: '140px', background: 'var(--forest)', position: 'relative' }} />
          <div style={{ padding: '0 32px 32px 32px', position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', marginTop: '-50px' }}>
              <div style={{ border: '4px solid #FFFFFF', borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <Avatar name={me.name !== '' && me.name !== me.email ? me.name : me.email} size="xl" />
              </div>
              <div style={{ paddingBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
                    {me.name !== '' && me.name !== me.email ? me.name : '—'}
                  </h1>
                   <span style={{ background: 'var(--sage-wash)', color: 'var(--forest-dark)', padding: '3px 10px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                    {me.role}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {me.email}
                </p>
                {(me.name === '' || me.name === me.email) && !editing && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#D97706', fontWeight: 600 }}>
                    ⚠ Profile incomplete — click &ldquo;Edit Profile&rdquo; to add your name.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', margin: '0 0 24px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          {([['personal', 'Personal Info'], ['account', 'Account'], ['security', 'Security'], ['preferences', 'Preferences']] as Array<[Tab, string]>).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '8px 16px', borderRadius: '8px', background: tab === t ? '#EEF2FF' : 'transparent', color: tab === t ? 'var(--primary-700)' : 'var(--text-secondary)', border: 'none', fontSize: '13.5px', fontWeight: tab === t ? 600 : 500, cursor: 'pointer' }}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'personal' && (
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '24px', maxWidth: '800px' }}>
            {(
              [
                ['Full Name', name, setName],
                ['Phone Number', phone, setPhone],
                ['Department', department, setDepartment],
                ['Job Title', jobTitle, setJobTitle],
              ] as Array<[string, string, (v: string) => void]>
            ).map(([label, value, setter]) => (
              <div key={label} style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{label}</label>
                <input value={value} disabled={!editing} onChange={(e) => setter(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13.5px', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Bio</label>
              <textarea value={bio} disabled={!editing} onChange={(e) => setBio(e.target.value)} rows={3}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13.5px', boxSizing: 'border-box' }} />
            </div>
            {error !== '' && <p role="alert" style={{ color: '#EF4444', fontSize: '13px' }}>{error}</p>}
            {saved && <p style={{ color: '#15803D', fontSize: '13px' }}>Profile saved.</p>}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              {editing && <button onClick={() => setEditing(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff', cursor: 'pointer' }}>Cancel</button>}
              <button onClick={() => { if (editing) { void save(); } else { setEditing(true); } }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--primary-600)', color: '#fff', cursor: 'pointer' }}>
                <Edit2 size={14} /> {editing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>
          </div>
        )}

        {tab === 'account' && (
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '24px', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Mail size={16} color="var(--text-muted)" />
              <div>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>Email Address</span>
                <span style={{ fontSize: '13.5px', fontWeight: 600 }}>{me.email}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Shield size={16} color="var(--text-muted)" />
              <div>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>Access Role</span>
                <span style={{ fontSize: '13.5px', fontWeight: 600 }}>{me.role} (set by your manager)</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calendar size={16} color="var(--text-muted)" />
              <div>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>Member Since</span>
                <span style={{ fontSize: '13.5px', fontWeight: 600 }}>{me.createdAt.slice(0, 10)}</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '24px', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>Reset your password by email, or sign out of this device.</p>
            {resetSent
              ? <p style={{ color: '#15803D', fontSize: '13px' }}>Reset link sent to {me.email}.</p>
              : <button onClick={() => { void sendReset(); }} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff', cursor: 'pointer', alignSelf: 'flex-start' }}>Send password reset email</button>}
            <button onClick={() => { void logout(); }} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#EF4444', color: '#fff', cursor: 'pointer', alignSelf: 'flex-start' }}>Sign out</button>
            {error !== '' && <p role="alert" style={{ color: '#EF4444', fontSize: '13px' }}>{error}</p>}
          </div>
        )}

        {tab === 'preferences' && (
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '24px', maxWidth: '800px' }}>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>Workspace preferences live in Settings.</p>
            <button onClick={() => navigate('/settings')} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: 'var(--primary-600)', color: '#fff', cursor: 'pointer' }}>Open Settings</button>
          </div>
        )}

        <div className="responsive-grid" style={{ gridTemplateColumns: '340px 1fr', gap: '24px', marginTop: '24px' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0' }}>
              {me.role === 'client' ? 'Workspace Summary' : 'Performance Metrics'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {me.role === 'client' ? (
                <>
                  <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>Total Projects</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary-600)' }}>{allProjects.length}</span>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>Requirements</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#10B981' }}>{allReqs.length}</span>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>Feedback Sent</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#6366F1' }}>{allFeedback.length}</span>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>Active Scope</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#10B981' }}>
                      {allProjects.filter((p) => p.status === 'active' || p.status === 'on_track').length}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>Active Tasks</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary-600)' }}>{activeCount}</span>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>Completed</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#10B981' }}>{approvedCount}</span>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>Approval Rate</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#6366F1' }}>{approvalRate}%</span>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>Conflict Rate</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#10B981' }}>{conflictRate}%</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0' }}>Active Projects &amp; Workstreams</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {myProjects.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No projects yet.</p>}
              {myProjects.map((proj) => (
                <div key={proj.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: '#FAFBFD' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{proj.title}</h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Deadline: {proj.deadline}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-600)' }}>{proj.progress}%</span>
                      <div style={{ width: '80px', height: '6px', borderRadius: '9999px', background: '#E2E8F0', overflow: 'hidden', marginTop: '4px' }}>
                        <div style={{ width: `${proj.progress}%`, height: '100%', background: 'var(--primary-600)', borderRadius: '9999px' }} />
                      </div>
                    </div>
                    <StatusBadge status={proj.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
