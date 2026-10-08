jest.mock('dotenv', () => ({ config: jest.fn() }));
const originalEnv = { ...process.env };
afterEach(() => { process.env = { ...originalEnv }; jest.resetModules(); });

function mockAdmin(initialize) {
  const admin = { apps: [], credential: { cert: jest.fn(), applicationDefault: jest.fn(() => ({})) }, firestore: jest.fn() };
  admin.initializeApp = jest.fn(initialize || (() => { admin.apps.push({}); }));
  jest.doMock('firebase-admin', () => admin);
  return admin;
}

test('emulators initialize without reading live service-account credentials', async () => {
  process.env.FIREBASE_PROJECT_ID = 'demo-taskorbit';
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8085';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
  process.env.GOOGLE_APPLICATION_CREDENTIALS = './must-not-read-live-credentials.json';
  const admin = mockAdmin();
  const { getAdmin } = require('../src/config/firebase');
  expect(getAdmin()).toBe(admin);
  expect(admin.credential.cert).not.toHaveBeenCalled();
  expect(process.env.GOOGLE_APPLICATION_CREDENTIALS).toBe('./must-not-read-live-credentials.json');
  const options = admin.initializeApp.mock.calls[0][0];
  expect(options.projectId).toBe('demo-taskorbit');
  await expect(options.credential.getAccessToken()).resolves.toMatchObject({ access_token: 'owner' });
});

test('failed initialization is not cached as a valid Firebase app', () => {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8085';
  const admin = mockAdmin(() => { throw new Error('Initialization failed'); });
  const { getAdmin } = require('../src/config/firebase');
  expect(() => getAdmin()).toThrow('Initialization failed');
  expect(() => getAdmin()).toThrow('Initialization failed');
  expect(admin.initializeApp).toHaveBeenCalledTimes(2);
});
