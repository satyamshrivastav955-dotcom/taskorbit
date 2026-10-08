const { db } = require('../config/firebase');
class HttpError extends Error { constructor(status, code, message) { super(message); this.status = status; this.code = code; } }
const fail = (status, code, message) => { throw new HttpError(status, code, message); };
const assert = (ok, message, status = 400) => { if (!ok) fail(status, status === 403 ? 'forbidden' : status === 409 ? 'invalid-transition' : 'invalid-argument', message); };
function text(value, name, max = 10000, required = false) { assert(typeof value === 'string' && value.length <= max && (!required || value.trim()), name + ' is invalid'); return value.trim(); }
function day(value) {
  const s = value instanceof Date ? value.toISOString().slice(0, 10) : value?.toDate ? value.toDate().toISOString().slice(0, 10) : value;
  assert(typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s), 'Use dates in YYYY-MM-DD format');
  const date = new Date(s + 'T00:00:00.000Z');
  assert(Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === s, 'Invalid calendar date');
  return date;
}
function fields(input, allowed) { assert(input && typeof input === 'object' && !Array.isArray(input), 'Invalid request body'); for (const key of Object.keys(input)) assert(allowed.includes(key), "Field '" + key + "' cannot be changed"); }
function json(value) { if (value instanceof Date) return value.toISOString(); if (value?.toDate) return value.toDate().toISOString(); if (Array.isArray(value)) return value.map(json); if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k,json(v)])); return value; }
const rows = snap => snap.docs.map(d => ({ ...d.data(), id: d.id }));
function activity(tx, user, projectId, action, targetType, targetId, audienceIds = []) { tx.set(db().collection('activityLogs').doc(), { projectId, actorId:user.uid, actorName:user.name || user.email, action, targetType, targetId, audienceIds:[...new Set([user.uid,...audienceIds])], createdAt:new Date() }); }
function notify(tx, userId, message, type, link, id) { if (!userId) return; tx.set(id ? db().collection('notifications').doc(id) : db().collection('notifications').doc(), {userId,message,type,link,read:false,createdAt:new Date()}); }
module.exports = {HttpError,fail,assert,text,day,fields,json,rows,activity,notify};
