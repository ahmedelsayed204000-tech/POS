import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

async function pathExists(candidate) {
  try {
    await fs.access(candidate);
    return true;
  } catch {
    return false;
  }
}

async function importPlaywright() {
  try {
    return await import('playwright');
  } catch {
    // Fall through to bundled-runtime resolution.
  }

  const explicitModule = process.env.QA_PLAYWRIGHT_MODULE;
  if (explicitModule) {
    const moduleUrl = explicitModule.startsWith('file:')
      ? explicitModule
      : pathToFileURL(path.resolve(explicitModule)).href;
    return import(moduleUrl);
  }

  const runtimeRoot = path.resolve(path.dirname(process.execPath), '..');
  const pnpmRoot = path.join(runtimeRoot, 'node_modules', '.pnpm');
  if (await pathExists(pnpmRoot)) {
    const entries = await fs.readdir(pnpmRoot);
    const playwrightEntry = entries.find((entry) => /^playwright@/.test(entry));
    if (playwrightEntry) {
      const modulePath = path.join(pnpmRoot, playwrightEntry, 'node_modules', 'playwright', 'index.mjs');
      if (await pathExists(modulePath)) return import(pathToFileURL(modulePath).href);
    }
  }

  throw new Error('Playwright is not available. Install it in the project or set QA_PLAYWRIGHT_MODULE.');
}

async function chromeExecutablePath() {
  if (process.env.QA_CHROME_PATH) return process.env.QA_CHROME_PATH;
  const candidates = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  ];
  for (const candidate of candidates) {
    if (await pathExists(candidate)) return candidate;
  }
  return undefined;
}

const outDir = path.resolve('qa/ux-certification');
const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';
const { chromium } = await importPlaywright();
await fs.rm(outDir, { recursive: true, force: true });
await fs.mkdir(outDir, { recursive: true });

function certify(condition, message, details = {}) {
  return { ok: Boolean(condition), message, details };
}

async function capture(page, name) {
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file });
  return file;
}

async function viewportHealth(page) {
  return page.evaluate(() => {
    const width = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const visibleButtons = [...document.querySelectorAll('button')].filter((button) => {
      const rect = button.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
    });
    const smallTargets = visibleButtons
      .map((button) => {
        const rect = button.getBoundingClientRect();
        return {
          text: (button.getAttribute('aria-label') || button.innerText || '').trim().slice(0, 80),
          width: Number(rect.width.toFixed(1)),
          height: Number(rect.height.toFixed(1)),
        };
      })
      .filter((item) => item.width < 32 || item.height < 32);
    return {
      viewport,
      docWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      horizontalOverflow: width > window.innerWidth + 1,
      overBy: width - window.innerWidth,
      smallTargets,
      activeElement: document.activeElement?.tagName,
    };
  });
}

