/* Sync TaskOrbit workspace data to Supabase PostgreSQL (idempotent upserts).
 * Usage: npm run sync:supabase
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in node-backend/.env
 *           and SYNC_ID_TOKEN environment variable (manager Firebase ID token).
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { getSupabase, isSupabaseConfigured } = require('../src/config/supabase');

const API = process.env.API_BASE_URL || 'http://localhost:4000/api';

function toDateOnly(v) {
  if (!v) return null;
  if (typeof v === 'string') return v.slice(0, 10);
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (v && typeof v === 'object' && typeof v.toDate === 'function') {
    return v.toDate().toISOString().slice(0, 10);
  }
  if (v && typeof v === 'object' && typeof v._seconds === 'number') {
    return new Date(v._seconds * 1000).toISOString().slice(0, 10);
  }
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

function toIso(v) {
  if (!v) return new Date().toISOString();
  if (typeof v === 'string') return v;
  if (v instanceof Date) return v.toISOString();
  if (v && typeof v === 'object' && typeof v.toDate === 'function') {
    return v.toDate().toISOString();
  }
  if (v && typeof v === 'object' && typeof v._seconds === 'number') {
    return new Date(v._seconds * 1000).toISOString();
  }
  const d = new Date(v);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

async function fetchWorkspaceData(token) {
  // Try fetching the full workspace first (/workspace has users, projects, tasks, reviews, etc.)
  try {
    const wsRes = await fetch(`${API}/workspace`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (wsRes.ok) {
      const data = await wsRes.json();
      return { source: 'workspace', data };
    }
  } catch {
    // Fall back to export route
  }

  // Fallback: /export/all
  const expRes = await fetch(`${API}/export/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!expRes.ok) {
    throw new Error(`Data fetch failed from both /workspace and /export/all (status: ${expRes.status})`);
  }
  const expData = await expRes.json();
  return { source: 'export', data: expData };
}

/**
 * Ensures user records exist before child tables reference them via foreign keys.
 */
