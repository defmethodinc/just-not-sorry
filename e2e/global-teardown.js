import { e2eTeardown } from './utility.js';
import teardownPuppeteer from 'jest-environment-puppeteer/teardown';

export default async function globalTeardown(globalConfig) {
  await teardownPuppeteer(globalConfig);
  e2eTeardown();
}
