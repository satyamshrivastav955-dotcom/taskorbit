const { getAdmin, db } = require('../config/firebase');
const { err } = require('../middleware/auth');

const VALID_ROLES = ['client', 'manager', 'assignee', 'reviewer'];

// Public registration supports every workspace role. The authenticated
// manager route remains limited to assignee and reviewer provisioning.
// Creates the Auth user, sets the role custom claim, writes users/{uid}.
// Enforcement still lives server-side: guards, middleware and rules read the claim.
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

  const admin = getAdmin();
  let user;
  try {
    user = await admin.auth().createUser({
      email: cleanEmail,
      password: String(password),
      displayName: String(name).trim(),
    });
  } catch (e) {
    if (e.code === 'auth/email-already-exists' || e.code === 'auth/email-already-in-use') {
      return err(res, 400, 'already-exists', 'This email is already registered. Sign in instead.');
    }
    if (e.code === 'auth/invalid-email') {
      return err(res, 400, 'invalid-argument', 'Enter a valid email address');
    }
    return err(res, 500, 'internal', 'Registration failed. Try again.');
  }

  try {
    await admin.auth().setCustomUserClaims(user.uid, { role: selectedRole });
    await db().collection('users').doc(user.uid).set({
    name: String(name).trim(),
    email: cleanEmail,
    role: selectedRole,
    createdAt: new Date(),
    });
  } catch (error) {
    await admin.auth().deleteUser(user.uid).catch(() => {});
    throw error;
  }
  await db().collection('activityLogs').add({
    projectId: '',
    actorId: user.uid,
    actorName: String(name).trim(),
    action: `registered as ${selectedRole}`,
    targetType: 'user',
    targetId: user.uid,
    createdAt: new Date(),
  });
  return res.status(201).json({ uid: user.uid, role: selectedRole });
}

module.exports = { register };

// Trusted Google provisioning. Keeps an existing role; a first-time account
// uses the role selected during sign-in. Existing roles are never overwritten.
async function ensureGoogleUser(req, res) {
  const requestedRole = String(req.body?.role ?? 'client').trim().toLowerCase();
  if (!VALID_ROLES.includes(requestedRole)) return err(res, 400, 'invalid-argument', 'Pick a role: client, manager, assignee or reviewer');
  const admin = getAdmin();
  const uid = req.user.uid;
  const existing = await db().collection('users').doc(uid).get();
  if (existing.exists && existing.data().role) {
    if (!req.user.role) await admin.auth().setCustomUserClaims(uid, { ...(await admin.auth().getUser(uid)).customClaims, role: existing.data().role });
    return res.json({ role: existing.data().role, name: existing.data().name });
  }
  const record = await admin.auth().getUser(uid);
  const name = record.displayName || (record.email || 'User');
  await admin.auth().setCustomUserClaims(uid, { role: requestedRole });
  await db().collection('users').doc(uid).set({
    name,
    email: record.email || '',
    role: requestedRole,
    createdAt: new Date(),
  });
  return res.status(201).json({ role: requestedRole, name });
}

module.exports.ensureGoogleUser = ensureGoogleUser;
