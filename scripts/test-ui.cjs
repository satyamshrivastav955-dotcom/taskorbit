const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const env = { ...process.env };
// Optional, repository-local test runtime for this WSL workspace. No global
// settings or production dependencies are changed by the launcher.
if (process.platform === 'linux') {
  const browserCache = path.join(root, '.cache/playwright');
  const libraries = path.join(root, '.cache/browser-libs/runtime/usr/lib/x86_64-linux-gnu');
  if (!env.PLAYWRIGHT_BROWSERS_PATH && fs.existsSync(browserCache)) env.PLAYWRIGHT_BROWSERS_PATH = browserCache;
  if (fs.existsSync(path.join(libraries, 'libnss3.so'))) env.LD_LIBRARY_PATH = [libraries, env.LD_LIBRARY_PATH].filter(Boolean).join(':');
}
const child = spawn(process.execPath, [path.join(root, 'node_modules/@playwright/test/cli.js'), 'test', ...process.argv.slice(2)], { cwd: root, env, stdio: 'inherit' });
child.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
child.on('exit', (code) => { process.exitCode = code ?? 1; });
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
