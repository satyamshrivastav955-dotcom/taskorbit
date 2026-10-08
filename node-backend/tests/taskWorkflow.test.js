const { HttpError } = require('../src/services/common');

function createFakeFirestore() {
  let nextId = 0;
  const data = new Map();
  const ensureCollection = (name) => {
    if (!data.has(name)) data.set(name, new Map());
    return data.get(name);
  };
  const ref = (collectionName, id) => ({ __kind: 'doc', collectionName, id, path: `${collectionName}/${id}` });
  const snapshot = (documentRef) => {
    const record = ensureCollection(documentRef.collectionName).get(documentRef.id);
    return {
      exists: record !== undefined,
      id: documentRef.id,
      ref: documentRef,
      data: () => record,
    };
  };
  const collection = (name) => ({
    doc: (id) => ref(name, id || `${name}-${++nextId}`),
    where: (field, operator, value) => ({ __kind: 'query', collectionName: name, field, operator, value }),
  });
  const querySnapshot = (query) => {
    const docs = [...ensureCollection(query.collectionName).entries()]
      .filter(([, record]) => query.operator !== '==' || record[query.field] === query.value)
      .map(([id]) => snapshot(ref(query.collectionName, id)));
    return { docs, empty: docs.length === 0 };
  };
  const db = {
    collection,
    runTransaction: async (callback) => callback({
      get: async (target) => target.__kind === 'query' ? querySnapshot(target) : snapshot(target),
      set: (target, value) => { ensureCollection(target.collectionName).set(target.id, { ...value }); },
      update: (target, value) => {
        const previous = ensureCollection(target.collectionName).get(target.id) || {};
        ensureCollection(target.collectionName).set(target.id, { ...previous, ...value });
      },
      delete: (target) => { ensureCollection(target.collectionName).delete(target.id); },
    }),
  };
  db.seed = (name, id, value) => ensureCollection(name).set(id, { ...value });
  db.read = (name, id) => ensureCollection(name).get(id);
  db.all = (name) => [...ensureCollection(name).values()];
  db.clear = () => data.clear();
  return db;
}

const mockDb = createFakeFirestore();
jest.mock('../src/config/firebase', () => ({ db: () => mockDb }));
jest.mock('../src/services/files', () => ({ verifyFiles: jest.fn(async () => [{ name: 'deliverable.pdf', url: 'https://example.test/deliverable', storagePath: 'test-deliverable', size: 42 }]) }));

const tasks = require('../src/controllers/tasks');

function seedTaskCreationData() {
  mockDb.seed('projects', 'project-1', {
    title: 'Project',
    clientId: 'client-1',
    managerId: 'manager-1',
    startDate: new Date('2026-10-01T00:00:00.000Z'),
    deadline: new Date('2026-10-31T00:00:00.000Z'),
    status: 'submitted',
  });
  mockDb.seed('users', 'assignee-1', { role: 'assignee', name: 'Assignee' });
  mockDb.seed('users', 'reviewer-1', { role: 'reviewer', name: 'Reviewer' });
  mockDb.seed('requirements', 'requirement-1', { projectId: 'project-1', title: 'Requirement' });
}

function responseSpy() {
  return {
    status: jest.fn(function setStatus(status) { this.statusCode = status; return this; }),
    json: jest.fn(function sendJson(value) { this.body = value; return this; }),
  };
}

beforeEach(() => {
  mockDb.clear();
  seedTaskCreationData();
});

test('task creation persists selected requirement links', async () => {
  const res = responseSpy();
  await tasks.createTask({
    params: { projectId: 'project-1' },
    body: {
      title: 'Implement requirement',
      description: '',
      assigneeId: 'assignee-1',
      reviewerId: 'reviewer-1',
      startDate: '2026-10-05',
      deadline: '2026-10-10',
      priority: 'medium',
      requirementIds: ['requirement-1'],
      force: false,
    },
    user: { uid: 'manager-1', role: 'manager', name: 'Manager' },
  }, res);

  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.body.task.requirementIds).toEqual(['requirement-1']);
  expect(mockDb.read('tasks', res.body.task.id).requirementIds).toEqual(['requirement-1']);
});

test('task creation rejects a non-boolean conflict override', async () => {
  const res = responseSpy();
  await expect(tasks.createTask({
    params: { projectId: 'project-1' },
    body: {
      title: 'Unsafe override',
      assigneeId: 'assignee-1',
      reviewerId: 'reviewer-1',
      startDate: '2026-10-05',
      deadline: '2026-10-10',
      priority: 'medium',
      force: 'false',
    },
    user: { uid: 'manager-1', role: 'manager', name: 'Manager' },
  }, res)).rejects.toMatchObject({
    status: 400,
    code: 'invalid-argument',
    message: 'force must be a boolean',
  });
  // The handler sets the success status before awaiting its mutation; the
  // Express error middleware replaces it with the 400 response.
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).not.toHaveBeenCalled();
});

test('task creation rejects requirements from another project', async () => {
  mockDb.seed('requirements', 'other-requirement', { projectId: 'project-2', title: 'Other project' });
  const res = responseSpy();
  await expect(tasks.createTask({
    params: { projectId: 'project-1' },
    body: {
      title: 'Cross-project link',
      assigneeId: 'assignee-1',
      reviewerId: 'reviewer-1',
      startDate: '2026-10-05',
      deadline: '2026-10-10',
      priority: 'medium',
      requirementIds: ['other-requirement'],
    },
    user: { uid: 'manager-1', role: 'manager', name: 'Manager' },
  }, res)).rejects.toBeInstanceOf(HttpError);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).not.toHaveBeenCalled();
});

