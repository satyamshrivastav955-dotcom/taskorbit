/* One-off backfill: recompute tasks.conflictWith for existing data.
 * Seed writes tasks directly (bypassing the API), so run this once after seed.
 * Usage: node scripts/backfillConflicts.js */
require('dotenv').config();
const { getAdmin } = require('../src/config/firebase');
const { findConflicts } = require('../src/services/conflictService');

async function main() {
  const fs = getAdmin().firestore();
  const snap = await fs.collection('tasks').get();
  const tasks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  let pairs = 0;
  for (const t of tasks) {
    // Approved tasks never carry conflicts (spec: removed on approval).
    const conflicts = t.status === 'approved' ? [] : findConflicts(t, tasks);
    await fs.collection('tasks').doc(t.id).update({ conflictWith: conflicts });
    pairs += conflicts.length;
  }
  // eslint-disable-next-line no-console
  console.log(`Updated ${tasks.length} tasks, ${pairs / 2} conflict pairs`);
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); }); // eslint-disable-line no-console
}
