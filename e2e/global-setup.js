import { e2eSetup } from './utility.js';
import setupPuppeteer from 'jest-environment-puppeteer/setup';

export default async function globalSetup(globalConfig) {
  await e2eSetup();
  await setupPuppeteer(globalConfig);
}