const manager = { uid: 'manager-1', role: 'manager', name: 'Manager' };
const assignee = { uid: 'assignee-1', role: 'assignee', name: 'Assignee' };
const reviewer = { uid: 'reviewer-1', role: 'reviewer', name: 'Reviewer' };

async function invoke(handler, id, user, body = {}) {
  const res = responseSpy();
  await handler({ params: { id, projectId: 'project-1' }, user, body }, res);
  return res.body;
}

async function createTask(overrides = {}) {
  return invoke(tasks.createTask, undefined, manager, {
    title: 'Deliver project', assigneeId: assignee.uid, reviewerId: reviewer.uid,
    startDate: '2026-10-05', deadline: '2026-10-10', priority: 'medium', ...overrides,
  });
}

test('rejection, resubmission and approval persist versions, notifications and project completion', async () => {
  const { task } = await createTask();
  const id = task.id;
  await invoke(tasks.startTask, id, assignee);
  const first = await invoke(tasks.submitTask, id, assignee, { files: [{ name: 'deliverable.pdf', storagePath: 'test-deliverable' }], note: 'First version' });
  expect(first.version).toBe(1);
  await invoke(tasks.openReview, id, reviewer);
  await expect(invoke(tasks.reviewTask, id, reviewer, { decision: 'rejected', comments: ' ' })).rejects.toMatchObject({ status: 400 });
  expect(mockDb.read('tasks', id).status).toBe('in_review');
  await invoke(tasks.reviewTask, id, reviewer, { decision: 'rejected', comments: 'Correct the headings.', submissionId: first.submissionId });
  expect(mockDb.read('tasks', id)).toMatchObject({ status: 'revision', revisionCount: 1 });
  await invoke(tasks.startTask, id, assignee);
  const second = await invoke(tasks.submitTask, id, assignee, { files: [{ name: 'deliverable.pdf', storagePath: 'test-deliverable' }], note: 'Corrected headings' });
  expect(second.version).toBe(2);
  expect(second.submissionId).not.toBe(first.submissionId);
  await invoke(tasks.openReview, id, reviewer);
  await expect(invoke(tasks.reviewTask, id, reviewer, { decision: 'approved', comments: '', submissionId: first.submissionId })).rejects.toMatchObject({ status: 409 });
  await invoke(tasks.reviewTask, id, reviewer, { decision: 'approved', comments: '', submissionId: second.submissionId });
  expect(mockDb.read('tasks', id)).toMatchObject({ status: 'approved', revisionCount: 1, conflictWith: [] });
  expect(mockDb.read('projects', 'project-1')).toMatchObject({ status: 'completed', progress: 100, tasksCompleted: 1, totalTasks: 1 });
  expect(mockDb.all('submissions').map((submission) => submission.version)).toEqual([1, 2]);
  expect(mockDb.all('reviews').map((review) => review.decision)).toEqual(['rejected', 'approved']);
  expect(mockDb.all('notifications')).toEqual(expect.arrayContaining([
    expect.objectContaining({ userId: reviewer.uid, type: 'submission' }),
    expect.objectContaining({ userId: assignee.uid, type: 'revision' }),
    expect.objectContaining({ userId: 'client-1', message: 'Project completed: Project' }),
  ]));
});

test('the wrong assignee or reviewer cannot mutate another person’s task', async () => {
  const { task } = await createTask();
  await expect(invoke(tasks.startTask, task.id, { uid: 'other-assignee', role: 'assignee' })).rejects.toMatchObject({ status: 403 });
  expect(mockDb.read('tasks', task.id).status).toBe('todo');
  await expect(invoke(tasks.openReview, task.id, { uid: 'other-reviewer', role: 'reviewer' })).rejects.toMatchObject({ status: 403 });
  await expect(invoke(tasks.reviewTask, task.id, reviewer, { decision: 'approved', comments: '' })).rejects.toMatchObject({ status: 409 });
});

test('conflict preview writes no task, forced creation and rescheduling update both sides', async () => {
  const first = await createTask({ title: 'First task' });
  const preview = await createTask({ title: 'Overlapping task', startDate: '2026-10-10', deadline: '2026-10-12' });
  expect(preview.task).toBeNull();
  expect(preview.conflicts).toEqual([first.task.id]);
  expect(mockDb.all('tasks')).toHaveLength(1);
  const forced = await createTask({ title: 'Overlapping task', startDate: '2026-10-10', deadline: '2026-10-12', force: true });
  expect(mockDb.read('tasks', first.task.id).conflictWith).toEqual([forced.task.id]);
  expect(mockDb.read('tasks', forced.task.id).conflictWith).toEqual([first.task.id]);
  await invoke(tasks.updateTask, forced.task.id, manager, { startDate: '2026-10-11', deadline: '2026-10-12' });
  expect(mockDb.read('tasks', first.task.id).conflictWith).toEqual([]);
  expect(mockDb.read('tasks', forced.task.id).conflictWith).toEqual([]);
});

test('approval clears overlapping work while project completion waits for all tasks', async () => {
  const first = await createTask();
  const second = await createTask({ title: 'Second task', force: true });
  await invoke(tasks.startTask, first.task.id, assignee);
  await invoke(tasks.submitTask, first.task.id, assignee, { files: [{ name: 'deliverable.pdf', storagePath: 'test-deliverable' }] });
  await invoke(tasks.openReview, first.task.id, reviewer);
  await invoke(tasks.reviewTask, first.task.id, reviewer, { decision: 'approved', comments: '' });
  expect(mockDb.read('tasks', second.task.id).conflictWith).toEqual([]);
  expect(mockDb.read('projects', 'project-1')).toMatchObject({ status: 'active', progress: 50 });
});
