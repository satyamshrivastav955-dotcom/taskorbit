const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');

let serviceRoleClient = null;
let anonClient = null;

function isSupabaseConfigured() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    url !== 'placeholder' &&
    !url.includes('your-project-id') &&
    key &&
    key !== 'placeholder' &&
    !key.includes('your-supabase-')
  );
}

function getSupabase({ requireServiceRole = false } = {}) {
  const url = process.env.SUPABASE_URL;
  const key = requireServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

  if (!url || !key || url === 'placeholder' || key === 'placeholder' || key.includes('your-supabase-')) {
    throw new Error(
      `Supabase is not configured. Please set SUPABASE_URL and ${
        requireServiceRole ? 'SUPABASE_SERVICE_ROLE_KEY' : 'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY'
      } in node-backend/.env`
    );
  }

  if (requireServiceRole) {
    if (!serviceRoleClient) {
      serviceRoleClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
    return serviceRoleClient;
  }

  if (!anonClient) {
    anonClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return anonClient;
}

/**
 * Performs a live, non-destructive read to verify genuine connectivity to Supabase.
 * Does NOT assume configured: true proves connectivity.
 */
async function checkSupabaseConnectivity() {
  if (!isSupabaseConfigured()) {
    return {
      ok: true,
      configured: false,
      connected: false,
      message: 'Supabase is not configured (missing or placeholder environment variables in node-backend/.env)',
    };
  }

  const startTime = Date.now();
  try {
    const client = getSupabase({ requireServiceRole: true });
    const { error, status } = await client
      .from('projects')
      .select('id')
      .limit(1);

    const latencyMs = Date.now() - startTime;

    if (error) {
      // PGRST205 or 42P01: Table does not exist in schema cache, but connection and auth succeeded!
      if (error.code === 'PGRST205' || error.code === '42P01') {
        return {
          ok: true,
          configured: true,
          connected: true,
          schemaDeployed: false,
          latencyMs,
          httpStatus: status,
          message: 'Successfully reached Supabase PostgREST, but public.projects table is not yet created in the schema cache. Please execute supabase/schema.sql in the Supabase SQL Editor.',
        };
      }
      return {
        ok: false,
        configured: true,
        connected: false,
        latencyMs,
        httpStatus: status,
        error: error.message,
        code: error.code,
      };
    }

    return {
      ok: true,
      configured: true,
      connected: true,
      schemaDeployed: true,
      latencyMs,
      httpStatus: status,
      message: 'Successfully connected to Supabase PostgreSQL and verified schema accessibility.',
    };
  } catch (err) {
    return {
      ok: false,
      configured: true,
      connected: false,
      latencyMs: Date.now() - startTime,
      error: err.message,
    };
  }
}

module.exports = {
  getSupabase,
  isSupabaseConfigured,
  checkSupabaseConnectivity,
};
