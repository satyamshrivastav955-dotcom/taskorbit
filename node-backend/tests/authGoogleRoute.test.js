const request = require('supertest');

const mockUserDoc = {
  get: jest.fn(async () => ({ exists: false })),
  set: jest.fn(async () => undefined),
};
const mockFirestore = {
  collection: jest.fn((name) => {
    if (name === 'users') return { doc: jest.fn(() => mockUserDoc) };
    throw new Error(`Unexpected collection: ${name}`);
  }),
};
const mockAuth = {
  verifyIdToken: jest.fn(async () => ({ uid: 'google-user', email: 'google@example.com' })),
  getUser: jest.fn(async () => ({ displayName: 'Google User', email: 'google@example.com' })),
  setCustomUserClaims: jest.fn(async () => undefined),
};

jest.mock('../src/config/firebase', () => ({
  db: () => mockFirestore,
  getAdmin: () => ({ auth: () => mockAuth }),
}));

const app = require('../src/server');

test('first-time Google users can reach provisioning without a role claim', async () => {
  const response = await request(app)
    .post('/api/auth/google')
    .set('Authorization', 'Bearer google-id-token')
    .send({});

  expect(response.status).toBe(201);
  expect(response.body).toEqual({ role: 'client', name: 'Google User' });
  expect(mockAuth.setCustomUserClaims).toHaveBeenCalledWith('google-user', { role: 'client' });
  expect(mockUserDoc.set).toHaveBeenCalledWith(expect.objectContaining({
    email: 'google@example.com',
    role: 'client',
  }));
});

test('first-time Google users receive the selected workspace role', async () => {
  const response = await request(app)
    .post('/api/auth/google')
    .set('Authorization', 'Bearer google-id-token')
    .send({ role: 'reviewer' });

  expect(response.status).toBe(201);
  expect(response.body).toEqual({ role: 'reviewer', name: 'Google User' });
  expect(mockAuth.setCustomUserClaims).toHaveBeenCalledWith('google-user', { role: 'reviewer' });
  expect(mockUserDoc.set).toHaveBeenCalledWith(expect.objectContaining({ role: 'reviewer' }));
});
