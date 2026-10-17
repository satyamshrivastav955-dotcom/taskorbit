const request = require('supertest');
const { createFakeFirestore } = require('./fakeFirestore');
const mockDb = createFakeFirestore();
const mockAuth = {
  verifyIdToken: async (token) => {
    if (token === 'invalid') throw new Error('Invalid token');
    return { uid: token, role: token, email: `${token}@test.test` };
  },
};
jest.mock('../src/config/firebase', () => ({
  getAdmin: () => ({ auth: () => mockAuth, apps: [] }),
  db: () => mockDb,
}));
const app = require('../src/server');

const manager = { uid: 'manager', role: 'manager', email: 'manager@test.test' };
const assignee = { uid: 'assignee', role: 'assignee', email: 'assignee@test.test' };

function seed(notes) {
  for (const n of notes) mockDb.seed('notifications', n.id, { ...n, createdAt: n.createdAt || new Date() });
}

beforeEach(() => {
  mockDb.clear();
});

test('signed-out requests cannot mark a notification as read', async () => {
  const res = await request(app).patch('/api/notifications/n-1/read').send({});
  expect(res.status).toBe(401);
});

test('mark own notification as read updates Firestore only after success', async () => {
  seed([{ id: 'n-1', userId: 'manager', message: 'Task submitted', type: 'submission', link: '/reviewer/reviews/t-1', read: false }]);
  const res = await request(app).patch('/api/notifications/n-1/read').set('Authorization', 'Bearer manager').send({});
  expect(res.status).toBe(200);
  expect(res.body.ok).toBe(true);
  expect(mockDb.read('notifications', 'n-1').read).toBe(true);
});

test('marking an already-read notification is a no-op success', async () => {
  seed([{ id: 'n-1', userId: 'manager', message: 'Task submitted', type: 'submission', link: '/x', read: true }]);
  const res = await request(app).patch('/api/notifications/n-1/read').set('Authorization', 'Bearer manager').send({});
  expect(res.status).toBe(200);
  expect(mockDb.read('notifications', 'n-1').read).toBe(true);
});

test('a user cannot mark another user\'s notification as read', async () => {
  seed([{ id: 'n-1', userId: 'assignee', message: 'Task submitted', type: 'submission', link: '/x', read: false }]);
  const res = await request(app).patch('/api/notifications/n-1/read').set('Authorization', 'Bearer manager').send({});
  expect(res.status).toBe(403);
  expect(mockDb.read('notifications', 'n-1').read).toBe(false);
});

test('a missing notification returns 404', async () => {
  const res = await request(app).patch('/api/notifications/does-not-exist/read').set('Authorization', 'Bearer manager').send({});
  expect(res.status).toBe(404);
});

test('mark all unread notifications as read for the caller only', async () => {
  seed([
    { id: 'n-1', userId: 'manager', message: 'a', type: 'submission', link: '/x', read: false },
    { id: 'n-2', userId: 'manager', message: 'b', type: 'submission', link: '/x', read: false },
    { id: 'n-3', userId: 'manager', message: 'c', type: 'submission', link: '/x', read: true },
    { id: 'n-4', userId: 'assignee', message: 'd', type: 'submission', link: '/x', read: false },
  ]);
  const res = await request(app).post('/api/notifications/read-all').set('Authorization', 'Bearer manager').send({});
  expect(res.status).toBe(200);
  expect(res.body.ok).toBe(true);
  expect(res.body.count).toBe(2);
  expect(mockDb.read('notifications', 'n-1').read).toBe(true);
  expect(mockDb.read('notifications', 'n-2').read).toBe(true);
  expect(mockDb.read('notifications', 'n-3').read).toBe(true);
  expect(mockDb.read('notifications', 'n-4').read).toBe(false);
});

test('mark all with nothing unread returns count zero', async () => {
  seed([{ id: 'n-1', userId: 'manager', message: 'a', type: 'submission', link: '/x', read: true }]);
  const res = await request(app).post('/api/notifications/read-all').set('Authorization', 'Bearer manager').send({});
  expect(res.status).toBe(200);
  expect(res.body.count).toBe(0);
});
