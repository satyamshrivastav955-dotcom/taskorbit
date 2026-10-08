const request = require('supertest');
const mockUserDoc = {
  set: jest.fn(async () => undefined),
};
const mockDb = jest.fn(() => ({
  collection: jest.fn((name) => {
    if (name === 'users') return { doc: jest.fn(() => mockUserDoc) };
    if (name === 'activityLogs') return { add: jest.fn(async () => undefined) };
    throw new Error(`Unexpected collection: ${name}`);
  }),
}));
const mockAuth = {
  verifyIdToken: jest.fn(async (token) => {
    if (token === 'invalid') throw new Error('Invalid token');
    return { uid: `${token}-1`, role: token, email: `${token}@example.test` };
  }),
  createUser: jest.fn(async ({ email }) => ({ uid: `new-${email}` })),
  setCustomUserClaims: jest.fn(async () => undefined),
  deleteUser: jest.fn(async () => undefined),
};
jest.mock('../src/config/firebase', () => ({ db: mockDb, getAdmin: () => ({ auth: () => mockAuth }) }));
const app = require('../src/server');

beforeEach(() => mockDb.mockClear());

test('signed-out requests cannot fetch a workspace', async () => {
  const result = await request(app).get('/api/workspace');
  expect(result.status).toBe(401);
  expect(mockDb).not.toHaveBeenCalled();
});

test('invalid tokens do not reach the domain handlers', async () => {
  const result = await request(app).get('/api/workspace').set('Authorization', 'Bearer invalid');
  expect(result.status).toBe(401);
  expect(mockDb).not.toHaveBeenCalled();
});

test.each(['client', 'assignee', 'reviewer'])('%s cannot create or reassign manager tasks', async (role) => {
  const created = await request(app).post('/api/projects/project-1/tasks').set('Authorization', `Bearer ${role}`).send({});
  const reassigned = await request(app).post('/api/tasks/task-1/reassign').set('Authorization', `Bearer ${role}`).send({});
  expect(created.status).toBe(403);
  expect(reassigned.status).toBe(403);
  expect(mockDb).not.toHaveBeenCalled();
});

test.each(['manager', 'assignee', 'reviewer'])('public registration can choose the %s workspace role', async (role) => {
  const result = await request(app).post('/api/auth/register').send({ name: 'Test User', email: `${role}@example.test`, password: 'test-only-password', role });
  expect(result.status).toBe(201);
  expect(result.body.role).toBe(role);
  expect(mockAuth.setCustomUserClaims).toHaveBeenCalledWith(expect.stringContaining(`new-${role}@example.test`), { role });
});

test('manager provisioning remains limited to team roles', async () => {
  const client = await request(app)
    .post('/api/users')
    .set('Authorization', 'Bearer manager')
    .send({ name: 'Client User', email: 'client@example.test', password: 'test-only-password', role: 'client' });
  const manager = await request(app)
    .post('/api/users')
    .set('Authorization', 'Bearer manager')
    .send({ name: 'Manager User', email: 'manager@example.test', password: 'test-only-password', role: 'manager' });
  expect(client.status).toBe(403);
  expect(manager.status).toBe(403);
});
