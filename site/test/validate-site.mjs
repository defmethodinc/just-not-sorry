import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
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
  if (!index.includes(`/assets/css/style.css?v=${expectedVersion}`)) {
    throw new Error('Missing versioned theme stylesheet reference');
  }
  if (
    !index.includes(
      'href="https://github.com/defmethodinc/just-not-sorry"',
    )
  ) {
    throw new Error('Missing repository link');
  }
  if (!index.includes(`Site version ${expectedVersion}`)) {
    throw new Error('Missing site version');
  }
  if (!phrases.includes(expectedPhrase))
    throw new Error('Missing generated warning phrase');
  if (css.trim() === '') throw new Error('Theme stylesheet is empty');

  for (const marker of [
    'class="wrapper"',
    '<header',
    '<footer',
    'class="logo"',
    'href="/phrases.html"',
  ]) {
    if (!index.includes(marker)) {
      throw new Error(`Missing generated layout marker: ${marker}`);
    }
  }

  validateHtmlTargets(root);
}

function validateHtmlTargets(root) {
  const artifactRoot = resolve(root);
  const htmlFiles = findHtmlFiles(root);
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8');
    const relativeFile = relative(root, file);
    for (const match of html.matchAll(/\b(href|src)\s*=\s*(["'])(.*?)\2/giu)) {
      const [, attribute, , rawTarget] = match;
      const target = rawTarget.trim();
      if (target === '') {
        throw new Error(`Empty ${attribute} target in ${relativeFile}`);
      }
      if (isIgnoredTarget(target)) continue;

      const path = target.split(/[?#]/u, 1)[0];
      const resolved = path.startsWith('/')
        ? resolve(artifactRoot, `.${path}`)
        : resolve(dirname(file), path);
      if (!isInsideRoot(artifactRoot, resolved)) {
        throw new Error(
          `Internal target escapes artifact root ${target} in ${relativeFile}`,
        );
      }
      const candidates = path.endsWith('/')
        ? [resolve(resolved, 'index.html')]
        : [resolved];
      if (
        !candidates.some(
          (candidate) =>
            isInsideRoot(artifactRoot, candidate) &&
            existsSync(candidate) &&
            statSync(candidate).isFile(),
        )
      ) {
        throw new Error(
          `Missing internal target ${target} in ${relativeFile}`,
        );
      }
    }
  }
}

function isInsideRoot(root, candidate) {
  const pathFromRoot = relative(root, candidate);
  return (
    pathFromRoot !== '..' &&
    !pathFromRoot.startsWith(`..${sep}`) &&
    !isAbsolute(pathFromRoot)
  );
}

function findHtmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return findHtmlFiles(path);
    return entry.isFile() && entry.name.endsWith('.html') ? [path] : [];
  });
}

function isIgnoredTarget(target) {
  return (
    target.startsWith('#') ||
    target.startsWith('//') ||
    /^(?:https?:|mailto:|tel:|data:)/iu.test(target)
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [, , root, expectedVersion, expectedPhrase] = process.argv;
  validateSite(root, expectedVersion, expectedPhrase);
}
