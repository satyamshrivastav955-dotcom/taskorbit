const { db } = require('../config/firebase');
const { assert, fail, text, fields, activity, notify } = require('../services/common');

async function taskMutation(req, res, action) {
  const fs = db(), ref = fs.collection('tasks').doc(req.params.id);
  await fs.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) fail(404, 'not-found', 'Task not found');
    const task = snap.data();
    assert(req.user.role === 'manager' || task.assigneeId === req.user.uid || task.reviewerId === req.user.uid, 'Not your task', 403);
    const project = await tx.get(fs.collection('projects').doc(task.projectId));
    assert(project.exists, 'Project not found');
    const members = [project.data().managerId, task.assigneeId, task.reviewerId].filter(Boolean);
    if (action === 'comment') {
      fields(req.body, ['content']);
      const comments = task.comments || [];
      assert(comments.length < 300, 'Task comment limit reached');
      const comment = { id: fs.collection('tasks').doc().id, userId: req.user.uid, userName: req.user.name || req.user.email, content: text(req.body.content, 'Comment', 5000, true), createdAt: new Date() };
      tx.update(ref, { comments: [...comments, comment], updatedAt: new Date() });
      activity(tx, req.user, task.projectId, 'commented on ' + task.title, 'task', ref.id, members);
      for (const member of members.filter(id => id !== req.user.uid)) {
        const role = member === task.assigneeId ? 'assignee' : member === task.reviewerId ? 'reviewer' : 'manager';
        notify(tx, member, 'New comment: ' + task.title, 'mention', '/' + role + (role === 'reviewer' ? '/reviews/' : '/tasks/') + ref.id);
      }
    } else {
      fields(req.body, ['completed']);
      assert(typeof req.body.completed === 'boolean', 'Choose a checklist state');
      assert(req.user.role === 'manager' || task.assigneeId === req.user.uid, 'Only the assignee or manager can update the checklist', 403);
      assert(!['submitted', 'in_review', 'approved'].includes(task.status), 'Submitted work is locked', 409);
      assert((task.subtasks || []).some(item => item.id === req.params.subtaskId), 'Checklist item not found');
      tx.update(ref, { subtasks: task.subtasks.map(item => item.id === req.params.subtaskId ? { ...item, completed: req.body.completed } : item), updatedAt: new Date() });
      activity(tx, req.user, task.projectId, 'checklist updated', 'task', ref.id, members);
    }
  });
  res.json({ ok: true });
}

async function feedbackUpdate(req, res) {
  fields(req.body, ['status', 'response']);
  assert(['Pending', 'In Progress', 'Resolved'].includes(req.body.status), 'Invalid feedback status');
  const fs = db(), ref = fs.collection('feedback').doc(req.params.id);
  await fs.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) fail(404, 'not-found', 'Feedback not found');
    const feedback = snap.data(), response = text(req.body.response || '', 'Response', 10000);
    tx.update(ref, { status: req.body.status, response, respondedBy: req.user.uid, updatedAt: new Date() });
    activity(tx, req.user, feedback.projectId, 'feedback ' + req.body.status.toLowerCase(), 'project', feedback.projectId, [feedback.clientId]);
    notify(tx, feedback.clientId, 'Feedback updated: ' + feedback.projectTitle, 'status_change', '/client/feedback');
  });
  res.json({ ok: true });
}

module.exports = { comment: (req, res) => taskMutation(req, res, 'comment'), checklist: (req, res) => taskMutation(req, res, 'checklist'), feedbackUpdate };
