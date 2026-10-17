const { db } = require('../config/firebase');
const { findConflicts } = require('../services/conflictService');
const { assert, fail, text, day, fields, rows, json, activity, notify } = require('../services/common');
const { verifyFiles } = require('../services/files');
const ALLOWED = { todo: ['in_progress'], in_progress: ['submitted'], submitted: ['in_review'], in_review: ['approved', 'revision'], revision: ['in_progress'], approved: [] };
const canTransition = (from, to) => (ALLOWED[from] || []).includes(to);
const editFields = ['title', 'description', 'assigneeId', 'reviewerId', 'startDate', 'deadline', 'priority', 'labels', 'requirementIds', 'subtaskTitles', 'estimatedHours'];

async function mutate(req, operation) {
  const fs = db();
  const ref = operation === 'create' ? fs.collection('tasks').doc() : fs.collection('tasks').doc(req.params.id);
  const body = req.body || {};
  if (operation === 'create') {
    fields(body, [...editFields, 'force']);
    if (body.force !== undefined) assert(typeof body.force === 'boolean', 'force must be a boolean');
  }
  if (operation === 'update') fields(body, editFields);
   if (operation === 'reassign') fields(body, ['assigneeId']);
   if (operation === 'submit') fields(body, ['files', 'note']);
   if (operation === 'review') fields(body, ['decision', 'comments', 'submissionId']);
  const files = operation === 'submit' ? await verifyFiles(body.files, req.user, 'submission', ref.id) : [];
  return fs.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (operation !== 'create' && !snap.exists) fail(404, 'not-found', 'Task not found');
    const current = snap.exists ? { ...snap.data(), id: ref.id } : null;
    const projectId = current?.projectId || req.params.projectId;
    const projectRef = fs.collection('projects').doc(projectId);
    const ps = await tx.get(projectRef);
    if (!ps.exists) fail(404, 'not-found', 'Project not found');
    const project = ps.data();
    const next = current ? { ...current } : { id: ref.id, projectId, status: 'todo', conflictWith: [], revisionCount: 0, submissionCount: 0, createdAt: new Date() };
    if (['create', 'update', 'reassign'].includes(operation)) {
      if (current) assert(!['submitted', 'in_review', 'approved'].includes(current.status), 'Submitted or approved work cannot be edited', 409);
       for (const key of editFields) if (body[key] !== undefined) next[key] = body[key];
      next.title = text(next.title, 'Title', 200, true);
      next.description = text(next.description === undefined ? '' : next.description, 'Description');
      next.startDate = day(next.startDate); next.deadline = day(next.deadline);
       assert(next.deadline >= next.startDate, 'Deadline must be on or after start date');
       assert(next.startDate >= day(project.startDate) && next.deadline <= day(project.deadline), 'Task dates must fit inside the project schedule');
      assert(['low', 'medium', 'high'].includes(next.priority || 'medium'), 'Invalid priority');
      next.priority ||= 'medium';
       text(next.assigneeId, 'Assignee', 128, true); text(next.reviewerId, 'Reviewer', 128, true);
       if (body.labels !== undefined) { assert(Array.isArray(body.labels) && body.labels.length <= 12, 'Use no more than 12 labels'); next.labels = body.labels.map(label => text(label, 'Label', 40, true)); }
       if (body.estimatedHours !== undefined) assert(Number.isFinite(body.estimatedHours) && body.estimatedHours >= 0 && body.estimatedHours <= 10000, 'Invalid estimated hours');
       if (body.subtaskTitles !== undefined) {
         assert(Array.isArray(body.subtaskTitles) && body.subtaskTitles.length <= 50, 'Use no more than 50 checklist items');
         next.subtasks = body.subtaskTitles.map(title => ({id:fs.collection('tasks').doc().id, title:text(title,'Checklist title',200,true), completed:false}));
         delete next.subtaskTitles;
       }
       if (body.requirementIds !== undefined) {
         assert(Array.isArray(body.requirementIds) && body.requirementIds.length <= 50, 'Invalid requirement selection');
         next.requirementIds = body.requirementIds.map(id => text(id,'Requirement ID',128,true));
         for (const id of next.requirementIds) {
           const requirement = await tx.get(fs.collection('requirements').doc(id));
           assert(requirement.exists && requirement.data().projectId === projectId, 'Choose requirements from this project');
         }
       }
    }
    if (['start', 'submit'].includes(operation)) assert(current.assigneeId === req.user.uid, 'This task is assigned to another person', 403);
    if (['open', 'review'].includes(operation)) assert(current.reviewerId === req.user.uid, 'This review is assigned to another person', 403);
    if (operation === 'start') next.status = 'in_progress';
    if (operation === 'submit') next.status = 'submitted';
    if (operation === 'open') next.status = 'in_review';
     if (operation === 'review') {
      assert(['approved', 'rejected'].includes(body.decision), 'Decision must be approved or rejected');
      const comments = body.comments === undefined ? '' : body.comments;
      text(comments, 'Comments', 10000, body.decision === 'rejected');
      next.status = body.decision === 'approved' ? 'approved' : 'revision';
      if (next.status === 'revision') next.revisionCount++;
    }
    if (['start', 'submit', 'open', 'review'].includes(operation)) {
      if (operation === 'open' && current.status === 'in_review') return { ok: true };
      assert(canTransition(current.status, next.status), 'Cannot move ' + current.status + ' to ' + next.status, 409);
    }
    if (operation === 'delete') assert(current.status === 'todo', 'Only an unstarted task can be deleted', 409);

    // Shared assignee and project documents serialize concurrent scheduling,
    // including simultaneous creates into an initially empty schedule.
    const assigneeIds = [...new Set([current?.assigneeId, next.assigneeId].filter(Boolean))];
    const people = new Map();
    for (const uid of [...new Set([...assigneeIds, next.reviewerId])]) people.set(uid, await tx.get(fs.collection('users').doc(uid)));
    assert(people.get(next.assigneeId)?.data()?.role === 'assignee', 'Select a valid assignee');
    assert(people.get(next.reviewerId)?.data()?.role === 'reviewer', 'Select a valid reviewer');
    const pool = new Map();
    for (const uid of assigneeIds) for (const t of rows(await tx.get(fs.collection('tasks').where('assigneeId', '==', uid)))) pool.set(t.id, t);
    const projectTasks = rows(await tx.get(fs.collection('tasks').where('projectId', '==', projectId)));
    let latest;
    if (operation === 'review') {
      assert(current.latestSubmissionId, 'No submission is available for review', 409);
      latest = await tx.get(fs.collection('submissions').doc(current.latestSubmissionId));
       assert(latest.exists, 'Submission not found', 409);
       if (body.submissionId !== undefined) assert(body.submissionId === latest.id, 'The submission changed. Reload before reviewing.', 409);
    }
     next.updatedAt = new Date();
     if (operation === 'delete') pool.delete(ref.id); else pool.set(ref.id, next);
     if (operation === 'create' && !body.force) {
       const candidateConflicts = findConflicts(next, [...pool.values()]).sort();
       if (candidateConflicts.length) {
         return {
           ok: true,
           task: null,
           conflicts: candidateConflicts,
           conflictTasks: [...pool.values()].filter(t => candidateConflicts.includes(t.id)),
         };
       }
     }
     const audience = [project.clientId, project.managerId, next.assigneeId, next.reviewerId].filter(Boolean);
    const internalAudience = audience.filter(id => id !== project.clientId);
    for (const uid of assigneeIds) tx.update(people.get(uid).ref, { schedulingRevision: (people.get(uid).data().schedulingRevision || 0) + 1 });
    for (const t of pool.values()) {
      const conflicts = findConflicts(t, [...pool.values()]).sort();
      const added = conflicts.filter(id => !(t.conflictWith || []).includes(id));
      if (t.id === ref.id) next.conflictWith = conflicts;
      else if (JSON.stringify(conflicts) !== JSON.stringify([...(t.conflictWith || [])].sort())) tx.update(fs.collection('tasks').doc(t.id), { conflictWith: conflicts, updatedAt: new Date() });
      if (added.length) {
        notify(tx, project.managerId || req.user.uid, 'Deadline conflict: ' + t.title, 'conflict', '/manager/conflicts');
        activity(tx, req.user, t.projectId, 'conflict detected', 'task', t.id, internalAudience);
      }
    }
    if (operation === 'submit') {
      const subRef = fs.collection('submissions').doc();
      next.submissionCount = (current.submissionCount || 0) + 1;
      next.latestSubmissionId = subRef.id;
      tx.set(subRef, { taskId: ref.id, projectId, submittedBy: req.user.uid, files, fileName: files[0].name, fileUrl: files[0].url, note: text(body.note === undefined ? '' : body.note, 'Note'), version: next.submissionCount, submittedAt: new Date() });
      activity(tx, req.user, projectId, 'submission uploaded', 'submission', subRef.id, internalAudience);
      notify(tx, next.reviewerId, 'Review required: ' + next.title, 'submission', '/reviewer/reviews/' + ref.id);
      notify(tx, project.managerId, 'Work submitted: ' + next.title, 'submission', '/manager/tasks/' + ref.id);
    }
    if (operation === 'review') {
      const reviewRef = fs.collection('reviews').doc();
      tx.set(reviewRef, { taskId: ref.id, projectId, submissionId: latest.id, reviewerId: req.user.uid, decision: body.decision, comments: (body.comments === undefined ? '' : body.comments).trim(), createdAt: new Date() });
      activity(tx, req.user, projectId, 'review completed', 'review', reviewRef.id, internalAudience);
       notify(tx, next.assigneeId, (next.status === 'approved' ? 'Approved: ' : 'Revision requested: ') + next.title, next.status === 'approved' ? 'approval' : 'revision', '/assignee/tasks/' + ref.id);
     }
     if (operation === 'start') notify(tx, project.managerId, 'Work started: ' + next.title, 'status_change', '/manager/tasks/' + ref.id);
     if (operation === 'open') notify(tx, project.managerId, 'Review opened: ' + next.title, 'submission', '/manager/tasks/' + ref.id);
    if (operation === 'create' || current?.assigneeId !== next.assigneeId) {
      notify(tx, next.assigneeId, (operation === 'create' ? 'Assigned: ' : 'Reassigned: ') + next.title, 'assigned', '/assignee/tasks/' + ref.id);
      if (current) notify(tx, current.assigneeId, 'Task reassigned: ' + next.title, 'assigned', '/assignee/tasks');
      activity(tx, req.user, projectId, operation === 'create' ? 'task assigned' : 'task reassigned', 'task', ref.id, internalAudience);
    }
    if (current && (body.startDate !== undefined || body.deadline !== undefined)) activity(tx, req.user, projectId, 'deadline changed', 'task', ref.id, internalAudience);
    const actions = { create: 'task created', update: 'task updated', reassign: 'assignment updated', delete: 'task deleted', start: 'task started', submit: 'task submitted', open: 'review started', review: next.status === 'approved' ? 'task approved' : 'revision requested' };
    activity(tx, req.user, projectId, actions[operation], 'task', ref.id, internalAudience);
    if (operation === 'delete') tx.delete(ref); else { const { id, ...data } = next; tx.set(ref, data); }
    const remaining = projectTasks.filter(t => t.id !== ref.id);
    if (operation !== 'delete') remaining.push(next);
    const completed = remaining.filter(t => t.status === 'approved').length;
    const status = remaining.length && completed === remaining.length ? 'completed' : remaining.length ? 'active' : 'draft';
    tx.update(projectRef, { status, managerId: project.managerId || (req.user.role === 'manager' ? req.user.uid : null), memberIds: [...new Set(remaining.flatMap(t => [t.assigneeId, t.reviewerId]))], totalTasks: remaining.length, tasksCompleted: completed, progress: remaining.length ? Math.round(100 * completed / remaining.length) : 0, updatedAt: new Date() });
    if (status === 'completed' && project.status !== status) {
      notify(tx, project.clientId, 'Project completed: ' + project.title, 'approval', '/client/projects/' + projectId);
      activity(tx, req.user, projectId, 'project completed', 'project', projectId, audience);
    }
    return { ok: true, task: next, conflicts: next.conflictWith, submissionId: next.latestSubmissionId || null, version: next.submissionCount || 0 };
  });
}
const handler = operation => async (req, res) => res.status(['create', 'submit'].includes(operation) ? 201 : 200).json(json(await mutate(req, operation)));
async function listConflicts(req, res) { res.json(json(rows(await db().collection('tasks').get()).filter(t => t.status !== 'approved' && t.conflictWith?.length))); }
module.exports = { createTask: handler('create'), updateTask: handler('update'), reassign: handler('reassign'), deleteTask: handler('delete'), startTask: handler('start'), submitTask: handler('submit'), openReview: handler('open'), reviewTask: handler('review'), listConflicts, canTransition };
