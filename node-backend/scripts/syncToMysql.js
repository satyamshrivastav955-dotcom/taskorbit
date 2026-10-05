/* Sync Firestore export to MySQL (idempotent upserts). Usage: npm run sync */
require('dotenv').config();
const mysql = require('mysql2/promise');

const API = process.env.API_BASE_URL || 'http://localhost:4000/api';

async function fetchExport(token) {
  const res = await fetch(`${API}/export/all`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`export failed: ${res.status}`);
  return res.json();
}

async function main() {
  const token = process.env.SYNC_ID_TOKEN || '';
  if (!token) throw new Error('Set SYNC_ID_TOKEN to a manager ID token');
  const data = await fetchExport(token);
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST, port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD, database: process.env.MYSQL_DATABASE,
  });
  for (const p of data.projects || []) {
    await conn.execute(
      'INSERT INTO projects (id, title, description, client_id, manager_id, status, priority, start_date, deadline) VALUES (?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title), status=VALUES(status)',
      [p.id, p.title, p.description, p.client_id, p.manager_id, p.status, p.priority, p.start_date, p.deadline],
    );
    for (const t of p.tasks || []) {
      await conn.execute(
        'INSERT INTO tasks (id, project_id, title, assignee_id, reviewer_id, start_date, deadline, priority, status, revision_count, has_conflict) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title), status=VALUES(status), has_conflict=VALUES(has_conflict)',
        [t.id, p.id, t.title, t.assignee_id, t.reviewer_id, t.start_date, t.deadline, t.priority, t.status, t.revision_count, t.has_conflict],
      );
    }
  }
  await conn.end();
  // eslint-disable-next-line no-console
  console.log(`Synced ${(data.projects || []).length} projects`);
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); }); // eslint-disable-line no-console
}
