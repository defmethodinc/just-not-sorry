import { e2eTeardown } from './utility.js';
import { teardown } from 'jest-environment-puppeteer';

export default async function globalTeardown(globalConfig) {
  await teardown(globalConfig);
  e2eTeardown();
}
