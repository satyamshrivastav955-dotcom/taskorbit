const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/ui',
  timeout: 45000,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    browserName: 'chromium',
    headless: true,
    screenshot: 'only-on-failure',
    // Windows-mounted WSL folders cannot preserve Playwright trace copy metadata.
    trace: process.platform === 'linux' && process.cwd().startsWith('/mnt/') ? 'off' : 'retain-on-failure',
  },
  webServer: {
    command: 'npm --prefix frontend run dev -- --host 127.0.0.1 --strictPort',
    url: 'http://127.0.0.1:5173',
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});
