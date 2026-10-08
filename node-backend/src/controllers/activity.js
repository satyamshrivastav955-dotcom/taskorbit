const { db } = require('../config/firebase');
const { err } = require('../middleware/auth');

// Authenticated activity logging for client-side creates (projects,
// requirements) that bypass the task API. Validated, actor from token.
async function log(req, res) {
  const body = req.body || {};
  if (!body || typeof body !== 'object' || Array.isArray(body)) return err(res, 400, 'invalid-argument', 'Invalid request body');
  const { projectId = '', action = '', targetType = '', targetId = '' } = body;
  if ([projectId, action, targetType, targetId].some(value => typeof value !== 'string')) {
    return err(res, 400, 'invalid-argument', 'Activity fields must be strings');
  }
  const cleanProjectId = projectId.trim();
  const cleanAction = action.trim();
  const cleanTargetType = targetType.trim();
  const cleanTargetId = targetId.trim();
  if (cleanProjectId === '' || cleanAction === '' || cleanTargetType === '' || cleanTargetId === '') {
    return err(res, 400, 'invalid-argument', 'projectId, action, targetType and targetId are required');
  }
  if (cleanAction.length > 300 || cleanTargetType.length > 50 || cleanTargetId.length > 100) {
    return err(res, 400, 'invalid-argument', 'Activity field is too long');
  }
  const allowedTargets = ['project', 'task', 'requirement', 'submission', 'review', 'document'];
  if (!allowedTargets.includes(cleanTargetType)) return err(res, 400, 'invalid-argument', 'Invalid activity target');
  let actorName = req.user.email;
  let audienceIds = [req.user.uid];
  try {
    const snap = await db().collection('users').doc(req.user.uid).get();
    if (snap.exists) actorName = snap.data().name || actorName;
  } catch {
    // Name lookup best-effort; uid + email always recorded.
  }
  if (cleanProjectId !== '') {
    const project = await db().collection('projects').doc(cleanProjectId).get();
    if (!project.exists) return err(res, 404, 'not-found', 'Project not found');
    const data = project.data();
    const hasAccess = req.user.role === 'manager' || data.clientId === req.user.uid || req.user.uid === data.managerId || (data.memberIds || []).includes(req.user.uid);
    if (!hasAccess) return err(res, 403, 'forbidden', 'You cannot write activity for this project');
    audienceIds = [req.user.uid, data.clientId, data.managerId, ...(data.memberIds || [])].filter(Boolean);
  }
  const ref = await db().collection('activityLogs').add({
    projectId: cleanProjectId,
    actorId: req.user.uid,
    actorName,
    action: cleanAction,
    targetType: cleanTargetType,
    targetId: cleanTargetId,
    audienceIds: [...new Set(audienceIds)],
    createdAt: new Date(),
  });
  return res.status(201).json({ id: ref.id });
}

// Delete own notification only.
async function removeNotification(req, res) {
  const ref = db().collection('notifications').doc(req.params.id);
  const snap = await ref.get();
  if (!snap.exists) return err(res, 404, 'not-found', 'Notification not found');
  if (snap.data().userId !== req.user.uid) return err(res, 403, 'forbidden', 'Not your notification');
  await ref.delete();
  return res.json({ ok: true });
}

module.exports = { log, removeNotification };
