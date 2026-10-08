const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const env = { ...process.env, CI: 'true', FIREBASE_CLI_DISABLE_UPDATE_CHECK: 'true' };
const localJava = path.join(root, '.cache/java/runtime/usr/lib/jvm/java-21-openjdk-amd64');
if (!env.JAVA_HOME && process.platform === 'linux' && fs.existsSync(path.join(localJava, 'bin/java'))) {
  env.JAVA_HOME = localJava;
  env.PATH = `${path.join(localJava, 'bin')}${path.delimiter}${env.PATH}`;
}
env.FIREBASE_EMULATORS_PATH ||= path.join(root, '.cache/firebase-emulators');
const child = spawn(process.execPath, [path.join(root, 'node_modules/firebase-tools/lib/bin/firebase.js'), 'emulators:exec', '--project', 'demo-taskorbit', '--config', 'firebase/firebase.json', '--only', 'auth,firestore,storage', 'node tests/workflow.cjs'], { cwd: root, env, stdio: 'inherit' });
child.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
child.on('exit', (code) => { process.exitCode = code ?? 1; });
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
