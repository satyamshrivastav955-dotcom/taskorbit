const mockActivityAdd = jest.fn(async () => ({ id: 'activity-1' }));
const mockDb = {
  collection: jest.fn((name) => {
    if (name === 'users') return { doc: jest.fn(() => ({ get: jest.fn(async () => ({ exists: false })) })) };
    if (name === 'projects') return { doc: jest.fn(() => ({ get: jest.fn(async () => ({ exists: true, data: () => ({ clientId: 'client-1', managerId: 'manager-1', memberIds: [] }) })) })) };
    if (name === 'activityLogs') return { add: mockActivityAdd };
    throw new Error(`Unexpected collection: ${name}`);
  }),
};

jest.mock('../src/config/firebase', () => ({ db: () => mockDb }));

const { log } = require('../src/controllers/activity');

function responseSpy() {
  return {
    status: jest.fn(function setStatus(status) { this.statusCode = status; return this; }),
    json: jest.fn(function sendJson(value) { this.body = value; return this; }),
  };
}

const user = { uid: 'client-1', role: 'client', email: 'client@example.com' };

test('activity logging rejects non-string and missing identity fields', async () => {
  const wrongType = responseSpy();
  await log({ body: { projectId: 'project-1', action: { bad: true }, targetType: 'task', targetId: 'task-1' }, user }, wrongType);
  expect(wrongType.status).toHaveBeenCalledWith(400);
  expect(wrongType.body.error.code).toBe('invalid-argument');

  const missingTarget = responseSpy();
  await log({ body: { projectId: 'project-1', action: 'kept overlap', targetType: 'task' }, user }, missingTarget);
  expect(missingTarget.status).toHaveBeenCalledWith(400);
  expect(mockActivityAdd).not.toHaveBeenCalled();
});

test('activity logging trims and persists validated fields for an accessible project', async () => {
  mockActivityAdd.mockClear();
  const res = responseSpy();
  await log({
    body: { projectId: ' project-1 ', action: ' kept overlap ', targetType: ' task ', targetId: ' task-1 ' },
    user,
  }, res);

  expect(res.status).toHaveBeenCalledWith(201);
  expect(mockActivityAdd).toHaveBeenCalledWith(expect.objectContaining({
    projectId: 'project-1',
    action: 'kept overlap',
    targetType: 'task',
    targetId: 'task-1',
  }));
});
