/*
 * Emulator workflow smoke test.
 * Run through the root script so Firebase sets the emulator hosts:
 *   npm run test:workflow
 */
process.env.FIREBASE_PROJECT_ID = process.env.GCLOUD_PROJECT || 'demo-taskorbit';
process.env.FIREBASE_STORAGE_BUCKET = `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;

const assert = require('node:assert/strict');
const { getAdmin, db } = require('../node-backend/src/config/firebase');
const tasks = require('../node-backend/src/controllers/tasks');
const request = require('../node-backend/node_modules/supertest');
const app = require('../node-backend/src/server');
const tokens = new Map();

async function call(handler, req) {
  const routes = new Map([
    [tasks.createTask, ['post', `/api/projects/${req.params.projectId}/tasks`]],
    [tasks.startTask, ['post', `/api/tasks/${req.params.id}/start`]],
    [tasks.submitTask, ['post', `/api/tasks/${req.params.id}/submit`]],
    [tasks.openReview, ['post', `/api/tasks/${req.params.id}/open-review`]],
    [tasks.reviewTask, ['post', `/api/tasks/${req.params.id}/review`]],
  ]);
  const [method, path] = routes.get(handler);
  const res = await request(app)[method](path).set('Authorization', `Bearer ${tokens.get(req.user.uid)}`).send(req.body || {});
  assert.ok(res.status < 400, `${path}: ${res.status} ${JSON.stringify(res.body)}`);
  return { statusCode: res.status, body: res.body };
}

async function seedProject(id, managerId, clientId) {
  await db().collection('projects').doc(id).set({
    title: `Workflow ${id}`,
    description: 'Emulator workflow project',
    clientId,
    managerId,
    status: 'submitted',
    priority: 'medium',
    startDate: new Date('2026-10-01T00:00:00.000Z'),
    deadline: new Date('2026-10-31T00:00:00.000Z'),
    memberIds: [],
    totalTasks: 0,
    tasksCompleted: 0,
    progress: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

async function seedUsers() {
  const users = [
    ['client-1', 'client', 'Client One'],
    ['manager-1', 'manager', 'Manager One'],
    ['assignee-1', 'assignee', 'Assignee One'],
    ['reviewer-1', 'reviewer', 'Reviewer One'],
  ];
  for (const [id, role, name] of users) {
    await getAdmin().auth().createUser({ uid: id, email: `${id}@example.test`, password: 'emulator-only-password', displayName: name });
    await getAdmin().auth().setCustomUserClaims(id, { role });
    await db().collection('users').doc(id).set({ id, role, name, email: `${id}@example.test`, createdAt: new Date() });
    const signedIn = await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=emulator-key`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `${id}@example.test`, password: 'emulator-only-password', returnSecureToken: true }),
    });
    const credentials = await signedIn.json();
    assert.ok(credentials.idToken, 'Emulator sign-in must return an ID token');
    tokens.set(id, credentials.idToken);
  }
}

