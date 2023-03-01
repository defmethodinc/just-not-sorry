module.exports = {
  preset: 'jest-puppeteer',
  globalSetup: './e2e/global-setup.js',
  globalTeardown: './e2e/global-teardown.js',
};
