const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { getDevDb } = require('../services/devDb');

const isDevBypassActive = () =>
  process.env.NODE_ENV !== 'production' && process.env.DEV_AUTH_BYPASS === 'true';

let admin;
function getAdmin() {
  if (admin?.apps?.length) return admin;
  try {
    admin = require('firebase-admin');
  } catch {
    return {
      auth: () => ({
        verifyIdToken: async () => { throw new Error('Firebase Auth is disabled'); },
        createUser: async (d) => ({ uid: `new-${d?.email || 'user'}` }),
        setCustomUserClaims: async () => {},
        getUser: async (uid) => ({ uid, email: `${uid}@example.com`, displayName: 'User' }),
        deleteUser: async () => {},
      }),
      firestore: () => getDevDb(),
      storage: () => ({ bucket: () => { throw new Error('Firebase Storage is disabled'); } }),
    };
  }

  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const options = { projectId, storageBucket: process.env.FIREBASE_STORAGE_BUCKET || projectId + '.firebasestorage.app' };
    if (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
      try { options.credential = admin.credential.applicationDefault(); }
      finally { if (credentialPath !== undefined) process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialPath; }
      options.credential.getAccessToken = async () => ({ access_token: 'owner', expires_in: 3600 });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const credPath = path.resolve(__dirname, '../../', process.env.GOOGLE_APPLICATION_CREDENTIALS);
      if (fs.existsSync(credPath)) {
        options.credential = admin.credential.cert(require(credPath));
      } else if (isDevBypassActive()) {
        const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
        try {
          options.credential = admin.credential.applicationDefault();
        } catch {
          options.credential = {
            getAccessToken: async () => ({ access_token: 'dev-owner', expires_in: 3600 }),
          };
        } finally {
          if (credentialPath !== undefined) process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialPath;
        }
        options.credential.getAccessToken = async () => ({ access_token: 'dev-owner', expires_in: 3600 });
      } else {
        options.credential = admin.credential.cert(require(credPath));
      }
    }
    admin.initializeApp(options);
  }
  return admin;
}

const db = () => {
  return getDevDb();
};

module.exports = { getAdmin, db, getDevDb };
