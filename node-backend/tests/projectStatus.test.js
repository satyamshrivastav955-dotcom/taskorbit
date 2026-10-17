const assert = require('node:assert/strict');
const { createFakeFirestore } = require('./fakeFirestore');
const mockDb = createFakeFirestore();
jest.mock('../src/config/firebase', () => ({ db: () => mockDb }));
jest.mock('../src/services/files', () => ({ verifyFiles: jest.fn(async () => [{ name: 'deliverable.pdf', url: 'https://example.test/d', storagePath: 'test-deliverable', size: 42 }]) }));
const projects = require('../src/controllers/projects');
const tasks = require('../src/controllers/tasks');

function responseSpy() {
  return {
    status: jest.fn(function setStatus(status) { this.statusCode = status; return this; }),
    json: jest.fn(function sendJson(value) { this.body = value; return this; }),
  };
}

async function invoke(handler, params, user, body = {}) {
  const res = responseSpy();
  await handler({ params, user, body }, res);
  return res;
}

const manager = { uid: 'manager-1', role: 'manager', name: 'Manager' };
const assignee = { uid: 'assignee-1', role: 'assignee', name: 'Assignee' };
const reviewer = { uid: 'reviewer-1', role: 'reviewer', name: 'Reviewer' };

beforeEach(() => {
  mockDb.clear();
  mockDb.seed('users', assignee.uid, { role: 'assignee', name: 'Assignee' });
  mockDb.seed('users', reviewer.uid, { role: 'reviewer', name: 'Reviewer' });
});

test('a newly created project is draft, unassigned, and has zero progress', async () => {
  const res = responseSpy();
  await projects.create({
    params: {},
    body: { title: 'New project', description: 'x', startDate: '2026-10-01', deadline: '2026-11-01', priority: 'medium' },
    user: { uid: 'client-1', role: 'client', name: 'Client' },
  }, res);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.body.status).toBe('draft');
  expect(res.body.managerId).toBeNull();
  expect(res.body.progress).toBe(0);
  expect(res.body.totalTasks).toBe(0);
  const stored = mockDb.read('projects', res.body.id);
  expect(stored.status).toBe('draft');
  expect(stored.managerId).toBeNull();
  expect(stored.totalTasks).toBe(0);
});

test('project moves draft -> active when the first task is created', async () => {
  const pres = responseSpy();
  await projects.create({
    params: {},
    body: { title: 'P', description: '', startDate: '2026-10-01', deadline: '2026-11-01', priority: 'medium' },
    user: { uid: 'client-1', role: 'client', name: 'Client' },
  }, pres);
  const projectId = pres.body.id;
  expect(mockDb.read('projects', projectId).status).toBe('draft');

  const tres = responseSpy();
  await tasks.createTask({
    params: { projectId },
    body: { title: 'Task', description: '', assigneeId: assignee.uid, reviewerId: reviewer.uid, startDate: '2026-10-05', deadline: '2026-10-10', priority: 'medium', force: false },
    user: manager,
  }, tres);
  expect(mockDb.read('projects', projectId).status).toBe('active');
  expect(mockDb.read('projects', projectId).progress).toBe(0);
});

test('project is completed with 100% progress only when every task is approved', async () => {
  const pres = responseSpy();
  await projects.create({
    params: {},
    body: { title: 'P', description: '', startDate: '2026-10-01', deadline: '2026-11-01', priority: 'medium' },
    user: { uid: 'client-1', role: 'client', name: 'Client' },
  }, pres);
  const projectId = pres.body.id;

  const taskRes = responseSpy();
  await tasks.createTask({
    params: { projectId },
    body: { title: 'Task', description: '', assigneeId: assignee.uid, reviewerId: reviewer.uid, startDate: '2026-10-05', deadline: '2026-10-10', priority: 'medium', force: false },
    user: manager,
  }, taskRes);
  const taskId = taskRes.body.task.id;

  await invoke(tasks.startTask, { id: taskId, projectId }, assignee, {});
  await invoke(tasks.submitTask, { id: taskId, projectId }, assignee, { files: [{ name: 'd.pdf', storagePath: 'x' }], note: 'n' });
  await invoke(tasks.openReview, { id: taskId, projectId }, reviewer, {});
  await invoke(tasks.reviewTask, { id: taskId, projectId }, reviewer, { decision: 'approved', comments: '' });

  const proj = mockDb.read('projects', projectId);
  expect(proj.status).toBe('completed');
  expect(proj.progress).toBe(100);
  expect(mockDb.read('tasks', taskId).status).toBe('approved');
});

test('a project is not completed or marked submitted when not all tasks are approved', async () => {
  const pres = responseSpy();
  await projects.create({
    params: {},
    body: { title: 'P', description: '', startDate: '2026-10-01', deadline: '2026-11-01', priority: 'medium' },
    user: { uid: 'client-1', role: 'client', name: 'Client' },
  }, pres);
  const projectId = pres.body.id;

  const first = responseSpy();
  await tasks.createTask({
    params: { projectId },
    body: { title: 'Approved task', description: '', assigneeId: assignee.uid, reviewerId: reviewer.uid, startDate: '2026-10-05', deadline: '2026-10-10', priority: 'medium', force: false },
    user: manager,
  }, first);
  const second = responseSpy();
  await tasks.createTask({
    params: { projectId },
    body: { title: 'Pending task', description: '', assigneeId: assignee.uid, reviewerId: reviewer.uid, startDate: '2026-10-05', deadline: '2026-10-10', priority: 'medium', force: true },
    user: manager,
  }, second);

  await invoke(tasks.startTask, { id: first.body.task.id, projectId }, assignee, {});
  await invoke(tasks.submitTask, { id: first.body.task.id, projectId }, assignee, { files: [{ name: 'd.pdf', storagePath: 'x' }], note: 'n' });
  await invoke(tasks.openReview, { id: first.body.task.id, projectId }, reviewer, {});
  await invoke(tasks.reviewTask, { id: first.body.task.id, projectId }, reviewer, { decision: 'approved', comments: '' });

  const proj = mockDb.read('projects', projectId);
  expect(proj.status).toBe('active');
  expect(proj.progress).toBe(50);
});
