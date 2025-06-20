import { e2eSetup } from './utility.js';
import setupPuppeteer from 'jest-environment-puppeteer/setup';

export default async function globalSetup(globalConfig) {
  e2eSetup();
  await setupPuppeteer(globalConfig);
}
