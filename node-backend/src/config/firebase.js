try {
  // eslint-disable-next-line global-require
  require('dotenv').config();
} catch {
  // dotenv optional in hosted environments that inject env vars directly.
}
let admin = null;

function getAdmin() {
  if (admin !== null) return admin;
  // Lazy require so Jest (which never calls this) does not need credentials.
  // eslint-disable-next-line global-require
  admin = require('firebase-admin');
  if (admin.apps.length === 0) {
    admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
  }
  return admin;
}

function db() {
  return getAdmin().firestore();
}

module.exports = { getAdmin, db };
