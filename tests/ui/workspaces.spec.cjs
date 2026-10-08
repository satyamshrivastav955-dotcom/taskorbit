const { test, expect } = require('@playwright/test');

// Test-only fixture response mounts actual routes/components. It does not
// prove Firebase persistence; backend and emulator tests cover that boundary.
async function mount(page, role, path = `/${role}`, state = '') {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/api/**', (route) => route.fulfill({ json: { ok: true } }));
  await page.route('**/__ui_fixture__', (route) => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="root"></div><script type="module">import RefreshRuntime from '/@react-refresh';RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script><script type="module" src="/tests/workspace-fixture.jsx?role=${role}&path=${encodeURIComponent(path)}&state=${state}"></script></body></html>` }));
  await page.goto('/__ui_fixture__');
  return errors;
}

for (const [role, title] of [['manager', 'Delivery overview'], ['client', 'Your workspace'], ['assignee', 'Your work'], ['reviewer', 'Review workspace']]) {
  test(`${role} workspace is usable at desktop and mobile widths`, async ({ page }) => {
    const errors = await mount(page, role);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    if (role === 'manager') await page.screenshot({ path: 'test-results/workbench-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await expect(page.getByRole('navigation', { name: `${role[0].toUpperCase() + role.slice(1)} workspace` })).toBeVisible();
    await page.getByRole('button', { name: 'Close navigation', exact: true }).last().click();
    await expect(page.getByRole('button', { name: 'Open navigation' })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('project sections show task records, timeline, files and feedback', async ({ page }) => {
  const errors = await mount(page, 'manager', '/manager/projects/project-1');
  await expect(page.getByRole('heading', { name: 'Customer onboarding' })).toBeVisible();
  await page.getByRole('button', { name: 'Tasks', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Review the onboarding flow', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Timeline', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Today', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Files', exact: true }).click();
  await expect(page.getByRole('link', { name: /Project brief.pdf/ })).toHaveAttribute('href', 'https://example.test/brief.pdf');
  await page.getByRole('button', { name: 'Feedback', exact: true }).click();
  await expect(page.getByText('Please clarify the welcome message.')).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Status for Onboarding flow' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('revision selects the correct decision and keeps the dialog open without feedback', async ({ page }) => {
  await mount(page, 'reviewer', '/reviewer/reviews/task-1');
  await page.getByRole('button', { name: 'Request revision', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Review decision' });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('input[type=radio]').nth(1)).toBeChecked();
  await dialog.getByRole('button', { name: 'Request Revision', exact: true }).click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('unknown detail URLs never show a different project', async ({ page }) => {
  await mount(page, 'client', '/client/projects/does-not-exist');
  await expect(page.getByText('Project not found', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Customer onboarding' })).toHaveCount(0);
});

test('task inspectors stay current as workspace records refresh', async ({ page }) => {
  await mount(page, 'manager', '/manager/tasks');
  await page.getByRole('button', { name: /Review the onboarding flow/ }).click();
  const inspector = page.locator('aside[aria-labelledby="task-drawer-title"]');
  await expect(inspector.getByRole('heading', { name: 'Review the onboarding flow' })).toBeVisible();
  await page.evaluate(async () => {
    const { dataStore } = await import('/src/services/demoData.ts');
    dataStore.tasks = dataStore.tasks.map((task) => task.id === 'task-1' ? { ...task, title: 'Updated task title', status: 'revision' } : task);
    dataStore.notify();
  });
  await expect(inspector.getByRole('heading', { name: 'Updated task title' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(inspector).not.toBeVisible();
});

for (const [role, path, heading] of [['manager', '/manager/tasks/missing', 'Task not found'], ['assignee', '/assignee/tasks/missing', 'Task not found'], ['reviewer', '/reviewer/reviews/missing', 'Review not found']]) {
  test(`${role} unknown task links show a deliberate not-found state`, async ({ page }) => {
    await mount(page, role, path);
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Review the onboarding flow', exact: true })).toHaveCount(0);
  });
}

test('reduced-motion preference suppresses workspace entrance animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mount(page, 'manager');
  const duration = await page.locator('main > div').first().evaluate((element) => parseFloat(getComputedStyle(element).animationDuration));
  expect(duration).toBeLessThanOrEqual(0.001);
});

test('empty workspaces show meaningful next steps instead of fixture content', async ({ page }) => {
  await mount(page, 'manager', '/manager', 'empty');
  await expect(page.getByText('Your delivery schedule is clear').first()).toBeVisible();
  await expect(page.getByText('No active scheduling conflicts')).toBeVisible();
  await expect(page.getByText('Customer onboarding', { exact: true })).toHaveCount(0);
});

test('task dialogs trap focus, close with Escape, and restore the trigger', async ({ page }) => {
  await mount(page, 'manager');
  const trigger = page.getByRole('button', { name: 'Create Task', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Create task', exact: true });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Create Task', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('role guards redirect users away from another role’s workspace', async ({ page }) => {
  await mount(page, 'assignee', '/manager');
  await expect(page.getByRole('heading', { name: 'Your work', exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/assignee$/);
});

test('signed-out deep links lead to sign-in and invalid forms show feedback', async ({ page }) => {
  await page.goto('/manager/projects/project-1');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await page.getByRole('button', { name: 'Sign In', exact: false }).first().click();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
});

test('auth role selectors expose and retain every workspace role', async ({ page }) => {
  await page.goto('/register');
  const registerRole = page.getByRole('combobox', { name: 'Role' });
  await expect(registerRole.locator('option')).toHaveCount(4);
  await registerRole.selectOption('reviewer');
  await expect(registerRole).toHaveValue('reviewer');

  await page.goto('/login');
  const loginRole = page.getByRole('combobox', { name: 'Workspace role' });
  await expect(loginRole.locator('option')).toHaveCount(5);
  await loginRole.selectOption('manager');
  await expect(loginRole).toHaveValue('manager');
});

const screens = [
  ['manager', '/manager/projects', 'Projects'], ['manager', '/manager/tasks', 'Tasks'],
  ['manager', '/manager/team', 'Team'], ['manager', '/manager/timeline', 'Timeline'],
  ['manager', '/manager/conflicts', 'Conflicts'], ['manager', '/manager/reports', 'Delivery reports'],
  ['manager', '/manager/tasks/task-1', 'Review the onboarding flow'],
  ['client', '/client/projects', 'Projects'], ['client', '/client/requirements', 'Requirements'],
  ['client', '/client/documents', 'Documents'], ['client', '/client/feedback', 'Feedback'],
  ['client', '/client/progress', 'Progress'], ['client', '/client/new', 'New Project'],
  ['assignee', '/assignee/tasks', 'My Tasks'], ['assignee', '/assignee/timeline', 'My Timeline'],
  ['assignee', '/assignee/revisions', 'Revisions'], ['assignee', '/assignee/documents', 'My Documents'],
  ['assignee', '/assignee/history', 'Work History'], ['assignee', '/assignee/tasks/task-1', 'Review the onboarding flow'],
  ['reviewer', '/reviewer/queue', 'Review Queue'], ['reviewer', '/reviewer/history', 'Review History'],
  ['reviewer', '/reviewer/documents', 'Review Documents'],
  ['manager', '/profile', 'Profile'], ['manager', '/settings', 'Settings'], ['manager', '/notifications', 'Notifications'],
];
for (const [role, path, title] of screens) {
  test(`screen ${path} renders without a runtime exception`, async ({ page }) => {
    const errors = await mount(page, role, path);
    await expect(page.locator('main h1').first()).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('main h1').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    expect(errors).toEqual([]);
  });
}
