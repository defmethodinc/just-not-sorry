import { promises as fs } from 'fs';
import * as path from 'path';

// eslint-disable-next-line no-undef
const manifestPath = path.join(__dirname, '..', 'build', 'manifest.json');
const testPageMatch = 'file:///*/public/jns-test.html';
export async function e2eSetup() {
  const data = await fs.readFile(manifestPath, 'utf-8');
  const newValue = data.replace('https://mail.google.com/*', testPageMatch);
  await fs.writeFile(manifestPath, newValue, 'utf-8');
}
export async function e2eTeardown() {
  const data = await fs.readFile(manifestPath, 'utf-8');
  const newValue = data.replace(testPageMatch, 'https://mail.google.com/*');
  await fs.writeFile(manifestPath, newValue, 'utf-8');
}
