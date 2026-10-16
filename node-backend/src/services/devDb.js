let idCounter = 1000;

function generateId(prefix = 'doc') {
  return `${prefix}-${Date.now().toString(36)}-${(++idCounter).toString(36)}`;
}

function toDateOnly(v) {
  if (!v) return null;
  if (typeof v === 'string') return v.slice(0, 10);
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (v && typeof v === 'object' && typeof v.toDate === 'function') {
    return v.toDate().toISOString().slice(0, 10);
  }
  return new Date(v).toISOString().slice(0, 10);
}

function toIsoString(v) {
  if (!v) return new Date().toISOString();
  if (typeof v === 'string') return v;
  if (v instanceof Date) return v.toISOString();
  if (v && typeof v === 'object' && typeof v.toDate === 'function') {
    return v.toDate().toISOString();
  }
  return new Date(v).toISOString();
}

class DevFirestore {
  constructor() {
    this.collections = new Map();
    this.initDefaultSeed();
    this.initSupabaseLoad();
  }

  getCollectionMap(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Map());
    }
    return this.collections.get(name);
  }

  initDefaultSeed() {
    const users = this.getCollectionMap('users');
    users.set('dev-engineer-1', {
      id: 'dev-engineer-1',
      name: 'Client User',
      email: 'engineer1@taskorbit.local',
      role: 'client',
      createdAt: new Date(),
    });
    users.set('dev-manager-1', {
      id: 'dev-manager-1',
      name: 'Manager User',
      email: 'engineer1@taskorbit.local',
      role: 'manager',
      createdAt: new Date(),
    });
    users.set('dev-assignee-1', {
      id: 'dev-assignee-1',
      name: 'Test Engineer (Assignee)',
      email: 'engineer1@taskorbit.local',
      role: 'assignee',
      createdAt: new Date(),
    });
    users.set('dev-reviewer-1', {
      id: 'dev-reviewer-1',
      name: 'Reviewer',
      email: 'engineer1@taskorbit.local',
      role: 'reviewer',
      createdAt: new Date(),
    });
  }

  async initSupabaseLoad() {
    try {
      const { isSupabaseConfigured, getSupabase } = require('../config/supabase');
      if (!isSupabaseConfigured()) return;
      const client = getSupabase({ requireServiceRole: true });

      // Preload users
      const { data: users, error: userErr } = await client.from('users').select('*');
      if (!userErr && users && users.length) {
        const userMap = this.getCollectionMap('users');
        for (const u of users) {
          userMap.set(u.id, {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            jobTitle: u.job_title,
            department: u.department,
            phone: u.phone,
            bio: u.bio,
            createdAt: u.created_at,
            updatedAt: u.updated_at,
          });
        }
      }

      // Preload projects
      const { data: projects, error: projErr } = await client.from('projects').select('*');
      if (!projErr && projects && projects.length) {
        const projectMap = this.getCollectionMap('projects');
        for (const p of projects) {
          projectMap.set(p.id, {
            id: p.id,
            title: p.title,
            description: p.description || '',
            clientId: p.client_id,
            managerId: p.manager_id,
            status: p.status,
            priority: p.priority,
            startDate: p.start_date,
            deadline: p.deadline,
            progress: p.progress,
            tasksCompleted: p.tasks_completed,
            totalTasks: p.total_tasks,
            memberIds: p.member_ids || [],
            createdAt: p.created_at,
            updatedAt: p.updated_at,
          });
        }
      }

      // Preload tasks
      const { data: tasks, error: taskErr } = await client.from('tasks').select('*');
      if (!taskErr && tasks && tasks.length) {
        const taskMap = this.getCollectionMap('tasks');
        for (const t of tasks) {
          taskMap.set(t.id, {
            id: t.id,
            projectId: t.project_id,
            title: t.title,
            description: t.description || '',
            assigneeId: t.assignee_id,
            reviewerId: t.reviewer_id,
            startDate: t.start_date,
            deadline: t.deadline,
            priority: t.priority,
            status: t.status,
            conflictWith: t.conflict_with || [],
            revisionCount: t.revision_count || 0,
            subtasks: t.subtasks || [],
            requirementIds: t.requirement_ids || [],
            labels: t.labels || [],
            latestSubmissionId: t.latest_submission_id,
            submissionCount: t.submission_count || 0,
            createdAt: t.created_at,
            updatedAt: t.updated_at,
          });
        }
      }

      // Preload requirements
      const { data: requirements, error: reqErr } = await client.from('requirements').select('*');
      if (!reqErr && requirements && requirements.length) {
        const reqMap = this.getCollectionMap('requirements');
        for (const r of requirements) {
          reqMap.set(r.id, {
            id: r.id,
            projectId: r.project_id,
            title: r.title,
            details: r.details || '',
            status: r.status,
            fileUrls: r.file_urls || [],
            files: r.files || [],
            createdAt: r.created_at,
          });
        }
      }

      // Preload submissions
      const { data: submissions, error: subErr } = await client.from('submissions').select('*');
      if (!subErr && submissions && submissions.length) {
        const subMap = this.getCollectionMap('submissions');
        for (const s of submissions) {
          subMap.set(s.id, {
            id: s.id,
            taskId: s.task_id,
            projectId: s.project_id,
            submittedBy: s.submitted_by,
            fileName: s.file_name,
            fileUrl: s.file_url,
            files: s.files || [],
            note: s.note || '',
            version: s.version || 1,
            submittedAt: s.submitted_at,
          });
        }
      }

      // Preload reviews
      const { data: reviews, error: revErr } = await client.from('reviews').select('*');
      if (!revErr && reviews && reviews.length) {
        const revMap = this.getCollectionMap('reviews');
        for (const rv of reviews) {
          revMap.set(rv.id, {
            id: rv.id,
            taskId: rv.task_id,
            projectId: rv.project_id,
            submissionId: rv.submission_id,
            reviewerId: rv.reviewer_id,
            decision: rv.decision,
            comments: rv.comments || '',
            createdAt: rv.created_at,
          });
        }
      }

      // Preload feedback
      const { data: feedback, error: fbErr } = await client.from('feedback').select('*');
      if (!fbErr && feedback && feedback.length) {
        const fbMap = this.getCollectionMap('feedback');
        for (const f of feedback) {
          fbMap.set(f.id, {
            id: f.id,
            projectId: f.project_id,
            projectTitle: f.project_title,
            taskTitle: f.task_title,
            clientId: f.client_id,
            comment: f.comment,
            status: f.status,
            repliesCount: f.replies_count || 0,
            response: f.response,
            respondedBy: f.responded_by,
            createdAt: f.created_at,
            updatedAt: f.updated_at,
          });
        }
      }

      // Preload notifications
      const { data: notifications, error: notifErr } = await client.from('notifications').select('*');
      if (!notifErr && notifications && notifications.length) {
        const notifMap = this.getCollectionMap('notifications');
        for (const n of notifications) {
          notifMap.set(n.id, {
            id: n.id,
            userId: n.user_id,
            message: n.message,
            type: n.type,
            link: n.link,
            isRead: n.is_read,
            read: n.is_read,
            createdAt: n.created_at,
          });
        }
      }

      // Preload activity_logs
      const { data: activityLogs, error: actErr } = await client.from('activity_logs').select('*');
      if (!actErr && activityLogs && activityLogs.length) {
        const actMap = this.getCollectionMap('activityLogs');
        for (const a of activityLogs) {
          actMap.set(a.id, {
            id: a.id,
            projectId: a.project_id,
            actorId: a.actor_id,
            actorName: a.actor_name,
            action: a.action,
            targetType: a.target_type,
            targetId: a.target_id,
            audienceIds: a.audience_ids || [],
            createdAt: a.created_at,
          });
        }
      }

      // Preload project_documents
      const { data: documents, error: docErr } = await client.from('project_documents').select('*');
      if (!docErr && documents && documents.length) {
        for (const d of documents) {
          const subColKey = `projects/${d.project_id}/documents`;
          const docMap = this.getCollectionMap(subColKey);
          docMap.set(d.id, {
            id: d.id,
            projectId: d.project_id,
            name: d.name,
            storagePath: d.storage_path,
            url: d.url,
            size: Number(d.size) || 0,
            type: d.type,
            uploadedBy: d.uploaded_by,
            uploadedAt: d.uploaded_at,
          });
        }
      }
    } catch (err) {
      console.warn('[devDb] Supabase preload error:', err.message);
    }
  }

  createDocRef(collectionName, docId) {
    const id = docId || generateId(collectionName);
    const self = this;
    return {
      __kind: 'doc',
      id,
      collectionName,
      path: `${collectionName}/${id}`,
      collection(subName) {
        return self.createSubcollectionRef(collectionName, id, subName);
      },
      async get() {
        return self.getDocSnapshot(collectionName, id);
      },
      async set(data) {
        return self.setDoc(collectionName, id, data);
      },
      async update(data) {
        return self.updateDoc(collectionName, id, data);
      },
      async delete() {
        return self.deleteDoc(collectionName, id);
      },
    };
  }

  createSubcollectionRef(parentCollection, parentId, subName) {
    const subColKey = `${parentCollection}/${parentId}/${subName}`;
    const self = this;
    return {
      __kind: 'subcollection',
      collectionName: subColKey,
      path: subColKey,
      doc(docId) {
        const id = docId || generateId(subName);
        return {
          id,
          collectionName: subColKey,
          path: `${subColKey}/${id}`,
          async get() {
            return self.getDocSnapshot(subColKey, id);
          },
          async set(data) {
            return self.setDoc(subColKey, id, data);
          },
          async update(data) {
            return self.updateDoc(subColKey, id, data);
          },
          async delete() {
            return self.deleteDoc(subColKey, id);
          },
        };
      },
      async get() {
        return self.getQuerySnapshot(subColKey, []);
      },
    };
  }

  getDocSnapshot(collectionName, id) {
    const map = this.getCollectionMap(collectionName);
    const data = map.get(id);
    const exists = data !== undefined;
    return {
      exists,
      id,
      ref: this.createDocRef(collectionName, id),
      data: () => (exists ? { ...data } : undefined),
    };
  }

  setDoc(collectionName, id, data) {
    const map = this.getCollectionMap(collectionName);
    const record = { ...data, id };
    map.set(id, record);
    return this.syncRecordToSupabase(collectionName, id, record);
  }

  updateDoc(collectionName, id, data) {
    const map = this.getCollectionMap(collectionName);
    const existing = map.get(id) || {};
    const updated = { ...existing, ...data, id };
    map.set(id, updated);
    return this.syncRecordToSupabase(collectionName, id, updated);
  }

  deleteDoc(collectionName, id) {
    const map = this.getCollectionMap(collectionName);
    map.delete(id);
    return this.deleteRecordFromSupabase(collectionName, id);
  }

  async syncRecordToSupabase(collectionName, id, record) {
    try {
      const { isSupabaseConfigured, getSupabase } = require('../config/supabase');
      if (!isSupabaseConfigured()) return;
      const client = getSupabase({ requireServiceRole: true });

      if (collectionName === 'users') {
        await client.from('users').upsert({
          id,
          name: record.name || 'User',
          email: record.email || `${id}@taskorbit.local`,
          role: record.role || 'client',
          job_title: record.jobTitle || null,
          department: record.department || null,
          phone: record.phone || null,
          bio: record.bio || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      } else if (collectionName === 'projects') {
        const clientId = record.clientId || record.client_id;
        if (!clientId) return;

        // Ensure client user exists
        await client.from('users').upsert({
          id: clientId,
          name: record.clientName || 'Client User',
          email: `${clientId}@taskorbit.local`,
          role: 'client',
        }, { onConflict: 'id' });

        if (record.managerId) {
          await client.from('users').upsert({
            id: record.managerId,
            name: record.managerName || 'Manager User',
            email: `${record.managerId}@taskorbit.local`,
            role: 'manager',
          }, { onConflict: 'id' });
        }

        await client.from('projects').upsert({
          id,
          title: record.title || 'Untitled Project',
          description: record.description || '',
          client_id: clientId,
          manager_id: record.managerId || record.manager_id || null,
          status: record.status || 'submitted',
          priority: record.priority || 'medium',
          start_date: toDateOnly(record.startDate || record.start_date) || new Date().toISOString().slice(0, 10),
          deadline: toDateOnly(record.deadline) || new Date().toISOString().slice(0, 10),
          progress: typeof record.progress === 'number' ? Math.round(record.progress) : 0,
          tasks_completed: Number(record.tasksCompleted || record.tasks_completed) || 0,
          total_tasks: Number(record.totalTasks || record.total_tasks) || 0,
          member_ids: Array.isArray(record.memberIds || record.member_ids) ? (record.memberIds || record.member_ids) : [],
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      } else if (collectionName === 'tasks') {
        if (!record.projectId || !record.assigneeId || !record.reviewerId) return;

        // Ensure users exist
        await client.from('users').upsert([
          { id: record.assigneeId, name: 'Assignee', email: `${record.assigneeId}@taskorbit.local`, role: 'assignee' },
          { id: record.reviewerId, name: 'Reviewer', email: `${record.reviewerId}@taskorbit.local`, role: 'reviewer' },
        ], { onConflict: 'id' });

        await client.from('tasks').upsert({
          id,
          project_id: record.projectId,
          title: record.title || 'Untitled Task',
          description: record.description || '',
          assignee_id: record.assigneeId,
          reviewer_id: record.reviewerId,
          start_date: toDateOnly(record.startDate) || new Date().toISOString().slice(0, 10),
          deadline: toDateOnly(record.deadline) || new Date().toISOString().slice(0, 10),
          priority: record.priority || 'medium',
          status: record.status || 'todo',
          conflict_with: Array.isArray(record.conflictWith) ? record.conflictWith : [],
          revision_count: Number(record.revisionCount) || 0,
          subtasks: Array.isArray(record.subtasks) ? record.subtasks : [],
          requirement_ids: Array.isArray(record.requirementIds) ? record.requirementIds : [],
          labels: Array.isArray(record.labels) ? record.labels : [],
          latest_submission_id: record.latestSubmissionId || null,
          submission_count: Number(record.submissionCount) || 0,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      } else if (collectionName === 'requirements') {
        if (!record.projectId) return;
        await client.from('requirements').upsert({
          id,
          project_id: record.projectId,
          title: record.title || 'Requirement',
          details: record.details || '',
          status: record.status || 'Pending',
          file_urls: Array.isArray(record.fileUrls) ? record.fileUrls : [],
          files: Array.isArray(record.files) ? record.files : [],
        }, { onConflict: 'id' });
      } else if (collectionName === 'submissions') {
        if (!record.taskId || !record.projectId || !record.submittedBy) return;
        await client.from('users').upsert({
          id: record.submittedBy,
          name: 'Assignee',
          email: `${record.submittedBy}@taskorbit.local`,
          role: 'assignee',
        }, { onConflict: 'id' });

        await client.from('submissions').upsert({
          id,
          task_id: record.taskId,
          project_id: record.projectId,
          submitted_by: record.submittedBy,
          file_name: record.fileName || record.files?.[0]?.name || 'submission.zip',
          file_url: record.fileUrl || record.files?.[0]?.url || '',
          files: Array.isArray(record.files) ? record.files : [],
          note: record.note || '',
          version: Number(record.version) || 1,
          submitted_at: toIsoString(record.submittedAt),
        }, { onConflict: 'id' });
      } else if (collectionName === 'reviews') {
        if (!record.taskId || !record.projectId || !record.reviewerId) return;
        await client.from('users').upsert({
          id: record.reviewerId,
          name: 'Reviewer',
          email: `${record.reviewerId}@taskorbit.local`,
          role: 'reviewer',
        }, { onConflict: 'id' });

        await client.from('reviews').upsert({
          id,
          task_id: record.taskId,
          project_id: record.projectId,
          submission_id: record.submissionId || null,
          reviewer_id: record.reviewerId,
          decision: record.decision,
          comments: record.comments || '',
          created_at: toIsoString(record.createdAt),
        }, { onConflict: 'id' });
      } else if (collectionName === 'feedback') {
        if (!record.projectId || !record.clientId) return;
        await client.from('users').upsert({
          id: record.clientId,
          name: 'Client User',
          email: `${record.clientId}@taskorbit.local`,
          role: 'client',
        }, { onConflict: 'id' });

        await client.from('feedback').upsert({
          id,
          project_id: record.projectId,
          project_title: record.projectTitle || 'Project',
          task_title: record.taskTitle || 'Project feedback',
          client_id: record.clientId,
          comment: record.comment || '',
          status: record.status || 'Pending',
          replies_count: Number(record.repliesCount) || 0,
          response: record.response || null,
          responded_by: record.respondedBy || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      } else if (collectionName === 'notifications') {
        if (!record.userId) return;
        await client.from('users').upsert({
          id: record.userId,
          name: 'User',
          email: `${record.userId}@taskorbit.local`,
          role: 'client',
        }, { onConflict: 'id' });

        await client.from('notifications').upsert({
          id,
          user_id: record.userId,
          message: record.message || '',
          type: record.type || 'info',
          link: record.link || '',
          is_read: Boolean(record.isRead !== undefined ? record.isRead : record.read),
          created_at: toIsoString(record.createdAt),
        }, { onConflict: 'id' });
      } else if (collectionName === 'activityLogs') {
        if (!record.actorId) return;
        await client.from('users').upsert({
          id: record.actorId,
          name: record.actorName || 'User',
          email: `${record.actorId}@taskorbit.local`,
          role: 'client',
        }, { onConflict: 'id' });

        await client.from('activity_logs').upsert({
          id,
          project_id: record.projectId || '',
          actor_id: record.actorId,
          actor_name: record.actorName || 'User',
          action: record.action || 'action',
          target_type: record.targetType || 'item',
          target_id: record.targetId || id,
          audience_ids: Array.isArray(record.audienceIds) ? record.audienceIds : [],
          created_at: toIsoString(record.createdAt),
        }, { onConflict: 'id' });
      } else if (collectionName.includes('/documents')) {
        const parts = collectionName.split('/');
        const projectId = parts[1];
        await client.from('project_documents').upsert({
          id,
          project_id: projectId,
          name: record.name || 'document',
          storage_path: record.storagePath || id,
          url: record.url || '',
          size: Number(record.size) || 0,
          type: record.type || 'application/octet-stream',
          uploaded_by: record.uploadedBy || null,
          uploaded_at: toIsoString(record.uploadedAt),
        }, { onConflict: 'id' });
      }
    } catch (err) {
      console.warn(`[devDb] Supabase sync error for ${collectionName}:`, err.message);
    }
  }

  async deleteRecordFromSupabase(collectionName, id) {
    try {
      const { isSupabaseConfigured, getSupabase } = require('../config/supabase');
      if (!isSupabaseConfigured()) return;
      const client = getSupabase({ requireServiceRole: true });

      if (collectionName === 'tasks') {
        await client.from('tasks').delete().eq('id', id);
      } else if (collectionName === 'projects') {
        await client.from('projects').delete().eq('id', id);
      } else if (collectionName === 'requirements') {
        await client.from('requirements').delete().eq('id', id);
      } else if (collectionName === 'submissions') {
        await client.from('submissions').delete().eq('id', id);
      } else if (collectionName === 'reviews') {
        await client.from('reviews').delete().eq('id', id);
      } else if (collectionName === 'feedback') {
        await client.from('feedback').delete().eq('id', id);
      } else if (collectionName === 'notifications') {
        await client.from('notifications').delete().eq('id', id);
      } else if (collectionName === 'activityLogs') {
        await client.from('activity_logs').delete().eq('id', id);
      } else if (collectionName.includes('/documents')) {
        await client.from('project_documents').delete().eq('id', id);
      }
    } catch (err) {
      console.warn(`[devDb] Supabase delete error for ${collectionName}:`, err.message);
    }
  }

  collection(name) {
    return this.createQuery(name, []);
  }

  createQuery(collectionName, filters = [], orderByClause = null, limitCount = null) {
    const self = this;
    const query = {
      __kind: 'query',
      collectionName,
      filters,
      orderByClause,
      limitCount,
      doc(id) {
        return self.createDocRef(collectionName, id);
      },
      async add(data) {
        const id = generateId(collectionName);
        await self.setDoc(collectionName, id, data);
        return self.createDocRef(collectionName, id);
      },
      where(field, operator, value) {
        return self.createQuery(collectionName, [...filters, { field, operator, value }], orderByClause, limitCount);
      },
      orderBy(field, direction = 'asc') {
        return self.createQuery(collectionName, filters, { field, direction }, limitCount);
      },
      limit(n) {
        return self.createQuery(collectionName, filters, orderByClause, n);
      },
      async get() {
        return self.getQuerySnapshot(collectionName, filters, orderByClause, limitCount);
      },
    };
    return query;
  }

  getQuerySnapshot(collectionName, filters = [], orderByClause = null, limitCount = null) {
    const map = this.getCollectionMap(collectionName);
    let items = Array.from(map.entries()).map(([id, data]) => ({ id, ...data }));

    for (const f of filters) {
      if (f.operator === '==') {
        items = items.filter((item) => item[f.field] === f.value);
      } else if (f.operator === 'array-contains') {
        items = items.filter((item) => Array.isArray(item[f.field]) && item[f.field].includes(f.value));
      } else if (f.operator === '>=') {
        items = items.filter((item) => item[f.field] >= f.value);
      } else if (f.operator === '<=') {
        items = items.filter((item) => item[f.field] <= f.value);
      }
    }

    if (orderByClause) {
      const { field, direction } = orderByClause;
      items.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        if (valA === valB) return 0;
        const comp = valA > valB ? 1 : -1;
        return direction === 'desc' ? -comp : comp;
      });
    }

    if (limitCount !== null && Number.isFinite(limitCount)) {
      items = items.slice(0, limitCount);
    }

    const docs = items.map((item) => ({
      exists: true,
      id: item.id,
      ref: this.createDocRef(collectionName, item.id),
      data: () => ({ ...item }),
    }));

    return {
      docs,
      empty: docs.length === 0,
      size: docs.length,
      forEach(callback) {
        docs.forEach(callback);
      },
    };
  }

  batch() {
    const operations = [];
    const self = this;
    return {
      set(docRef, data) {
        operations.push(() => self.setDoc(docRef.collectionName, docRef.id, data));
      },
      update(docRef, data) {
        operations.push(() => self.updateDoc(docRef.collectionName, docRef.id, data));
      },
      delete(docRef) {
        operations.push(() => self.deleteDoc(docRef.collectionName, docRef.id));
      },
      async commit() {
        for (const op of operations) {
          await op();
        }
      },
    };
  }

  async runTransaction(callback) {
    const self = this;
    const tx = {
      async get(target) {
        if (target.__kind === 'query') {
          return self.getQuerySnapshot(target.collectionName, target.filters, target.orderByClause, target.limitCount);
        }
        return self.getDocSnapshot(target.collectionName, target.id);
      },
      set(docRef, data) {
        return self.setDoc(docRef.collectionName, docRef.id, data);
      },
      update(docRef, data) {
        return self.updateDoc(docRef.collectionName, docRef.id, data);
      },
      delete(docRef) {
        return self.deleteDoc(docRef.collectionName, docRef.id);
      },
    };
    return callback(tx);
  }

  reset() {
    this.collections.clear();
    this.initDefaultSeed();
  }
}

let devDbInstance = null;

function getDevDb() {
  if (!devDbInstance) {
    devDbInstance = new DevFirestore();
  }
  return devDbInstance;
}

module.exports = { DevFirestore, getDevDb };
