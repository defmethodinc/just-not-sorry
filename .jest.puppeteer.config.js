module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./e2e/setup-puppeteer.js'],
  globalSetup: './e2e/global-setup.js',
  globalTeardown: './e2e/global-teardown.js',
};
