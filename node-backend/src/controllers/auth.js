const { getAdmin, db } = require('../config/firebase');
const { err } = require('../middleware/auth');

const VALID_ROLES = ['client', 'manager', 'assignee', 'reviewer'];

// Public: self-registration with explicit role choice.
// Creates the Auth user, sets the role custom claim, writes users/{uid}.
// Enforcement still lives server-side: guards, middleware and rules read the claim.
async function register(req, res) {
  const { name = '', email = '', password = '', role = '' } = req.body || {};
  const cleanEmail = String(email).trim().toLowerCase();
  if (String(name).trim() === '') return err(res, 400, 'invalid-argument', 'Name is required');
  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return err(res, 400, 'invalid-argument', 'Enter a valid email address');
  if (String(password).length < 6) return err(res, 400, 'invalid-argument', 'Password must be at least 6 characters');
  if (!VALID_ROLES.includes(role)) return err(res, 400, 'invalid-argument', 'Pick a role: client, manager, assignee or reviewer');

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

  await admin.auth().setCustomUserClaims(user.uid, { role });
  await db().collection('users').doc(user.uid).set({
    name: String(name).trim(),
    email: cleanEmail,
    role,
    createdAt: new Date(),
  });
  await db().collection('activityLogs').add({
    projectId: '',
    actorId: user.uid,
    actorName: String(name).trim(),
    action: `registered as ${role}`,
    targetType: 'user',
    targetId: user.uid,
    createdAt: new Date(),
  });
  return res.status(201).json({ uid: user.uid, role });
}

module.exports = { register };
