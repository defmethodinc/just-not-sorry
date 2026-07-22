import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const REQUIRED_FILES = [
  'index.html',
  'phrases.html',
  'releases.html',
  'assets/css/style.css',
  'CNAME',
];

export function validateSite(root, expectedVersion, expectedPhrase) {
  for (const relativePath of REQUIRED_FILES) {
    if (!existsSync(resolve(root, relativePath))) {
      throw new Error(`Missing site artifact: ${relativePath}`);
    }
  }

  const index = readFileSync(resolve(root, 'index.html'), 'utf8');
  const phrases = readFileSync(resolve(root, 'phrases.html'), 'utf8');
  const css = readFileSync(resolve(root, 'assets/css/style.css'), 'utf8');
  const cname = readFileSync(resolve(root, 'CNAME'), 'utf8').trim();

  if (cname !== 'justnotsorry.com')
    throw new Error(`Unexpected CNAME: ${cname}`);
  if (!index.includes('Just Not Sorry')) throw new Error('Missing site title');
  if (!index.includes('/assets/css/style.css')) {
    throw new Error('Missing theme stylesheet reference');
  }
  if (!index.includes(`Site version ${expectedVersion}`)) {
    throw new Error('Missing site version');
  }
  if (!phrases.includes(expectedPhrase))
    throw new Error('Missing generated warning phrase');
  if (css.trim() === '') throw new Error('Theme stylesheet is empty');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [, , root, expectedVersion, expectedPhrase] = process.argv;
  validateSite(root, expectedVersion, expectedPhrase);
}
