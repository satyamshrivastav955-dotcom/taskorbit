const path = require('path');
require('dotenv').config({path:path.resolve(__dirname,'../../.env')});
let admin;
function getAdmin() {
  if (admin?.apps?.length) return admin;
  admin = require('firebase-admin');
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const options = {projectId,storageBucket:process.env.FIREBASE_STORAGE_BUCKET || projectId + '.firebasestorage.app'};
    if (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      // Firestore/Storage require an ADC-shaped credential, but emulator
      // initialization must not read the configured live service-account file.
      const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
      try { options.credential = admin.credential.applicationDefault(); }
      finally { if (credentialPath !== undefined) process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialPath; }
      options.credential.getAccessToken = async () => ({ access_token: 'owner', expires_in: 3600 });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      options.credential = admin.credential.cert(require(path.resolve(__dirname,'../../',process.env.GOOGLE_APPLICATION_CREDENTIALS)));
    }
    admin.initializeApp(options);
  }
  return admin;
}
const db = () => getAdmin().firestore();
module.exports = {getAdmin,db};
