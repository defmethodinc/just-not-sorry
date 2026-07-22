import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { validateSite } from './validate-site.mjs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const workflow = readFileSync(
  '.github/workflows/website-publish.yml',
  'utf8',
);
const phrasesPage = readFileSync('site/phrases.md', 'utf8');
const releasesPage = readFileSync('site/releases.md', 'utf8');
const siteConfig = readFileSync('site/_config.yml', 'utf8');

const expectedVersion = 'abc1234';
const expectedPhrase = 'does that make sense';

test('builds and deploys a verified GitHub Pages artifact', () => {
  assert.equal(
    packageJson.scripts['site:build'],
    'npm run site:phrases && npm run site:version && cd site && bundle exec jekyll build',
  );
  assert.equal(packageJson.scripts.deploy, undefined);
  assert.equal(packageJson.devDependencies['gh-pages'], undefined);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /path: site\/_site/);
  assert.match(workflow, /if: github\.ref == 'refs\/heads\/main'/);
  assert.doesNotMatch(workflow, /github-pages health-check/);
});

test('configures standalone Jekyll to render only deployable site content', () => {
  assert.match(phrasesPage, /^---\ntitle: List of Warning Phrases\n---\n/);
  assert.match(releasesPage, /^---\ntitle: Release Notes\n---\n/);
  assert.match(siteConfig, /^exclude:\n  - test$/m);
  assert.match(
    siteConfig,
    /^defaults:\n  - scope:\n      path: ''\n    values:\n      layout: default$/m,
  );
});

function createValidFixture() {
  const root = mkdtempSync(join(tmpdir(), 'just-not-sorry-site-'));
  mkdirSync(join(root, 'assets/css'), { recursive: true });
  writeFileSync(
    join(root, 'index.html'),
    '<title>Just Not Sorry</title><link href="/assets/css/style.css"><p>Site version abc1234</p>',
  );
  writeFileSync(join(root, 'phrases.html'), expectedPhrase);
  writeFileSync(join(root, 'releases.html'), 'Releases');
  writeFileSync(join(root, 'assets/css/style.css'), 'body { color: black; }');
  writeFileSync(join(root, 'CNAME'), 'justnotsorry.com\n');
  return root;
}

function withFixture(run) {
  const root = createValidFixture();
  try {
    run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('accepts a complete generated site artifact', () => {
  withFixture((root) => {
    assert.doesNotThrow(() =>
      validateSite(root, expectedVersion, expectedPhrase),
    );
  });
});

test('rejects a missing required file', () => {
  withFixture((root) => {
    rmSync(join(root, 'releases.html'));
    assert.throws(
      () => validateSite(root, expectedVersion, expectedPhrase),
      /Missing site artifact: releases\.html/,
    );
  });
});

test('rejects an unexpected CNAME', () => {
  withFixture((root) => {
    writeFileSync(join(root, 'CNAME'), 'example.com');
    assert.throws(
      () => validateSite(root, expectedVersion, expectedPhrase),
      /Unexpected CNAME: example\.com/,
    );
  });
});

test('rejects a missing expected phrase', () => {
  withFixture((root) => {
    writeFileSync(join(root, 'phrases.html'), 'another phrase');
    assert.throws(
      () => validateSite(root, expectedVersion, expectedPhrase),
      /Missing generated warning phrase/,
    );
  });
});

test('rejects a missing site version', () => {
  withFixture((root) => {
    writeFileSync(
      join(root, 'index.html'),
      '<title>Just Not Sorry</title><link href="/assets/css/style.css">',
    );
    assert.throws(
      () => validateSite(root, expectedVersion, expectedPhrase),
      /Missing site version/,
    );
  });
});

test('rejects a missing theme stylesheet reference', () => {
  withFixture((root) => {
    writeFileSync(
      join(root, 'index.html'),
      '<title>Just Not Sorry</title><p>Site version abc1234</p>',
    );
    assert.throws(
      () => validateSite(root, expectedVersion, expectedPhrase),
      /Missing theme stylesheet reference/,
    );
  });
});
