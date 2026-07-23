import { e2eTeardown } from './utility.js';

export default async function globalTeardown() {
  await e2eTeardown();
}
