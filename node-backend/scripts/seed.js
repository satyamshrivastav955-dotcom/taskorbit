/* Seed: node-backend/scripts/seed.js
 * Creates 1 client, 1 manager, 3 assignees, 2 reviewers, sets custom claims,
 * creates sample projects/tasks including one intentional conflict and one
 * task in every status. Prints demo credentials to console only. */
require('dotenv').config();
const { getAdmin } = require('../src/config/firebase');

const USERS = [
  { email: 'client@taskorbit.local', password: 'Client123!', name: 'Meera Kulkarni', role: 'client' },
  { email: 'manager@taskorbit.local', password: 'Manager123!', name: 'Priya Nair', role: 'manager' },
  { email: 'rahul@taskorbit.local', password: 'Assignee123!', name: 'Rahul Deshmukh', role: 'assignee' },
  { email: 'amit@taskorbit.local', password: 'Assignee123!', name: 'Amit Joshi', role: 'assignee' },
  { email: 'sneha@taskorbit.local', password: 'Assignee123!', name: 'Sneha Patil', role: 'assignee' },
  { email: 'kavya@taskorbit.local', password: 'Reviewer123!', name: 'Kavya Reddy', role: 'reviewer' },
  { email: 'vikram@taskorbit.local', password: 'Reviewer123!', name: 'Vikram Rao', role: 'reviewer' },
];

async function ensureUser(admin, u) {
  let user;
  try {
    user = await admin.auth().getUserByEmail(u.email);
  } catch {
    user = await admin.auth().createUser({ email: u.email, password: u.password, displayName: u.name });
  }
  await admin.auth().setCustomUserClaims(user.uid, { role: u.role });
  await admin.firestore().collection('users').doc(user.uid).set({
    name: u.name, email: u.email, role: u.role, createdAt: new Date(),
  }, { merge: true });
  return user;
}

async function main() {
  const admin = getAdmin();
  const ids = {};
  for (const u of USERS) {
    const created = await ensureUser(admin, u);
    ids[u.role + ':' + u.name] = created.uid;
    if (u.role === 'client') ids.client = created.uid;
    if (u.role === 'manager') ids.manager = created.uid;
  }
  const assignees = [ids['assignee:Rahul Deshmukh'], ids['assignee:Amit Joshi'], ids['assignee:Sneha Patil']];
  const reviewers = [ids['reviewer:Kavya Reddy'], ids['reviewer:Vikram Rao']];
  const fs = admin.firestore();

  const proj = await fs.collection('projects').add({
    title: 'Brightline Logistics website', description: 'Marketing site + onboarding flow',
    clientId: ids.client, managerId: ids.manager, status: 'active', priority: 'high',
    startDate: new Date('2026-10-01'), deadline: new Date('2026-11-15'), createdAt: new Date(),
  });

  const statuses = ['todo', 'in_progress', 'submitted', 'in_review', 'revision', 'approved'];
  const titles = ['Draft onboarding flow wireframes', 'Set up staging environment', 'Build tracking dashboard', 'Write API docs', 'Fix login redirect', 'Design footer'];
  const created = [];
  for (let i = 0; i < statuses.length; i++) {
    const conflict = i === 1;
    const ref = await fs.collection('tasks').add({
      projectId: proj.id, title: titles[i], description: titles[i],
      assigneeId: conflict ? assignees[0] : assignees[i % assignees.length],
      reviewerId: reviewers[i % reviewers.length],
      startDate: new Date(i < 2 ? '2026-10-01' : i === 5 ? '2026-11-01' : `2026-10-${String(5 + i).padStart(2, '0')}`),
      deadline: new Date(i < 2 ? '2026-10-05' : i === 5 ? '2026-11-05' : `2026-10-${String(9 + i).padStart(2, '0')}`),
      priority: 'medium', status: statuses[i], conflictWith: [], revisionCount: statuses[i] === 'revision' ? 1 : 0,
      createdAt: new Date(), updatedAt: new Date(),
    });
    created.push(ref.id);
  }

  // Intentional conflict: tasks 0 and 1 share assignee + overlapping dates.
  const { findConflicts } = require('../src/services/conflictService');
  const allTasks = [];
  for (const id of created) {
    const s = await fs.collection('tasks').doc(id).get();
    allTasks.push({ id, ...s.data() });
  }
  for (const t of allTasks) {
    const conflicts = t.status === 'approved' ? [] : findConflicts(t, allTasks);
    await fs.collection('tasks').doc(t.id).update({ conflictWith: conflicts });
  }

  // eslint-disable-next-line no-console
  console.log('Demo credentials (do not commit):');
  USERS.forEach((u) => {
    // eslint-disable-next-line no-console
    console.log(`${u.role} ${u.email} / ${u.password}`);
  });
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); }); // eslint-disable-line no-console
}
