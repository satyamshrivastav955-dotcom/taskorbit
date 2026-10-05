const { db } = require('../config/firebase');
const { err } = require('../middleware/auth');

function flatTimestamp(v) {
  if (!v) return null;
  if (typeof v.toDate === 'function') return v.toDate().toISOString();
  return new Date(v).toISOString();
}

async function exportOne(projectId) {
  const pSnap = await db().collection('projects').doc(projectId).get();
  if (!pSnap.exists) return null;
  const project = { id: pSnap.id, ...pSnap.data() };
  const tasks = (await db().collection('tasks').where('projectId', '==', projectId).get()).docs.map((d) => ({ id: d.id, ...d.data() }));
  const outTasks = [];
  for (const t of tasks) {
    const subs = (await db().collection('submissions').where('taskId', '==', t.id).get()).docs.map((d) => ({ id: d.id, ...d.data() }));
    const revs = (await db().collection('reviews').where('taskId', '==', t.id).get()).docs.map((d) => ({ id: d.id, ...d.data() }));
    outTasks.push({
      id: t.id, title: t.title, assignee_id: t.assigneeId, reviewer_id: t.reviewerId,
      start_date: flatTimestamp(t.startDate)?.slice(0, 10), deadline: flatTimestamp(t.deadline)?.slice(0, 10),
      priority: t.priority, status: t.status, revision_count: t.revisionCount || 0,
      has_conflict: (t.conflictWith || []).length > 0 ? 1 : 0,
      submissions: subs.length, reviews: revs.map((r) => ({ decision: r.decision, reviewer_id: r.reviewerId, comments: r.comments })),
    });
  }
  return {
    id: project.id, title: project.title, description: project.description,
    client_id: project.clientId, manager_id: project.managerId, status: project.status, priority: project.priority,
    start_date: flatTimestamp(project.startDate)?.slice(0, 10), deadline: flatTimestamp(project.deadline)?.slice(0, 10),
    tasks: outTasks,
  };
}

async function report(req, res) {
  const data = await exportOne(req.params.projectId);
  if (!data) return err(res, 404, 'not-found', 'Project not found');
  return res.json(data);
}

async function exportAll(req, res) {
  const snap = await db().collection('projects').get();
  const projects = [];
  for (const d of snap.docs) {
    const one = await exportOne(d.id);
    if (one) projects.push(one);
  }
  return res.json({ projects });
}

module.exports = { exportOne, report, exportAll };
