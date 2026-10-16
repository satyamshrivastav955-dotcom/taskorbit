const request = require('supertest');

describe('Supabase backend configuration and connectivity', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env.SUPABASE_URL = '';
    process.env.SUPABASE_SERVICE_ROLE_KEY = '';
    process.env.SUPABASE_ANON_KEY = '';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('isSupabaseConfigured returns false when env vars are missing or placeholders', () => {
    const { isSupabaseConfigured, getSupabase } = require('../src/config/supabase');
    expect(isSupabaseConfigured()).toBe(false);
    expect(() => getSupabase()).toThrow(/Supabase is not configured/);

    process.env.SUPABASE_URL = 'placeholder';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'placeholder';
    expect(isSupabaseConfigured()).toBe(false);

    process.env.SUPABASE_URL = 'https://your-project-id.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'your-supabase-service-role-key';
    expect(isSupabaseConfigured()).toBe(false);
  });

  test('isSupabaseConfigured returns true when valid url and key are provided', () => {
    process.env.SUPABASE_URL = 'https://abcxyz.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'valid-service-role-key-test';
    const { isSupabaseConfigured, getSupabase } = require('../src/config/supabase');
    expect(isSupabaseConfigured()).toBe(true);
    const client = getSupabase({ requireServiceRole: true });
    expect(client).toBeDefined();
    expect(typeof client.from).toBe('function');
  });

  test('/api/supabase/status endpoint reports status accurately without breaking app', async () => {
    const app = require('../src/server');
    const res = await request(app).get('/api/supabase/status');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.configured).toBe(false);
  });

  test('/api/supabase/connectivity reports unconfigured status safely when no credentials present', async () => {
    const app = require('../src/server');
    const res = await request(app).get('/api/supabase/connectivity');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.configured).toBe(false);
    expect(res.body.connected).toBe(false);
    expect(res.body.message).toContain('not configured');
  });

  test('sync utility helpers format dates properly', () => {
    const { toDateOnly, toIso } = require('../scripts/syncToSupabase');
    expect(toDateOnly('2026-10-15T12:00:00Z')).toBe('2026-10-15');
    expect(toDateOnly(new Date('2026-10-20'))).toBe('2026-10-20');
    expect(toDateOnly(null)).toBeNull();
    expect(toIso('2026-10-15T00:00:00.000Z')).toBe('2026-10-15T00:00:00.000Z');
  });
});