async function ensureStubUsers(supabase, userIds) {
  const cleanIds = [...new Set(userIds.filter(Boolean))];
  if (!cleanIds.length) return;

  for (const id of cleanIds) {
    await supabase.from('users').upsert(
      {
        id,
        name: `User ${id.slice(0, 8)}`,
        email: `${id}@taskorbit.local`,
        role: 'assignee',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id', ignoreDuplicates: true }
    );
  }
}

async function syncWorkspace(supabase, payload) {
  const stats = {
    users: 0,
    projects: 0,
    tasks: 0,
    requirements: 0,
    submissions: 0,
    reviews: 0,
    feedback: 0,
    notifications: 0,
    activityLogs: 0,
    errors: [],
  };

  const users = payload.users || [];
  const projects = payload.projects || [];
  const tasks = payload.tasks || [];
  const requirements = payload.requirements || [];
  const submissions = payload.submissions || [];
  const reviews = payload.reviews || [];
  const feedbacks = payload.feedbacks || payload.feedback || [];
  const notifications = payload.notifications || [];
  const activities = payload.activities || payload.activityLogs || [];

  // 1. Collect all referenced User IDs to avoid FK violations
  const referencedUserIds = [
    ...users.map(u => u.id || u.uid),
    ...projects.flatMap(p => [p.client_id || p.clientId, p.manager_id || p.managerId]),
    ...tasks.flatMap(t => [t.assignee_id || t.assigneeId, t.reviewer_id || t.reviewerId]),
    ...submissions.map(s => s.submitted_by || s.submittedBy),
    ...reviews.map(r => r.reviewer_id || r.reviewerId),
    ...feedbacks.flatMap(f => [f.client_id || f.clientId, f.responded_by || f.respondedBy]),
    ...notifications.map(n => n.user_id || n.userId),
    ...activities.map(a => a.actor_id || a.actorId),
  ].filter(Boolean);

  await ensureStubUsers(supabase, referencedUserIds);

  // 2. Sync full Users
  for (const u of users) {
    const id = u.id || u.uid;
    if (!id) continue;
    const { error } = await supabase.from('users').upsert(
      {
        id,
        name: u.name || 'User',
        email: u.email || `${id}@taskorbit.local`,
        role: u.role || 'assignee',
        job_title: u.jobTitle || u.job_title || null,
        department: u.department || null,
        phone: u.phone || null,
        bio: u.bio || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (error) stats.errors.push(`users (${id}): ${error.message}`);
    else stats.users++;
  }

  // 3. Sync Projects
  for (const p of projects) {
    if (!p.id) continue;
    const clientId = p.client_id || p.clientId;
    if (!clientId) continue;

    const { error } = await supabase.from('projects').upsert(
      {
        id: p.id,
        title: p.title || 'Untitled Project',
        description: p.description || '',
        client_id: clientId,
        manager_id: p.manager_id || p.managerId || null,
        status: p.status || 'submitted',
        priority: p.priority || 'medium',
        start_date: toDateOnly(p.start_date || p.startDate) || new Date().toISOString().slice(0, 10),
        deadline: toDateOnly(p.deadline) || new Date().toISOString().slice(0, 10),
        progress: typeof p.progress === 'number' ? p.progress : 0,
        tasks_completed: p.tasks_completed || p.tasksCompleted || 0,
        total_tasks: p.total_tasks || p.totalTasks || 0,
        member_ids: p.member_ids || p.memberIds || [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (error) stats.errors.push(`projects (${p.id}): ${error.message}`);
    else stats.projects++;
  }

  // 4. Sync Requirements
  for (const r of requirements) {
    if (!r.id || !r.projectId) continue;
    const { error } = await supabase.from('requirements').upsert(
      {
        id: r.id,
        project_id: r.projectId,
        title: r.title || 'Untitled Requirement',
        details: r.details || '',
        status: r.status || 'Pending',
        file_urls: r.fileUrls || [],
        files: r.files || [],
        created_at: toIso(r.createdAt),
      },
      { onConflict: 'id' }
    );
    if (error) stats.errors.push(`requirements (${r.id}): ${error.message}`);
    else stats.requirements++;
  }

  // 5. Sync Tasks (from top-level tasks or embedded project tasks)
  const allTasks = tasks.length ? tasks : projects.flatMap(p => (p.tasks || []).map(t => ({ ...t, projectId: p.id })));
  for (const t of allTasks) {
    if (!t.id) continue;
    const projectId = t.project_id || t.projectId;
    const assigneeId = t.assignee_id || t.assigneeId;
    const reviewerId = t.reviewer_id || t.reviewerId;
    if (!projectId || !assigneeId || !reviewerId) continue;

    const { error } = await supabase.from('tasks').upsert(
      {
        id: t.id,
        project_id: projectId,
        title: t.title || 'Untitled Task',
        description: t.description || '',
        assignee_id: assigneeId,
        reviewer_id: reviewerId,
        start_date: toDateOnly(t.start_date || t.startDate) || new Date().toISOString().slice(0, 10),
        deadline: toDateOnly(t.deadline) || new Date().toISOString().slice(0, 10),
        priority: t.priority || 'medium',
        status: t.status || 'todo',
        conflict_with: t.conflict_with || t.conflictWith || [],
        revision_count: t.revision_count || t.revisionCount || 0,
        subtasks: t.subtasks || [],
        requirement_ids: t.requirement_ids || t.requirementIds || [],
        labels: t.labels || [],
        estimated_hours: t.estimated_hours || t.estimatedHours || null,
        latest_submission_id: t.latest_submission_id || t.latestSubmissionId || null,
        submission_count: t.submission_count || t.submissionCount || 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (error) stats.errors.push(`tasks (${t.id}): ${error.message}`);
    else stats.tasks++;
  }

  // 6. Sync Submissions
  for (const s of submissions) {
    if (!s.id || !s.taskId || !s.projectId) continue;
    const { error } = await supabase.from('submissions').upsert(
      {
        id: s.id,
        task_id: s.taskId,
        project_id: s.projectId,
        submitted_by: s.submitted_by || s.submittedBy,
        file_name: s.file_name || s.fileName || 'file',
        file_url: s.file_url || s.fileUrl || '',
        files: s.files || [],
        note: s.note || '',
        version: s.version || 1,
        submitted_at: toIso(s.submitted_at || s.submittedAt),
      },
      { onConflict: 'id' }
    );
    if (error) stats.errors.push(`submissions (${s.id}): ${error.message}`);
    else stats.submissions++;
  }

  // 7. Sync Reviews
  for (const r of reviews) {
    if (!r.id || !r.taskId || !r.projectId) continue;
    // ensure submission exists or fallback
    const submissionId = r.submission_id || r.submissionId;
    if (submissionId) {
      await supabase.from('submissions').upsert(
        {
          id: submissionId,
          task_id: r.taskId,
          project_id: r.projectId,
          submitted_by: referencedUserIds[0] || 'unknown',
          file_name: 'deliverable',
          file_url: '',
          submitted_at: toIso(r.createdAt),
        },
        { onConflict: 'id', ignoreDuplicates: true }
      );
    }
    const { error } = await supabase.from('reviews').upsert(
      {
        id: r.id,
        task_id: r.taskId,
        project_id: r.projectId,
        submission_id: submissionId || 'stub-submission',
        reviewer_id: r.reviewer_id || r.reviewerId,
        decision: r.decision || 'approved',
        comments: r.comments || '',
        created_at: toIso(r.createdAt),
      },
      { onConflict: 'id' }
    );
    if (error) stats.errors.push(`reviews (${r.id}): ${error.message}`);
    else stats.reviews++;
  }

  // 8. Sync Feedback
  for (const f of feedbacks) {
    if (!f.id || !f.projectId) continue;
    const { error } = await supabase.from('feedback').upsert(
      {
        id: f.id,
        project_id: f.projectId,
        project_title: f.projectTitle || 'Project',
        task_title: f.taskTitle || 'Project feedback',
        client_id: f.clientId || f.client_id,
        comment: f.comment || '',
        status: f.status || 'Pending',
        replies_count: f.repliesCount || 0,
        response: f.response || null,
        responded_by: f.respondedBy || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (error) stats.errors.push(`feedback (${f.id}): ${error.message}`);
    else stats.feedback++;
  }

  // 9. Sync Notifications
  for (const n of notifications) {
    if (!n.id || !n.userId) continue;
    const { error } = await supabase.from('notifications').upsert(
      {
        id: n.id,
        user_id: n.userId,
        message: n.message || '',
        type: n.type || 'system',
        link: n.link || '',
        is_read: Boolean(n.read),
        created_at: toIso(n.createdAt),
      },
      { onConflict: 'id' }
    );
    if (error) stats.errors.push(`notifications (${n.id}): ${error.message}`);
    else stats.notifications++;
  }

  // 10. Sync Activity Logs
  for (const a of activities) {
    if (!a.id || !a.actorId) continue;
    const { error } = await supabase.from('activity_logs').upsert(
      {
        id: a.id,
        project_id: a.projectId || '',
        actor_id: a.actorId,
        actor_name: a.actorName || 'User',
        action: a.action || 'activity',
        target_type: a.targetType || 'project',
        target_id: a.targetId || a.id,
        audience_ids: a.audienceIds || [],
        created_at: toIso(a.createdAt),
      },
      { onConflict: 'id' }
    );
    if (error) stats.errors.push(`activity_logs (${a.id}): ${error.message}`);
    else stats.activityLogs++;
  }

  return stats;
}

async function main() {
  if (!isSupabaseConfigured()) {
    console.error('Supabase is not configured in node-backend/.env.');
    console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable synchronization.');
    process.exit(1);
  }

  const supabase = getSupabase({ requireServiceRole: true });
  const token = process.env.SYNC_ID_TOKEN || '';

  if (!token) {
    console.error('Error: Set SYNC_ID_TOKEN environment variable to a valid manager ID token.');
    process.exit(1);
  }

  console.log(`Connecting to TaskOrbit API (${API})...`);
  const { source, data } = await fetchWorkspaceData(token);
  console.log(`Data fetched from source: ${source}`);

  console.log('Synchronizing entities to Supabase PostgreSQL (idempotent upserts)...');
  const stats = await syncWorkspace(supabase, data);

  console.log('\n--- Synchronization Summary ---');
  console.log(`Users synced:         ${stats.users}`);
  console.log(`Projects synced:      ${stats.projects}`);
  console.log(`Tasks synced:         ${stats.tasks}`);
  console.log(`Requirements synced:  ${stats.requirements}`);
  console.log(`Submissions synced:   ${stats.submissions}`);
  console.log(`Reviews synced:       ${stats.reviews}`);
  console.log(`Feedback synced:      ${stats.feedback}`);
  console.log(`Notifications synced: ${stats.notifications}`);
  console.log(`Activity logs synced: ${stats.activityLogs}`);

  if (stats.errors.length) {
    console.warn(`\nWarnings/Errors encountered (${stats.errors.length}):`);
    stats.errors.slice(0, 10).forEach(e => console.warn(` - ${e}`));
    if (stats.errors.length > 10) console.warn(` ... and ${stats.errors.length - 10} more.`);
  } else {
    console.log('\nAll entities synchronized without errors.');
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Sync failed:', err.message);
    process.exit(1);
  });
}

module.exports = { syncWorkspace, toDateOnly, toIso };
