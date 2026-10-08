const { spawn } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const children = [];
let stopping = false;
function stop(signal = 'SIGTERM') {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (child.exitCode === null) child.kill(signal);
}
for (const [folder, entry, args] of [
  ['node-backend', 'src/server.js', []],
  ['frontend', 'node_modules/vite/bin/vite.js', ['--host', '127.0.0.1', '--strictPort']],
]) {
  const child = spawn(process.execPath, [path.join(root, folder, entry), ...args], { cwd: path.join(root, folder), stdio: 'inherit', env: process.env });
  children.push(child);
  child.on('error', (error) => { console.error(`${folder}: ${error.message}`); process.exitCode = 1; stop(); });
  child.on('exit', (code) => { if (!stopping) { process.exitCode = code ?? 1; stop(); } });
}
process.on('SIGINT', () => stop('SIGINT'));
process.on('SIGTERM', () => stop());
console.log('TaskOrbit local development: frontend http://127.0.0.1:5173 · API http://127.0.0.1:4000/api');
console.log('This runs the real services with their existing .env configuration; no demo data is substituted.');
