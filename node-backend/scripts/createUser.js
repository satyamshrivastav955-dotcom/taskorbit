/* Manual account creation with explicit role.
 * Usage: node scripts/createUser.js <email> <password> <role> <name...>
 * Example: node scripts/createUser.js you@mail.com Secret123! manager "Your Name"
 * Role is stored as a Firebase custom claim AND in users/{uid}. */
require('dotenv').config();
const { getAdmin } = require('../src/config/firebase');

const VALID = ['client', 'manager', 'assignee', 'reviewer'];

async function main() {
  const [email, password, role, ...nameParts] = process.argv.slice(2);
  const name = nameParts.join(' ');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error('Provide a valid email');
  if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');
  if (!VALID.includes(role)) throw new Error(`Role must be one of: ${VALID.join(', ')}`);
  if (name.trim() === '') throw new Error('Provide a display name');

  const admin = getAdmin();
  let user;
  try {
    user = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(user.uid, { password, displayName: name });
  } catch (e) {
    if (e.code !== 'auth/user-not-found') throw e;
    user = await admin.auth().createUser({ email, password, displayName: name });
  }
  await admin.auth().setCustomUserClaims(user.uid, { role });
  await admin.auth().revokeRefreshTokens(user.uid);
  await admin.firestore().collection('users').doc(user.uid).set(
    { name, email, role, createdAt: new Date() },
    { merge: true },
  );
  // eslint-disable-next-line no-console
  console.log(`Ready: ${email} as ${role}. Sign in with the password you provided.`);
}

if (require.main === module) {
  main().catch((e) => { console.error(e.message); process.exit(1); }); // eslint-disable-line no-console
}
