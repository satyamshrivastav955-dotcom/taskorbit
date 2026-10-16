const request = require('supertest');

const DEV_SECRET = 'taskorbit-dev-local-secret-2026';

describe('Development Authentication Bypass', () => {
  const originalEnv = { ...process.env };
  let app;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.NODE_ENV = 'development';
    process.env.DEV_AUTH_BYPASS = 'true';
    process.env.DEV_AUTH_SECRET = DEV_SECRET;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const { getDevDb } = require('../src/services/devDb');
    getDevDb().reset();
    app = require('../src/server');
  });

  afterAll(() => {
    process.env = { ...originalEnv };
  });

  test('rejects request with missing ID token when bypass is active but no token provided', async () => {
    const res = await request(app).get('/api/workspace');
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Missing ID token');
  });

  test('allows client to read workspace and create a project in dev mode', async () => {
    const clientToken = `Bearer dev-token:client:${DEV_SECRET}`;

    // Read initial workspace
    const initialWorkspace = await request(app)
      .get('/api/workspace')
      .set('Authorization', clientToken)
      .set('Origin', 'http://localhost:5174');

    expect(initialWorkspace.status).toBe(200);
    expect(initialWorkspace.body.projects).toBeDefined();

    // Create a new project as client
    const createRes = await request(app)
      .post('/api/projects')
      .set('Authorization', clientToken)
      .set('Origin', 'http://localhost:5174')
      .send({
        title: 'Alpha Delivery',
        description: 'Testing local dev flow',
        startDate: '2026-10-20',
        deadline: '2026-11-20',
        priority: 'high',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.title).toBe('Alpha Delivery');
    expect(createRes.body.clientId).toBe('dev-engineer-1');

    // Read workspace again and verify project is present
    const updatedWorkspace = await request(app)
      .get('/api/workspace')
      .set('Authorization', clientToken)
      .set('Origin', 'http://localhost:5174');

    expect(updatedWorkspace.status).toBe(200);
    expect(updatedWorkspace.body.projects.some((p) => p.title === 'Alpha Delivery')).toBe(true);
  });

  test('enforces role-based access: client cannot create manager tasks', async () => {
    const clientToken = `Bearer dev-token:client:${DEV_SECRET}`;

    const res = await request(app)
      .post('/api/projects/proj-123/tasks')
      .set('Authorization', clientToken)
      .set('Origin', 'http://localhost:5174')
      .send({ title: 'Task' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('forbidden');
  });

  test('enforces role-based access: manager can access manager endpoints', async () => {
    const managerToken = `Bearer dev-token:manager:${DEV_SECRET}`;

    const res = await request(app)
      .get('/api/conflicts')
      .set('Authorization', managerToken)
      .set('Origin', 'http://localhost:5174');

    expect(res.status).toBe(200);
  });

  test('rejects dev token if DEV_AUTH_BYPASS is disabled', async () => {
    process.env.DEV_AUTH_BYPASS = 'false';
    jest.resetModules();
    const appWithoutBypass = require('../src/server');

    const clientToken = `Bearer dev-token:client:${DEV_SECRET}`;
    const res = await request(appWithoutBypass)
      .get('/api/workspace')
      .set('Authorization', clientToken)
      .set('Origin', 'http://localhost:5174');

    // Without bypass, dev-token is treated as a normal token and rejected by Firebase verification
    expect(res.status).toBe(401);
  });

  test('rejects dev token in production environment even if DEV_AUTH_BYPASS is set', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DEV_AUTH_BYPASS = 'true';
    jest.resetModules();
    const prodApp = require('../src/server');

    const clientToken = `Bearer dev-token:client:${DEV_SECRET}`;
    const res = await request(prodApp)
      .get('/api/workspace')
      .set('Authorization', clientToken)
      .set('Origin', 'http://localhost:5174');

    expect(res.status).toBe(401);
  });

  test('rejects dev token with invalid or arbitrary role', async () => {
    const invalidRoleToken = `Bearer dev-token:superuser:${DEV_SECRET}`;
    const res = await request(app)
      .get('/api/workspace')
      .set('Authorization', invalidRoleToken)
      .set('Origin', 'http://localhost:5174');

    expect(res.status).toBe(401);
  });

  test('rejects dev token with incorrect secret', async () => {
    const forgedToken = `Bearer dev-token:client:wrong-secret`;
    const res = await request(app)
      .get('/api/workspace')
      .set('Authorization', forgedToken)
      .set('Origin', 'http://localhost:5174');

    expect(res.status).toBe(401);
  });

  test('rejects dev token from untrusted non-local origin', async () => {
    const clientToken = `Bearer dev-token:client:${DEV_SECRET}`;
    const res = await request(app)
      .get('/api/workspace')
      .set('Authorization', clientToken)
      .set('Origin', 'https://malicious-website.com');

    expect(res.status).toBe(401);
  });
});
