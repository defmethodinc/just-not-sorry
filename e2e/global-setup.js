import { e2eSetup } from './utility.js';
import { setup } from 'jest-environment-puppeteer';

export default async function globalSetup(globalConfig) {
  e2eSetup();
  await setup(globalConfig);
}
