const { getAdmin, db } = require('../config/firebase');
const { err } = require('../middleware/auth');
const { isSupabaseConfigured, getSupabase } = require('../config/supabase');

const VALID_ROLES = ['client', 'manager', 'assignee', 'reviewer'];

// Public registration supports every workspace role. The authenticated
// manager route remains limited to assignee and reviewer provisioning.
async function register(req, res) {
  const { name = '', email = '', password = '', role = '' } = req.body || {};
  const selectedRole = String(role).trim().toLowerCase();
  const cleanEmail = String(email).trim().toLowerCase();
  if (String(name).trim() === '') return err(res, 400, 'invalid-argument', 'Name is required');
  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return err(res, 400, 'invalid-argument', 'Enter a valid email address');
  if (String(password).length < 6) return err(res, 400, 'invalid-argument', 'Password must be at least 6 characters');
  if (!VALID_ROLES.includes(selectedRole)) return err(res, 400, 'invalid-argument', 'Pick a role: client, manager, assignee or reviewer');
  if (req.user?.role === 'manager' && !['assignee', 'reviewer'].includes(selectedRole)) {
    return err(res, 403, 'forbidden', 'Managers can provision assignee or reviewer accounts only.');
  }
  if (String(name).trim().length > 120 || String(password).length > 128) return err(res, 400, 'invalid-argument', 'Name or password is too long');

  const database = db();
  // Check if email already registered in users collection
  const usersCol = database.collection('users');
  if (typeof usersCol.where === 'function') {
    const existingSnap = await usersCol.where('email', '==', cleanEmail).get();
    if (!existingSnap.empty) {
      return err(res, 400, 'already-exists', 'This email is already registered. Sign in instead.');
    }
  }

  let uid = `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    const admin = getAdmin();
    if (admin && typeof admin.auth === 'function') {
      const created = await admin.auth().createUser({ email: cleanEmail, password: String(password), displayName: String(name).trim() });
      if (created && created.uid) uid = created.uid;
      await admin.auth().setCustomUserClaims(uid, { role: selectedRole });
    }
  } catch (e) {
    if (e.code === 'auth/email-already-exists' || e.code === 'auth/email-already-in-use') {
      return err(res, 400, 'already-exists', 'This email is already registered. Sign in instead.');
    }
    if (e.code === 'auth/invalid-email') {
      return err(res, 400, 'invalid-argument', 'Enter a valid email address');
    }
  }

  const userRecord = {
    id: uid,
    name: String(name).trim(),
    email: cleanEmail,
    role: selectedRole,
    createdAt: new Date(),
  };

  await database.collection('users').doc(uid).set(userRecord);

  // Sync to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabase({ requireServiceRole: true });
      await client.from('users').upsert({
        id: uid,
        name: String(name).trim(),
        email: cleanEmail,
        role: selectedRole,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    } catch (err) {
      console.warn('[Auth] Supabase user sync warning:', err.message);
    }
  }

  await database.collection('activityLogs').add({
    projectId: '',
    actorId: uid,
    actorName: String(name).trim(),
    action: `registered as ${selectedRole}`,
    targetType: 'user',
    targetId: uid,
    createdAt: new Date(),
  });

  return res.status(201).json({ uid, role: selectedRole });
}

// Trusted Google provisioning. Keeps an existing role; a first-time account
// uses the role selected during sign-in. Existing roles are never overwritten.
async function ensureGoogleUser(req, res) {
  const requestedRole = String(req.body?.role ?? 'client').trim().toLowerCase();
  if (!VALID_ROLES.includes(requestedRole)) return err(res, 400, 'invalid-argument', 'Pick a role: client, manager, assignee or reviewer');

  const database = db();
  const uid = req.user.uid;
  const existing = await database.collection('users').doc(uid).get();
  if (existing.exists && existing.data().role) {
    return res.json({ role: existing.data().role, name: existing.data().name });
  }

  let name = req.user.name || req.user.email || 'User';
  try {
    const admin = getAdmin();
    if (admin && typeof admin.auth === 'function') {
      const record = await admin.auth().getUser(uid).catch(() => null);
      if (record?.displayName) name = record.displayName;
      await admin.auth().setCustomUserClaims(uid, { role: requestedRole });
    }
  } catch {}

  await database.collection('users').doc(uid).set({
    name,
    email: req.user.email || '',
    role: requestedRole,
    createdAt: new Date(),
  });

  return res.status(201).json({ role: requestedRole, name });
}

module.exports = { register, ensureGoogleUser };
