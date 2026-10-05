const { db } = require('../config/firebase');
const { findConflicts, overlapRange } = require('../services/conflictService');
const { err } = require('../middleware/auth');

function toDate(v) {
  return v instanceof Date ? v : new Date(v);
}

async function logActivity(projectId, actorId, actorName, action, targetType, targetId) {
  await db().collection('activityLogs').add({
    projectId, actorId, actorName, action, targetType, targetId, createdAt: new Date(),
  });
}

async function notify(userId, message, type, link) {
  await db().collection('notifications').add({
    userId, message, type, link, read: false, createdAt: new Date(),
  });
}

async function existingForAssignee(assigneeId) {
  const snap = await db().collection('tasks').where('assigneeId', '==', assigneeId).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function syncConflictSides(taskId) {
  const snap = await db().collection('tasks').doc(taskId).get();
  if (!snap.exists) return;
  const task = { id: snap.id, ...snap.data() };
  const others = await existingForAssignee(task.assigneeId);
  const conflicts = findConflicts(task, others);
  await db().collection('tasks').doc(taskId).update({ conflictWith: conflicts, updatedAt: new Date() });
  for (const otherId of conflicts) {
    const oSnap = await db().collection('tasks').doc(otherId).get();
    if (!oSnap.exists) continue;
    const oData = oSnap.data();
    const list = new Set(oData.conflictWith || []);
    list.add(taskId);
    await db().collection('tasks').doc(otherId).update({ conflictWith: [...list] });
  }
}

async function removeFromOthers(taskId) {
  const snap = await db().collection('tasks').where('conflictWith', 'array-contains', taskId).get();
  for (const d of snap.docs) {
    const list = (d.data().conflictWith || []).filter((x) => x !== taskId);
    await d.ref.update({ conflictWith: list });
  }
}

async function maybeCompleteProject(projectId) {
  const snap = await db().collection('tasks').where('projectId', '==', projectId).get();
  if (snap.empty) return;
  const all = snap.docs.map((d) => d.data());
  if (all.every((t) => t.status === 'approved')) {
    await db().collection('projects').doc(projectId).update({ status: 'completed' });
  }
}

const ALLOWED = {
  todo: ['in_progress'],
  in_progress: ['submitted'],
  submitted: ['in_review'],
  in_review: ['approved', 'revision'],
  revision: ['in_progress'],
  approved: [],
};

function canTransition(from, to) {
  return (ALLOWED[from] || []).includes(to);
}

async function createTask(req, res) {
  const { projectId } = req.params;
  const { title, description = '', assigneeId, reviewerId, startDate, deadline, priority = 'medium', force = false } = req.body || {};
  if (!title || !assigneeId || !reviewerId || !startDate || !deadline) {
    return err(res, 400, 'invalid-argument', 'title, assigneeId, reviewerId, startDate, deadline are required');
  }
  if (toDate(deadline) < toDate(startDate)) return err(res, 400, 'invalid-argument', 'deadline must be on or after startDate');
  const candidate = { id: 'new', assigneeId, status: 'todo', startDate, deadline };
  const others = await existingForAssignee(assigneeId);
  const conflicts = findConflicts(candidate, others);
  if (conflicts.length > 0 && !force) {
    const details = [];
    for (const cid of conflicts) {
      const s = await db().collection('tasks').doc(cid).get();
      if (s.exists) {
        const d = s.data();
        details.push({ id: cid, title: d.title, startDate: d.startDate, deadline: d.deadline });
      }
    }
    return res.status(200).json({ task: null, conflicts: details });
  }
  const ref = await db().collection('tasks').add({
    projectId, title, description, assigneeId, reviewerId,
    startDate: toDate(startDate), deadline: toDate(deadline), priority,
    status: 'todo', conflictWith: [], revisionCount: 0, createdAt: new Date(), updatedAt: new Date(),
  });
  await syncConflictSides(ref.id);
  await logActivity(projectId, req.user.uid, req.user.email, `created task '${title}'`, 'task', ref.id);
  await notify(assigneeId, `You were assigned '${title}'`, 'assigned', `/assignee/tasks/${ref.id}`);
  if (conflicts.length > 0) await notify(req.user.uid, `Conflict detected for '${title}'`, 'conflict', '/manager/conflicts');
  const snap = await ref.get();
  return res.status(201).json({ task: { id: snap.id, ...snap.data() }, conflicts });
}

async function updateTask(req, res) {
  const { id } = req.params;
  const patch = req.body || {};
  const ref = db().collection('tasks').doc(id);
  const snap = await ref.get();
  if (!snap.exists) return err(res, 404, 'not-found', 'Task not found');
  const current = snap.data();
  if (patch.status !== undefined && patch.status !== current.status) {
    return err(res, 409, 'invalid-transition', 'Use state machine endpoints for status changes');
  }
  const next = { ...current, ...patch };
  if (patch.startDate !== undefined) next.startDate = toDate(patch.startDate);
  if (patch.deadline !== undefined) next.deadline = toDate(patch.deadline);
  await ref.update({ ...patch, updatedAt: new Date() });
  if (patch.startDate !== undefined || patch.deadline !== undefined || patch.assigneeId !== undefined) {
    await syncConflictSides(id);
  }
  await logActivity(current.projectId, req.user.uid, req.user.email, 'updated task', 'task', id);
  return res.json({ ok: true });
}

async function reassign(req, res) {
  const { id } = req.params;
  const { assigneeId } = req.body || {};
  if (!assigneeId) return err(res, 400, 'invalid-argument', 'assigneeId required');
  const ref = db().collection('tasks').doc(id);
  const snap = await ref.get();
  if (!snap.exists) return err(res, 404, 'not-found', 'Task not found');
  const current = snap.data();
  await removeFromOthers(id);
  await ref.update({ assigneeId, updatedAt: new Date() });
  await syncConflictSides(id);
  await logActivity(current.projectId, req.user.uid, req.user.email, 'reassigned task', 'task', id);
  await notify(assigneeId, `You were assigned '${current.title}'`, 'assigned', `/assignee/tasks/${id}`);
  return res.json({ ok: true });
}

async function deleteTask(req, res) {
  const { id } = req.params;
  const snap = await db().collection('tasks').doc(id).get();
  if (!snap.exists) return err(res, 404, 'not-found', 'Task not found');
  const projectId = snap.data().projectId;
  await removeFromOthers(id);
  await db().collection('tasks').doc(id).delete();
  await logActivity(projectId, req.user.uid, req.user.email, 'deleted task', 'task', id);
  return res.json({ ok: true });
}

async function startTask(req, res) {
  const { id } = req.params;
  const ref = db().collection('tasks').doc(id);
  const snap = await ref.get();
  if (!snap.exists) return err(res, 404, 'not-found', 'Task not found');
  const t = snap.data();
  if (t.assigneeId !== req.user.uid) return err(res, 403, 'forbidden', 'Not your task');
  if (!canTransition(t.status, 'in_progress')) return err(res, 409, 'invalid-transition', `Cannot move ${t.status} to in_progress`);
  await ref.update({ status: 'in_progress', updatedAt: new Date() });
  await logActivity(t.projectId, req.user.uid, req.user.email, `started task '${t.title}'`, 'task', id);
  return res.json({ ok: true });
}

async function submitTask(req, res) {
  const { id } = req.params;
  const { fileUrl, fileName, note = '' } = req.body || {};
  if (!fileUrl || !fileName) return err(res, 400, 'invalid-argument', 'fileUrl and fileName required');
  const ref = db().collection('tasks').doc(id);
  const snap = await ref.get();
  if (!snap.exists) return err(res, 404, 'not-found', 'Task not found');
  const t = snap.data();
  if (t.assigneeId !== req.user.uid) return err(res, 403, 'forbidden', 'Not your task');
  if (!canTransition(t.status, 'submitted')) return err(res, 409, 'invalid-transition', `Cannot move ${t.status} to submitted`);
  const prev = await db().collection('submissions').where('taskId', '==', id).get();
  const version = prev.size + 1;
  const sub = await db().collection('submissions').add({
    taskId: id, submittedBy: req.user.uid, fileUrl, fileName, note, version, submittedAt: new Date(),
  });
  await ref.update({ status: 'submitted', updatedAt: new Date() });
  await logActivity(t.projectId, req.user.uid, req.user.email, `submitted task '${t.title}'`, 'submission', sub.id);
  await notify(t.reviewerId, `Submission received for '${t.title}'`, 'submission', `/reviewer/${id}`);
  return res.status(201).json({ submissionId: sub.id, version });
}

async function openReview(req, res) {
  const { id } = req.params;
  const ref = db().collection('tasks').doc(id);
  const snap = await ref.get();
  if (!snap.exists) return err(res, 404, 'not-found', 'Task not found');
  const t = snap.data();
  if (t.reviewerId !== req.user.uid) return err(res, 403, 'forbidden', 'Not your review');
  if (!canTransition(t.status, 'in_review')) {
    if (t.status === 'in_review') return res.json({ ok: true });
    return err(res, 409, 'invalid-transition', `Cannot move ${t.status} to in_review`);
  }
  await ref.update({ status: 'in_review', updatedAt: new Date() });
  return res.json({ ok: true });
}

async function reviewTask(req, res) {
  const { id } = req.params;
  const { decision, comments = '' } = req.body || {};
  if (decision !== 'approved' && decision !== 'rejected') return err(res, 400, 'invalid-argument', 'decision must be approved or rejected');
  if (decision === 'rejected' && comments.trim() === '') return err(res, 400, 'invalid-argument', 'comments required on rejection');
  const ref = db().collection('tasks').doc(id);
  const snap = await ref.get();
  if (!snap.exists) return err(res, 404, 'not-found', 'Task not found');
  const t = snap.data();
  if (t.reviewerId !== req.user.uid) return err(res, 403, 'forbidden', 'Not your review');
  const next = decision === 'approved' ? 'approved' : 'revision';
  if (!canTransition(t.status, next)) return err(res, 409, 'invalid-transition', `Cannot move ${t.status} to ${next}`);
  const subs = await db().collection('submissions').where('taskId', '==', id).get();
  const latest = subs.docs.sort((a, b) => (b.data().version || 0) - (a.data().version || 0))[0];
  await db().collection('reviews').add({
    taskId: id, submissionId: latest ? latest.id : '', reviewerId: req.user.uid, decision, comments, createdAt: new Date(),
  });
  const patch = { status: next, updatedAt: new Date() };
  if (next === 'revision') patch.revisionCount = (t.revisionCount || 0) + 1;
  if (next === 'approved') patch.conflictWith = [];
  await ref.update(patch);
  if (next === 'approved') {
    await removeFromOthers(id);
    await maybeCompleteProject(t.projectId);
    await logActivity(t.projectId, req.user.uid, req.user.email, `approved task '${t.title}'`, 'task', id);
    await notify(t.assigneeId, `Your work on '${t.title}' was approved`, 'submission', `/assignee/tasks/${id}`);
  } else {
    await logActivity(t.projectId, req.user.uid, req.user.email, `requested revision on '${t.title}'`, 'task', id);
    await notify(t.assigneeId, `Revision requested on '${t.title}'`, 'revision', `/assignee/tasks/${id}`);
  }
  return res.json({ ok: true });
}

async function listConflicts(req, res) {
  const snap = await db().collection('tasks').get();
  const tasks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const active = tasks.filter((t) => t.status !== 'approved' && (t.conflictWith || []).length > 0);
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const seen = new Set();
  const out = [];
  for (const t of active) {
    for (const otherId of t.conflictWith || []) {
      const key = [t.id, otherId].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      const o = byId.get(otherId);
      if (!o) continue;
      const r = overlapRange(t, o);
      out.push({
        assigneeId: t.assigneeId,
        taskA: { id: t.id, title: t.title, startDate: t.startDate, deadline: t.deadline },
        taskB: { id: otherId, title: o.title, startDate: o.startDate, deadline: o.deadline },
        overlap: { start: r.start, end: r.end },
      });
    }
  }
  const grouped = {};
  for (const c of out) {
    grouped[c.assigneeId] = grouped[c.assigneeId] || [];
    grouped[c.assigneeId].push(c);
  }
  return res.json({ conflicts: out, grouped });
}

module.exports = {
  createTask, updateTask, reassign, deleteTask, startTask, submitTask,
  openReview, reviewTask, listConflicts, canTransition, logActivity, notify,
};
