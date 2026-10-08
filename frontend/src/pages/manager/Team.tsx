import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, Search } from 'lucide-react';
import { AppLayout, PageContainer, PageHeader } from '../../components/layout/AppLayout';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { EmptyState, Skeleton } from '../../components/ui/State';
import { CreateUserModal } from '../../components/modals/CreateUserModal';
import { CreateTaskModal } from '../../components/modals/CreateTaskModal';
import { dataStore } from '../../services/dataService';
import { StatusBadge } from '../../components/ui/StatusBadge';
import styles from '../../components/project/ProjectWorkspace.module.css';

export function Team(): JSX.Element {
  const [, render] = useState(0);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [selectedId, setSelectedId] = useState('');
  const [adding, setAdding] = useState(false);
  const [assigning, setAssigning] = useState(false);
  useEffect(() => dataStore.subscribe(() => render((value) => value + 1)), []);
  const people = dataStore.getUsers().filter((person) => person.role !== 'client');
  const visible = people.filter((person) => (role === 'all' || person.role === role) && `${person.name} ${person.email} ${person.jobTitle || ''}`.toLowerCase().includes(search.toLowerCase()));
  const selected = people.find((person) => person.uid === selectedId);
  const tasks = dataStore.getTasks();
  const assignments = (uid: string) => tasks.filter((task) => task.assigneeId === uid || task.reviewerId === uid);
  const selectedTasks = selected ? assignments(selected.uid) : [];
  const conflicts = dataStore.getConflicts();

  return <AppLayout role="manager"><PageContainer>
    <PageHeader title="Team" description="Know who owns each piece of work. Build the team and keep assignments clear." action={<Button onClick={() => setAdding(true)}><Plus size={15} /> Add team member</Button>} />
    <div className={styles.summary} style={{ flexWrap: 'wrap' }}>
      <label className={styles.feedbackStatus}><Search size={15} /><input type="search" aria-label="Search team members" placeholder="Find a team member…" value={search} onChange={(event) => setSearch(event.target.value)} style={{ padding: '.5rem .7rem', border: '1px solid var(--border)', borderRadius: '.5rem', background: 'var(--surface)' }} /></label>
      <label className={styles.feedbackStatus}>Role<select aria-label="Filter team by role" value={role} onChange={(event) => setRole(event.target.value)}><option value="all">All roles</option><option value="assignee">Assignees</option><option value="reviewer">Reviewers</option><option value="manager">Managers</option></select></label>
      <span style={{ marginLeft: 'auto' }}>{visible.length} members</span>
    </div>
    {dataStore.getError() && <div role="alert" className={styles.panel}><p>{dataStore.getError()}</p><Button variant="secondary" onClick={() => { void dataStore.refresh(); }}>Try again</Button></div>}
    <div className={selected ? styles.columns : ''}>
      <section className={styles.panel}><h2>People & assignments</h2>{dataStore.isLoading() ? <Skeleton rows={4} /> : visible.length === 0 ? <EmptyState text="No team members match this view" hint="Try another search or add a new teammate." /> : <div className={styles.tableScroll}><table><thead><tr><th>Member</th><th>Role</th><th>Active tasks</th><th>Approved</th><th>Overlaps</th></tr></thead><tbody>{visible.map((person) => { const owned = assignments(person.uid); return <tr key={person.uid}><td><button type="button" onClick={() => setSelectedId(person.uid)} style={{ display: 'flex', alignItems: 'center', gap: '.7rem', textAlign: 'left', color: 'var(--text-primary)' }}><Avatar name={person.name} size="sm" /><span>{person.name}</span></button></td><td>{person.role}</td><td>{owned.filter((task) => task.status !== 'approved').length}</td><td>{owned.filter((task) => task.status === 'approved').length}</td><td>{conflicts.filter((conflict) => conflict.assigneeId === person.uid).length}</td></tr>; })}</tbody></table></div>}</section>
      {selected && <section key={selected.uid} className={styles.panel} style={{ animation: 'fadeUp 200ms ease both' }}><div style={{ display: 'flex', alignItems: 'center', gap: '.8rem' }}><Avatar name={selected.name} size="md" /><div><h2 style={{ margin: 0 }}>{selected.name}</h2><p className={styles.description} style={{ margin: '.25rem 0 0' }}>{selected.jobTitle || selected.role}</p></div><button type="button" style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} onClick={() => setSelectedId('')} aria-label="Close member details"><X size={18} /></button></div>
        <div className={styles.facts}><div><span>Email</span><strong style={{ textTransform: 'none', overflowWrap: 'anywhere' }}>{selected.email || 'Not shared'}</strong></div><div><span>Department</span><strong>{selected.department || 'Not provided'}</strong></div></div>
        {selected.bio && <p className={styles.description} style={{ marginTop: '1rem' }}>{selected.bio}</p>}
        <h2 style={{ marginTop: '1.75rem' }}>Current assignments</h2>{selectedTasks.filter((task) => task.status !== 'approved').length ? selectedTasks.filter((task) => task.status !== 'approved').map((task) => <div key={task.id} className={styles.listItem}><Link to={`/manager/tasks/${task.id}`} style={{ flex: 1 }}>{task.title}</Link><StatusBadge status={task.status} size="sm" /></div>) : <p className={styles.description}>No active assignments.</p>}
        {selected.role !== 'manager' && <Button onClick={() => setAssigning(true)}><Plus size={14} /> Assign task</Button>}
      </section>}
    </div>
    {adding && <CreateUserModal onClose={() => setAdding(false)} onCreated={() => { void dataStore.refresh(); }} />}
    {assigning && selected && <CreateTaskModal defaultAssigneeId={selected.role === 'assignee' ? selected.uid : undefined} defaultReviewerId={selected.role === 'reviewer' ? selected.uid : undefined} onClose={() => setAssigning(false)} />}
  </PageContainer></AppLayout>;
}
