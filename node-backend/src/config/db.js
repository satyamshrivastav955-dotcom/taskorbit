const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { getDevDb } = require('../services/devDb');

// Database provider for TaskOrbit Express backend.
// In development, uses the in-memory document store (devDb) with optional
// persistent sync to Supabase PostgreSQL.
function db() {
  return getDevDb();
}

module.exports = { db, getDevDb };
