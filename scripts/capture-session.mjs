#!/usr/bin/env node
/**
 * Logged-in capture support.
 *
 * Signing in must happen in a browser that is NOT under automation control: a
 * puppeteer-launched Chrome sets navigator.webdriver, and dubizzle's reCAPTCHA-protected
 * login rejects it with a misleading "invalid credentials" error. So the login window is
 * a plain Chrome process. It is started with a local debugging port, which does not set
 * the webdriver flag, so captures can attach to the already-signed-in browser afterwards
 * — keeping even session-only cookies alive, which a restart would lose.
 *
 * The profile lives OUTSIDE the repo (~/.dubizzle-capture/chrome-profile) because it holds
 * live session cookies and must never be committed or shipped with a copy of the project.
 * Delete that folder to sign the capture browser out.
 *
 *   npm run capture:login               # open the plain Chrome window; sign in there
 *   npm run capture:login -- --check    # confirm the window is signed in
 */
import { mkdirSync } from 'node:fs';
import { spawn, execSync } from 'node:child_process';
import { join } from 'node:path';
import { homedir } from 'node:os';
import puppeteer from 'puppeteer-core';

export const PROFILE_DIR = join(homedir(), '.dubizzle-capture', 'chrome-profile');
export const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export const DEBUG_PORT = 9333;
export const ORIGIN = 'https://www.dubizzle.com.eg';

/** Signed-out pages show "Login or Signup"; signed-in pages show the account menu instead. */
export async function isSignedIn(page) {
  return page.evaluate(() => {
    const text = document.body?.innerText ?? '';
    return !/Login or Signup|Log in or sign up/i.test(text) && /My Ads|Favourites|Chats/i.test(text);
  });
}

/** Attach to the running login window. Throws with a usable message if it isn't open. */
export async function connectToSession() {
  try {
    return await puppeteer.connect({ browserURL: `http://127.0.0.1:${DEBUG_PORT}`, defaultViewport: null, protocolTimeout: 120_000 });
  } catch {
    throw new Error('The capture Chrome window is not running. Start it with: npm run capture:login');
  }
}

function sessionRunning() {
  try {
    execSync(`pgrep -f "user-data-dir=${PROFILE_DIR}"`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const invokedDirectly = process.argv[1]?.endsWith('capture-session.mjs');

if (invokedDirectly && process.argv.includes('--check')) {
  const browser = await connectToSession().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
  const page = await browser.newPage();
  await page.goto(`${ORIGIN}/en/`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await new Promise((r) => setTimeout(r, 2500));
  const signedIn = await isSignedIn(page);
  await page.close();
  await browser.disconnect();
  console.log(signedIn ? 'Signed in ✓' : 'Not signed in yet — finish logging in in the capture window.');
  process.exit(signedIn ? 0 : 1);
} else if (invokedDirectly) {
  if (sessionRunning()) {
    console.log('The capture Chrome window is already open — sign in there, then run: npm run capture:login -- --check');
    process.exit(0);
  }
  mkdirSync(PROFILE_DIR, { recursive: true });
  const chrome = spawn(
    CHROME,
    [
      `--user-data-dir=${PROFILE_DIR}`,
      `--remote-debugging-port=${DEBUG_PORT}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--window-size=1280,900',
      `${ORIGIN}/en/`,
    ],
    { detached: true, stdio: 'ignore' },
  );
  chrome.unref();
  console.log('Opened a plain Chrome window (no automation) on dubizzle.com.eg. Sign in there.');
  console.log('Then confirm with: npm run capture:login -- --check');
}
