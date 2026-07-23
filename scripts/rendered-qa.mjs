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
    // Fall through to explicit and bundled-runtime resolution.
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

  throw new Error(
    'Playwright is not available. Install it in the project or set QA_PLAYWRIGHT_MODULE to playwright/index.mjs.',
  );
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

const outDir = path.resolve('qa/rendered-qa');
const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';
const { chromium } = await importPlaywright();
await fs.rm(outDir, { recursive: true, force: true });
await fs.mkdir(outDir, { recursive: true });

async function runViewport(name, viewport) {
  const executablePath = await chromeExecutablePath();
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });
  const page = await browser.newPage({ viewport });
  const messages = [];

  page.on('console', (msg) => messages.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', (error) => messages.push({ type: 'pageerror', text: error.message }));
  page.on('response', (response) => {
    if (response.status() >= 400) messages.push({ type: 'response', status: response.status(), url: response.url() });
  });

  await page.goto(`${baseUrl}/app`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outDir, `${name}-today.png`) });

  const returnHome = async () => {
    try {
      await page.getByRole('button', { name: /Return to Today home/i }).click({ timeout: 1200 });
    } catch {
      const homeButton = page.getByRole('button', { name: /^Open Today$/i }).first();
      if (await homeButton.count()) await homeButton.click({ timeout: 1200 });
    }
    await page.waitForTimeout(250);
  };

  const metrics = await page.evaluate(() => {
    const width = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    return {
      title: document.title,
      bodyTextStart: document.body.innerText.slice(0, 500),
      docWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      winWidth: window.innerWidth,
      horizontalOverflow: width > window.innerWidth + 1,
      overBy: width - window.innerWidth,
      buttonCount: document.querySelectorAll('button').length,
    };
  });

  const mobileNav = viewport.width <= 700 ? await page.evaluate(() => {
    const nav = document.querySelector('.ux-nav');
    const section = document.querySelector('.ux-nav-section:first-child');
    const main = document.querySelector('.ux-main-home, .ux-main-workspace');
    const tabs = [...(section?.querySelectorAll('button') || [])];
    if (!nav || !section || !main) return { ok: false, error: 'Mobile nav, tab section, or main content was not found.' };

    const navRect = nav.getBoundingClientRect();
    const tabRects = tabs.map((tab) => tab.getBoundingClientRect());
    const tabWidths = tabRects.map((rect) => Number(rect.width.toFixed(2)));
    const maxTabWidth = Math.max(...tabWidths);
    const minTabWidth = Math.min(...tabWidths);
    const navStyle = window.getComputedStyle(nav);
    const mainStyle = window.getComputedStyle(main);
    const bottomGap = Math.abs(window.innerHeight - navRect.bottom);
    const leftGap = Math.abs(navRect.left);
    const rightGap = Math.abs(window.innerWidth - navRect.right);
    const mainPaddingBottom = parseFloat(mainStyle.paddingBottom);
    const navHeight = navRect.height;
    const navScrollOverflow = nav.scrollWidth > nav.clientWidth + 1;
    const sectionScrollOverflow = section.scrollWidth > section.clientWidth + 1;
    const tabWidthDelta = Number((maxTabWidth - minTabWidth).toFixed(2));

    return {
      ok: navStyle.position === 'fixed'
        && bottomGap <= 1
        && leftGap <= 1
        && rightGap <= 1
        && tabs.length === 5
        && tabWidthDelta <= 1
        && !navScrollOverflow
        && !sectionScrollOverflow
        && mainPaddingBottom >= navHeight + 24,
      position: navStyle.position,
      bottomGap,
      leftGap,
      rightGap,
      navWidth: Number(navRect.width.toFixed(2)),
      viewportWidth: window.innerWidth,
      tabCount: tabs.length,
      tabWidths,
      tabWidthDelta,
      navScrollOverflow,
      sectionScrollOverflow,
      mainPaddingBottom,
      navHeight: Number(navHeight.toFixed(2)),
    };
  }) : null;

  const mobileTabScrollReset = viewport.width <= 700 ? await (async () => {
    await page.evaluate(() => window.scrollTo(0, Math.min(900, document.documentElement.scrollHeight)));
    await page.waitForTimeout(100);
    const before = await page.evaluate(() => window.scrollY);
    await page.getByRole('button', { name: /Focus/i }).first().click({ timeout: 2000 });
    await page.waitForTimeout(350);
    const after = await page.evaluate(() => window.scrollY);
    return {
      ok: before > 100 && after <= 4,
      before,
      after,
    };
  })() : null;

  const moreMenu = viewport.width > 700 ? await (async () => {
    await page.getByRole('button', { name: /open more tools/i }).click({ timeout: 2000 });
    await page.waitForTimeout(150);
    const openState = await page.evaluate(() => {
      const menu = document.querySelector('.ux-more');
      const trigger = document.querySelector('.ux-more-wrap > button');
      const groups = [...document.querySelectorAll('.ux-more-label')].map((item) => item.textContent.trim());
      const items = [...document.querySelectorAll('.ux-more [role="menuitem"]')].map((item) => item.getAttribute('aria-label')?.replace(/^Open\s+/i, '') || item.textContent.trim());
      const duplicateItems = items.filter((item, index) => items.indexOf(item) !== index);
      return {
        menuOpen: Boolean(menu),
        expanded: trigger?.getAttribute('aria-expanded'),
        groups,
        items,
        duplicateItems,
      };
    });
    const routeChecks = [];
    for (const item of openState.items) {
      const menuOpen = await page.locator('.ux-more').count();
      if (!menuOpen) {
        await page.getByRole('button', { name: /open more tools/i }).click({ timeout: 2000 });
        await page.waitForTimeout(100);
      }
      await page.getByRole('menuitem', { name: `Open ${item}`, exact: true }).click({ timeout: 2000 });
      await page.waitForTimeout(250);
      routeChecks.push(await page.evaluate((label) => {
        const trigger = document.querySelector('.ux-more-wrap > button');
        const mainText = document.querySelector('main')?.innerText.slice(0, 180) || '';
        return {
          label,
          menuClosed: !document.querySelector('.ux-more'),
          triggerActive: trigger?.className.includes('active'),
          current: trigger?.getAttribute('aria-current'),
          hasWorkspaceContent: mainText.length > 40,
          mainText,
        };
      }, item));
    }
    const expectedGroups = ['Plan', 'Track', 'Life Areas', 'Review & System'];
    const result = {
      ok: openState.menuOpen
        && openState.expanded === 'true'
        && expectedGroups.every((group) => openState.groups.includes(group))
        && openState.items.length === 12
        && openState.duplicateItems.length === 0
        && routeChecks.every((check) => check.menuClosed && check.triggerActive && check.current === 'page' && check.hasWorkspaceContent),
      openState,
      routeChecks,
    };
    await returnHome();
    return result;
  })() : null;

  await page.keyboard.press('Tab');
  const firstFocus = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    text: document.activeElement?.innerText?.slice(0, 80),
    className: String(document.activeElement?.className || ''),
  }));

  const modal = { opened: false };
  try {
    await page.getByRole('button', { name: /Your Garden|Demo User|You/i }).first().click({ timeout: 3000 });
    await page.waitForSelector('.ux-modal-backdrop', { timeout: 3000 });
    modal.opened = true;
    modal.dialogRoles = await page.locator('[role="dialog"]').count();
    modal.backdropCount = await page.locator('.ux-modal-backdrop').count();
    modal.focusInside = await page.evaluate(() => !!document.activeElement?.closest?.('.ux-profile-modal'));
    await page.screenshot({ path: path.join(outDir, `${name}-profile-modal.png`) });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    modal.closedOnEscape = await page.locator('.ux-modal-backdrop').count() === 0;
    if (!modal.closedOnEscape) {
      await page.locator('.ux-profile-modal header button').click();
      await page.waitForTimeout(300);
    }
  } catch (error) {
    modal.error = error.message;
  }

  const navResults = [];
  for (const label of ['Compass', 'Tasks', 'Focus', 'Habits']) {
    try {
      await page.getByRole('button', { name: new RegExp(label, 'i') }).first().click({ timeout: 2000 });
      await page.waitForTimeout(250);
      if (['Focus', 'Habits'].includes(label)) {
        await page.screenshot({ path: path.join(outDir, `${name}-${label.toLowerCase()}.png`) });
      }
      navResults.push({
        label,
        ok: true,
        text: (await page.locator('main').first().innerText()).slice(0, 140),
      });
    } catch (error) {
      navResults.push({ label, ok: false, error: error.message });
    }
  }

  const legacyShell = await page.evaluate(() => {
    const counts = {
      gardenNav: document.querySelectorAll('.ux-main-workspace .garden-nav').length,
      gardenTopbar: document.querySelectorAll('.ux-main-workspace .garden-topbar').length,
      habitsSidebar: document.querySelectorAll('.ux-main-workspace .gg-sidebar').length,
      habitsTopbar: document.querySelectorAll('.ux-main-workspace .gg-top').length,
      embeddedWorkspace: document.querySelectorAll('.ux-main-workspace > .garden-workspace.embedded').length,
      embeddedHabits: document.querySelectorAll('.ux-main-workspace .garden-content > .goal-garden-shell.embedded').length,
    };
    return {
      ...counts,
      ok: counts.gardenNav === 0
        && counts.gardenTopbar === 0
        && counts.habitsSidebar === 0
        && counts.habitsTopbar === 0
        && counts.embeddedWorkspace === 1
        && counts.embeddedHabits === 1,
    };
  });

  const homeReturn = { checked: false, ok: false };
  try {
    await page.getByRole('button', { name: /Return to Today home/i }).click({ timeout: 2000 });
    await page.waitForTimeout(250);
    homeReturn.checked = true;
    homeReturn.ok = await page.locator('main').first().getByText(/TODAY - YOUR WAY/i).count() > 0;
    homeReturn.text = (await page.locator('main').first().innerText()).slice(0, 120);
  } catch (error) {
    homeReturn.checked = true;
    homeReturn.error = error.message;
  }

  await browser.close();
  return { metrics, mobileNav, mobileTabScrollReset, moreMenu, firstFocus, modal, navResults, legacyShell, homeReturn, messages };
}

const results = {
  desktop: await runViewport('desktop-1440x1024', { width: 1440, height: 1024 }),
  mobile: await runViewport('mobile-390x844', { width: 390, height: 844, isMobile: true }),
};

await fs.writeFile(path.join(outDir, 'qa-results.json'), `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));

if (results.mobile.mobileNav && !results.mobile.mobileNav.ok) {
  throw new Error(`Mobile bottom nav failed geometry check: ${JSON.stringify(results.mobile.mobileNav)}`);
}
if (results.mobile.mobileTabScrollReset && !results.mobile.mobileTabScrollReset.ok) {
  throw new Error(`Mobile tab scroll reset failed: ${JSON.stringify(results.mobile.mobileTabScrollReset)}`);
}
if (results.desktop.moreMenu && !results.desktop.moreMenu.ok) {
  throw new Error(`More menu UX check failed: ${JSON.stringify(results.desktop.moreMenu)}`);
}
for (const [viewportName, result] of Object.entries(results)) {
  if (result.legacyShell && !result.legacyShell.ok) {
    throw new Error(`Embedded legacy shell cleanup failed for ${viewportName}: ${JSON.stringify(result.legacyShell)}`);
  }
}
