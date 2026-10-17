const { test, expect } = require('@playwright/test');

async function mount(page, role, path = `/${role}`) {
  await page.route('**/api/**', route => route.fulfill({ json: { ok: true } }));
  await page.route('**/__design_fixture__', route => route.fulfill({
    contentType: 'text/html',
    body: `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="root"></div><script type="module">import RefreshRuntime from '/@react-refresh';RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script><script type="module" src="/tests/workspace-fixture.jsx?role=${role}&path=${encodeURIComponent(path)}"></script></body></html>`,
  }));
  await page.goto('/__design_fixture__');
  await expect(page.locator('main h1').first()).toBeVisible();
}

// Measure the rendered foreground against composited ancestor backgrounds,
// rather than asserting that a particular token happens to have a given value.
async function contrastFailures(page, scope = '#root') {
  return page.locator(scope).evaluate(root => {
    const rgba = value => (value.match(/[\d.]+/g) || []).map(Number);
    const blend = (fg, bg) => fg.slice(0, 3).map((v, i) => v * (fg[3] ?? 1) + bg[i] * (1 - (fg[3] ?? 1)));
    const luminance = rgb => rgb.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    const failures = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const element = node.parentElement;
      if (!node.textContent.trim() || !element || element.closest('script, style, option, [disabled], [aria-hidden="true"]')) continue;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height || rect.right <= 0 || rect.left >= innerWidth || style.visibility === 'hidden') continue;
      const ancestors = [];
      let hidden = false;
      for (let current = element; current; current = current.parentElement) {
        const css = getComputedStyle(current);
        if (css.display === 'none' || +css.opacity < 1 || css.clip !== 'auto') hidden = true;
        ancestors.unshift(css.backgroundColor);
      }
      if (hidden) continue;
      const background = ancestors.reduce((bg, color) => blend(rgba(color), bg), [255, 255, 255]);
      const foreground = blend(rgba(style.color), background);
      const a = luminance(foreground), b = luminance(background);
      const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
      const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && parseFloat(style.fontWeight) >= 700);
      if (ratio < (large ? 3 : 4.5)) failures.push({ text: node.textContent.trim().slice(0, 55), ratio: +ratio.toFixed(2), color: style.color, background: background.map(Math.round) });
    }
    return failures;
  });
}

for (const role of ['client', 'manager', 'assignee', 'reviewer']) {
  test(`${role} dashboard has readable text and contained responsive layouts`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mount(page, role);
    for (const width of [1440, 1280, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 960 });
      const main = page.locator('#workspace-content');
      expect(await main.evaluate(el => el.scrollWidth <= el.clientWidth + 1), `workspace overflow at ${width}px`).toBeTruthy();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `page overflow at ${width}px`).toBeTruthy();
      expect(await contrastFailures(page), `text contrast at ${width}px`).toEqual([]);
      if (width === 1440 || width === 390) await page.screenshot({ path: testInfo.outputPath(`${role}-${width}.png`), animations: 'disabled' });
    }
  });
}

for (const [role, path] of [
  ['manager', '/manager/timeline'], ['client', '/client/progress'],
  ['assignee', '/assignee/timeline'], ['reviewer', '/reviewer/reviews/task-1'],
  ['manager', '/settings'], ['manager', '/manager/projects/project-1'],
  ['manager', '/manager/projects'], ['manager', '/manager/tasks'],
  ['manager', '/manager/team'], ['manager', '/manager/conflicts'],
  ['manager', '/manager/reports'], ['manager', '/manager/tasks/task-1'],
  ['client', '/client/projects'], ['client', '/client/requirements'],
  ['client', '/client/documents'], ['client', '/client/feedback'], ['client', '/client/new'],
  ['assignee', '/assignee/tasks'], ['assignee', '/assignee/tasks/task-1'],
  ['assignee', '/assignee/history'], ['assignee', '/assignee/revisions'], ['assignee', '/assignee/documents'],
  ['reviewer', '/reviewer/queue'], ['reviewer', '/reviewer/history'], ['reviewer', '/reviewer/documents'],
  ['manager', '/profile'], ['manager', '/notifications'],
]) {
  test(`${path} retains readable controls at narrow widths`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mount(page, role, path);
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 960 });
      expect(await page.locator('#workspace-content').evaluate(el => el.scrollWidth <= el.clientWidth + 1), `workspace overflow at ${width}px`).toBeTruthy();
      expect(await contrastFailures(page), `text contrast at ${width}px`).toEqual([]);
    }
    await page.screenshot({ path: testInfo.outputPath('mobile.png'), animations: 'disabled' });
  });
}

test('task dialog text, focus and fields remain readable on mobile', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mount(page, 'manager');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Create Task', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Create task', exact: true });
  await expect(dialog).toBeVisible();
  expect(await contrastFailures(page, '[role="dialog"]')).toEqual([]);
  expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBeTruthy();
  await page.screenshot({ path: testInfo.outputPath('create-task-mobile.png'), animations: 'disabled' });
});

test('public and authentication pages remain readable and responsive', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of ['/', '/login', '/register']) {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto(path);
    await expect(page.locator('h1, h2').first()).toBeVisible();
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 960 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} overflow at ${width}px`).toBeTruthy();
      expect(await contrastFailures(page), `${path} contrast at ${width}px`).toEqual([]);
      if (width === 1440 || width === 390) await page.screenshot({ path: testInfo.outputPath(`${path.slice(1) || 'landing'}-${width}.png`), animations: 'disabled' });
    }
  }
});
