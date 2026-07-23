const fs = require('fs');
const os = require('os');
const path = require('path');
const puppeteer = require('puppeteer-core');
const puppeteerConfig = require('../jest-puppeteer.config.js');

const ONE_MINUTE = 5000 * 12;

let browser;

function findCachedChromeExecutable(cacheDir) {
  const chromeCacheDir = path.join(cacheDir, 'chrome');

  if (!fs.existsSync(chromeCacheDir)) {
    return undefined;
  }

  const executableCandidates = fs
    .readdirSync(chromeCacheDir)
    .filter((entry) => entry.includes('-'))
    .sort((left, right) =>
      right.localeCompare(left, undefined, { numeric: true }),
    )
    .flatMap((entry) => {
      const installDir = path.join(chromeCacheDir, entry);

      return [
        path.join(
          installDir,
          'chrome-mac-arm64',
          'Google Chrome for Testing.app',
          'Contents',
          'MacOS',
          'Google Chrome for Testing',
        ),
        path.join(
          installDir,
          'chrome-mac-x64',
          'Google Chrome for Testing.app',
          'Contents',
          'MacOS',
          'Google Chrome for Testing',
        ),
        path.join(installDir, 'chrome-linux64', 'chrome'),
        path.join(installDir, 'chrome-win64', 'chrome.exe'),
      ];
    });

  return executableCandidates.find((executablePath) =>
    fs.existsSync(executablePath),
  );
}

async function resolveExecutablePath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const cacheDir =
    process.env.PUPPETEER_CACHE_DIR ||
    path.join(os.homedir(), '.cache', 'puppeteer');
  const cachedChromeExecutable = findCachedChromeExecutable(cacheDir);

  if (cachedChromeExecutable) {
    return cachedChromeExecutable;
  }

  return puppeteer.executablePath('chrome');
}

beforeAll(async () => {
  browser = await puppeteer.launch({
    ...puppeteerConfig.launch,
    executablePath: await resolveExecutablePath(),
  });
  global.browser = browser;
  global.page = await browser.newPage();
}, ONE_MINUTE);

afterAll(async () => {
  if (global.page) {
    await global.page.close();
    delete global.page;
  }

  if (browser) {
    await browser.close();
    delete global.browser;
  }
});