async function main() {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, 'FIRESTORE_EMULATOR_HOST is required');
  assert.ok(process.env.FIREBASE_AUTH_EMULATOR_HOST, 'FIREBASE_AUTH_EMULATOR_HOST is required');
  assert.ok(process.env.FIREBASE_STORAGE_EMULATOR_HOST, 'FIREBASE_STORAGE_EMULATOR_HOST is required');
  assert.ok(process.env.FIREBASE_PROJECT_ID.startsWith('demo-'), 'Use an isolated demo project, never a live project');
  await seedUsers();
  await seedProject('project-flow', 'manager-1', 'client-1');
  await seedProject('project-conflict', 'manager-1', 'client-1');

  const manager = { uid: 'manager-1', role: 'manager', name: 'Manager One', email: 'manager-1@example.test' };
  const assignee = { uid: 'assignee-1', role: 'assignee', name: 'Assignee One', email: 'assignee-1@example.test' };
  const reviewer = { uid: 'reviewer-1', role: 'reviewer', name: 'Reviewer One', email: 'reviewer-1@example.test' };

  const create = await call(tasks.createTask, {
    params: { projectId: 'project-flow' },
    user: manager,
    body: { title: 'Ship workflow smoke test', description: 'A complete lifecycle task', assigneeId: 'assignee-1', reviewerId: 'reviewer-1', startDate: '2026-10-05', deadline: '2026-10-10', priority: 'high', force: false },
  });
  assert.equal(create.statusCode, 201);
  assert.equal(create.body.task.status, 'todo');
  const taskId = create.body.task.id;

  const started = await call(tasks.startTask, { params: { id: taskId }, user: assignee, body: {} });
  assert.equal(started.statusCode, 200);

  const bucket = getAdmin().storage().bucket();
  const storagePath = `projects/project-flow/submissions/${taskId}/deliverable.txt`;
  await bucket.file(storagePath).save(Buffer.from('TaskOrbit emulator deliverable'), {
    metadata: { contentType: 'text/plain', metadata: { ownerId: 'assignee-1', firebaseStorageDownloadTokens: 'workflow-token' } },
  });
  const submitted = await call(tasks.submitTask, {
    params: { id: taskId },
    user: assignee,
    body: { files: [{ name: 'deliverable.txt', storagePath }], note: 'Ready for review.' },
  });
  assert.equal(submitted.statusCode, 201);
  assert.equal(submitted.body.version, 1);

  const opened = await call(tasks.openReview, { params: { id: taskId }, user: reviewer, body: {} });
  assert.equal(opened.statusCode, 200);
  await call(tasks.reviewTask, { params: { id: taskId }, user: reviewer, body: { decision: 'rejected', comments: 'Correct the headings.', submissionId: submitted.body.submissionId } });
  await call(tasks.startTask, { params: { id: taskId }, user: assignee, body: {} });
  const revised = await call(tasks.submitTask, { params: { id: taskId }, user: assignee, body: { files: [{ name: 'deliverable.txt', storagePath }], note: 'Corrected headings.' } });
  assert.equal(revised.body.version, 2);
  await call(tasks.openReview, { params: { id: taskId }, user: reviewer, body: {} });
  const reviewed = await call(tasks.reviewTask, { params: { id: taskId }, user: reviewer, body: { decision: 'approved', comments: '', submissionId: revised.body.submissionId } });
  assert.equal(reviewed.statusCode, 200);

  const finalTask = await db().collection('tasks').doc(taskId).get();
  const finalProject = await db().collection('projects').doc('project-flow').get();
  assert.equal(finalTask.data().status, 'approved');
  assert.equal(finalProject.data().status, 'completed');
  assert.equal(finalProject.data().progress, 100);
  assert.equal(finalTask.data().revisionCount, 1);
  assert.equal((await db().collection('submissions').where('taskId', '==', taskId).get()).size, 2);
  assert.equal((await db().collection('reviews').where('taskId', '==', taskId).get()).size, 2);
  const forbidden = await request(app).post('/api/projects/project-flow/tasks').set('Authorization', `Bearer ${tokens.get('client-1')}`).send({});
  assert.equal(forbidden.status, 403);

  const first = await call(tasks.createTask, {
    params: { projectId: 'project-conflict' }, user: manager,
    body: { title: 'Existing schedule', assigneeId: 'assignee-1', reviewerId: 'reviewer-1', startDate: '2026-10-04', deadline: '2026-10-07', priority: 'medium', force: false },
  });
  assert.equal(first.statusCode, 201);
  const conflict = await call(tasks.createTask, {
    params: { projectId: 'project-conflict' }, user: manager,
    body: { title: 'Overlapping schedule', assigneeId: 'assignee-1', reviewerId: 'reviewer-1', startDate: '2026-10-07', deadline: '2026-10-11', priority: 'medium', force: false },
  });
  assert.equal(conflict.statusCode, 201);
  assert.equal(conflict.body.task, null);
  assert.deepEqual(conflict.body.conflicts, [first.body.task.id]);

  console.log('TaskOrbit emulator HTTP workflow passed: authenticated roles, create → start → submit → reject → revise → resubmit → approve, storage metadata verification, project completion, and conflict detection.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(async () => {
  if (process.env.FIRESTORE_EMULATOR_HOST) await db().terminate().catch(() => {});
});