async function runDesktop() {
  const executablePath = await chromeExecutablePath();
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1024 } });
  const page = await context.newPage();
  const messages = [];
  const checks = [];
  const screenshots = [];

  page.on('console', (msg) => {
    if (!['debug', 'info'].includes(msg.type())) messages.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', (error) => messages.push({ type: 'pageerror', text: error.message }));
  page.on('response', (response) => {
    if (response.status() >= 400) messages.push({ type: 'response', status: response.status(), url: response.url() });
  });

  await page.goto(`${baseUrl}/app`, { waitUntil: 'networkidle' });
  screenshots.push(await capture(page, '01-desktop-today'));
  const homeHealth = await viewportHealth(page);
  checks.push(certify(!homeHealth.horizontalOverflow, 'Desktop home has no horizontal overflow.', homeHealth));
  checks.push(certify(await page.getByText(/TODAY - YOUR WAY/i).count(), 'Today screen is visible on first load.'));
  await page.goto(`${baseUrl}/app?view=tasks`, { waitUntil: 'networkidle' });
  checks.push(certify(await page.getByText(/ACTION WORKSPACE/i).count(), 'Direct workspace URL opens the requested tab.'));
  await page.getByRole('button', { name: /^Open Focus$/i }).click();
  await page.waitForTimeout(250);
  checks.push(certify(new URL(page.url()).searchParams.get('view') === 'focus', 'Tab navigation writes the active workspace to the URL.', { url: page.url() }));
  await page.goBack({ waitUntil: 'networkidle' });
  checks.push(certify(await page.getByText(/ACTION WORKSPACE/i).count(), 'Browser Back returns to the previous workspace tab.'));
  await page.goto(`${baseUrl}/app`, { waitUntil: 'networkidle' });
  checks.push(certify(await page.getByText(/TODAY'S PLAN/i).count(), 'Unified Today includes the replacement daily plan workflow.'));
  checks.push(certify(await page.getByText(/SLEEP-AWARE SCHEDULE/i).count(), 'Unified Today includes sleep-aware schedule guidance.'));
  await page.getByLabel('Record a win').fill('Certification quick win');
  await page.getByRole('button', { name: /Save win/i }).click();
  await page.waitForTimeout(250);
  checks.push(certify(await page.getByText(/Certification quick win/i).count(), 'Quick win can be added from Unified Today.'));

  await page.getByRole('button', { name: /Open .*profile and Your Garden settings/i }).click();
  await page.waitForSelector('.ux-profile-modal');
  screenshots.push(await capture(page, '02-desktop-profile'));
  checks.push(certify(new URL(page.url()).searchParams.get('profile') === '1', 'Opening profile writes modal state to the URL.', { url: page.url() }));
  await page.goBack();
  await page.waitForTimeout(300);
  checks.push(certify(await page.locator('.ux-profile-modal').count() === 0 && new URL(page.url()).searchParams.get('profile') !== '1', 'Browser Back closes the profile modal.'));
  await page.getByRole('button', { name: /Open .*profile and Your Garden settings/i }).click();
  await page.waitForSelector('.ux-profile-modal');
  await page.locator('.ux-profile-modal input').first().fill('Certification: finish one calm test journey');
  await page.locator('.ux-profile-modal textarea').first().fill('A certified journey can navigate, save, and recover without visual noise.');
  await page.getByRole('button', { name: /direct/i }).click();
  await page.getByRole('button', { name: /Save my Garden/i }).click();
  await page.waitForTimeout(1000);
  checks.push(certify(await page.locator('.ux-profile-modal').count() === 0, 'Profile check-in saves and closes.'));
  const personalization = await page.evaluate(() => {
    const raw = localStorage.getItem('pos_final');
    return raw ? JSON.parse(raw).personalization : null;
  });
  checks.push(certify(personalization?.completed === true, 'Profile completion persisted to local storage.', personalization));

  await page.getByRole('button', { name: /^Open Tasks$/i }).click();
  await page.waitForTimeout(350);
  screenshots.push(await capture(page, '03-desktop-tasks'));
  await page.getByLabel('Task title').fill('Certification task: prepare QA notes');
  await page.getByLabel('Task desired outcome').fill('A concise certification note is ready');
  await page.getByRole('button', { name: /Add with suggested next action/i }).click();
  await page.waitForTimeout(300);
  checks.push(certify(await page.getByText(/Certification task: prepare QA notes/i).count(), 'Task can be created by test user.'));

  await page.getByRole('button', { name: /^Open Focus$/i }).click();
  await page.waitForTimeout(350);
  await page.getByRole('button', { name: /Begin gently/i }).click();
  await page.waitForTimeout(500);
  screenshots.push(await capture(page, '04-desktop-focus-running'));
  checks.push(certify(await page.getByText(/CURRENT OBJECTIVE/i).count(), 'Focus session starts.'));
  await page.getByPlaceholder(/Store it here/i).fill('Remember to review mobile bottom navigation.');
  await page.getByRole('button', { name: /^Park$/i }).click();
  checks.push(certify(await page.getByText(/Remember to review mobile bottom navigation/i).count(), 'Thought parking accepts a note.'));
  await page.getByRole('button', { name: /Finish/i }).click();
  await page.waitForTimeout(300);
  checks.push(certify(await page.getByText(/GENTLE COMPLETION/i).count(), 'Focus completion reflection appears.'));
  await page.getByRole('button', { name: /Save reflection/i }).click();
  await page.waitForTimeout(500);
  checks.push(certify(await page.getByText(/TODAY - YOUR WAY/i).count(), 'Saving focus reflection returns to Today.'));

  await page.getByRole('button', { name: /^Open Habits$/i }).click();
  await page.waitForTimeout(350);
  screenshots.push(await capture(page, '05-desktop-habits'));
  const beforeHabits = await page.locator('.gg-today').innerText();
  await page.locator('.gg-action-cards button').first().click();
  await page.waitForTimeout(250);
  const afterHabits = await page.locator('.gg-today').innerText();
  checks.push(certify(beforeHabits !== afterHabits && /1\/3 complete/.test(afterHabits), 'Habit action toggles completion state.', { beforeHabits, afterHabits }));

  await page.getByRole('button', { name: /Open more tools/i }).click();
  await page.waitForTimeout(150);
  screenshots.push(await capture(page, '06-desktop-more-menu'));
  const moreItems = ['If-Then', 'Builder', 'Goals', 'Time', 'Money', 'Health', 'Learning', 'Sports', 'Career', 'Reports', 'Review', 'Settings'];
  const moreChecks = [];
  for (const label of moreItems) {
    if (!(await page.locator('.ux-more').count())) {
      await page.getByRole('button', { name: /Open more tools/i }).click();
      await page.waitForTimeout(100);
    }
    await page.getByRole('menuitem', { name: `Open ${label}`, exact: true }).click();
    await page.waitForTimeout(300);
    moreChecks.push({
      label,
      menuClosed: (await page.locator('.ux-more').count()) === 0,
      hasHero: (await page.locator('.garden-hero').count()) > 0,
      text: (await page.locator('main').first().innerText()).slice(0, 120),
    });
  }
  checks.push(certify(moreChecks.every((check) => check.menuClosed && check.hasHero && check.text.length > 40), 'All More menu items route to real workspaces.', { moreChecks }));

  const settingsHealth = await viewportHealth(page);
  checks.push(certify(!settingsHealth.horizontalOverflow, 'Desktop routed workspace has no horizontal overflow.', settingsHealth));

  checks.push(certify(messages.length === 0, 'No desktop console errors, page errors, or failed responses.', { messages }));
  await browser.close();
  return { checks, screenshots, messages };
}

async function runMobile() {
  const executablePath = await chromeExecutablePath();
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const page = await context.newPage();
  const messages = [];
  const checks = [];
  const screenshots = [];

  page.on('console', (msg) => {
    if (!['debug', 'info'].includes(msg.type())) messages.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', (error) => messages.push({ type: 'pageerror', text: error.message }));
  page.on('response', (response) => {
    if (response.status() >= 400) messages.push({ type: 'response', status: response.status(), url: response.url() });
  });

  await page.goto(`${baseUrl}/app`, { waitUntil: 'networkidle' });
  screenshots.push(await capture(page, '07-mobile-today'));
  const mobileHealth = await viewportHealth(page);
  checks.push(certify(!mobileHealth.horizontalOverflow, 'Mobile home has no horizontal overflow.', mobileHealth));
  const navGeometry = await page.evaluate(() => {
    const nav = document.querySelector('.ux-nav');
    const section = document.querySelector('.ux-nav-section:first-child');
    const main = document.querySelector('.ux-main-home, .ux-main-workspace');
    const navRect = nav?.getBoundingClientRect();
    const tabs = [...(section?.querySelectorAll('button') || [])].map((button) => button.getBoundingClientRect().width);
    const mainPaddingBottom = main ? parseFloat(getComputedStyle(main).paddingBottom) : 0;
    return {
      position: nav ? getComputedStyle(nav).position : null,
      bottomGap: navRect ? Math.abs(window.innerHeight - navRect.bottom) : null,
      tabCount: tabs.length,
      tabWidthDelta: tabs.length ? Math.max(...tabs) - Math.min(...tabs) : null,
      mainPaddingBottom,
      navHeight: navRect?.height || 0,
      moreVisible: Boolean(document.querySelector('.ux-more-wrap')?.offsetParent),
    };
  });
  checks.push(certify(
    navGeometry.position === 'fixed'
      && navGeometry.bottomGap <= 1
      && navGeometry.tabCount === 5
      && navGeometry.tabWidthDelta <= 1
      && navGeometry.mainPaddingBottom >= navGeometry.navHeight + 24
      && navGeometry.moreVisible === false,
    'Mobile bottom navigator is fixed, five-tab, and More is hidden.',
    navGeometry,
  ));

  for (const label of ['Compass', 'Tasks', 'Focus', 'Habits']) {
    await page.getByRole('button', { name: new RegExp(label, 'i') }).first().click();
    await page.waitForTimeout(350);
    const health = await viewportHealth(page);
    checks.push(certify(!health.horizontalOverflow, `Mobile ${label} has no horizontal overflow.`, health));
  }
  screenshots.push(await capture(page, '08-mobile-habits'));

  await page.getByRole('button', { name: /Open .*profile and Your Garden settings/i }).click();
  await page.waitForSelector('.ux-profile-modal');
  screenshots.push(await capture(page, '09-mobile-profile'));
  checks.push(certify(new URL(page.url()).searchParams.get('profile') === '1', 'Mobile profile modal writes URL state.'));
  const modalHealth = await viewportHealth(page);
  checks.push(certify(!modalHealth.horizontalOverflow, 'Mobile profile modal has no horizontal overflow.', modalHealth));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  checks.push(certify(await page.locator('.ux-profile-modal').count() === 0 && new URL(page.url()).searchParams.get('profile') !== '1', 'Mobile profile modal closes with Escape and clears URL state.'));

  checks.push(certify(messages.length === 0, 'No mobile console errors, page errors, or failed responses.', { messages }));
  await browser.close();
  return { checks, screenshots, messages };
}

const startedAt = new Date().toISOString();
const desktop = await runDesktop();
const mobile = await runMobile();
const allChecks = [...desktop.checks, ...mobile.checks];
const failed = allChecks.filter((check) => !check.ok);
const result = {
  startedAt,
  finishedAt: new Date().toISOString(),
  passed: failed.length === 0,
  summary: {
    totalChecks: allChecks.length,
    passedChecks: allChecks.length - failed.length,
    failedChecks: failed.length,
    screenshots: [...desktop.screenshots, ...mobile.screenshots],
  },
  desktop,
  mobile,
  failed,
};

await fs.writeFile(path.join(outDir, 'ux-certification-results.json'), `${JSON.stringify(result, null, 2)}\n`);

const lines = [
  '# UX Certification',
  '',
  `Started: ${result.startedAt}`,
  `Finished: ${result.finishedAt}`,
  `Status: ${result.passed ? 'PASS' : 'FAIL'}`,
  '',
  '## Checks',
  ...allChecks.map((check) => `- ${check.ok ? 'PASS' : 'FAIL'}: ${check.message}`),
  '',
  '## Screenshots',
  ...result.summary.screenshots.map((file) => `- ${path.relative(process.cwd(), file).replaceAll('\\', '/')}`),
  '',
];
await fs.writeFile(path.join(outDir, 'ux-certification-report.md'), `${lines.join('\n')}\n`);

console.log(JSON.stringify(result, null, 2));
if (failed.length) {
  throw new Error(`UX certification failed ${failed.length} check(s). See ${path.join(outDir, 'ux-certification-results.json')}`);
}
