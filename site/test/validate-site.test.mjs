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
const layout = readFileSync('site/_layouts/default.html', 'utf8');

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

test('builds pull requests for the same paths without deploying them', () => {
  const pushPaths = workflow.match(/push:\n    paths:\n((?:      - .+\n)+)/)?.[1];
  const pullRequestPaths = workflow.match(
    /pull_request:\n    paths:\n((?:      - .+\n)+)/,
  )?.[1];
  assert.ok(pushPaths, 'push path filters are configured');
  assert.equal(pullRequestPaths, pushPaths);
  assert.match(
    workflow,
    /publish-website:\n    if: github\.ref == 'refs\/heads\/main'/,
  );
});

test('configures standalone Jekyll to render only deployable site content', () => {
  assert.match(phrasesPage, /^---\ntitle: List of Warning Phrases\n---\n/);
  assert.match(releasesPage, /^---\ntitle: Release Notes\n---\n/);
  assert.match(siteConfig, /^exclude:\n  - test$/m);
  assert.match(
    siteConfig,
    /^defaults:\n  - scope:\n      path: ''\n    values:\n      layout: default$/m,
  );
  assert.match(
    siteConfig,
    /^repository_url: https:\/\/github\.com\/defmethodinc\/just-not-sorry$/m,
  );
  assert.match(layout, /href="{{ site\.repository_url }}"/);
  assert.match(
    layout,
    /style\.css\?v=" \| append: site\.data\.version\.commit/,
  );
});

function createValidFixture() {
  const root = mkdtempSync(join(tmpdir(), 'just-not-sorry-site-'));
  mkdirSync(join(root, 'assets/css'), { recursive: true });
  writeFileSync(
    join(root, 'index.html'),
    `<!doctype html><title>Just Not Sorry</title>
<link rel="stylesheet" href="/assets/css/style.css?v=abc1234">
<div class="wrapper"><header><img class="logo" src="/img/logo.png"><nav><a href="/phrases.html">Phrases</a></nav></header>
<main><a href="releases.html#latest">Releases</a><p>Site version abc1234</p></main>
<footer><a href="https://github.com/defmethodinc/just-not-sorry">View the Source Code on GitHub</a></footer></div>`,
  );
  writeFileSync(
    join(root, 'phrases.html'),
    `<div class="wrapper"><header><img class="logo" src="/img/logo.png"><nav><a href="/">Home</a></nav></header><main>${expectedPhrase}</main><footer>Footer</footer></div>`,
  );
  writeFileSync(join(root, 'releases.html'), 'Releases');
  writeFileSync(join(root, 'assets/css/style.css'), 'body { color: black; }');
  mkdirSync(join(root, 'img'));
  writeFileSync(join(root, 'img/logo.png'), 'image');
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
    const indexPath = join(root, 'index.html');
    writeFileSync(
      indexPath,
      readFileSync(indexPath, 'utf8').replace(
        '<p>Site version abc1234</p>',
        '',
      ),
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

test('rejects an empty href or src target', () => {
  withFixture((root) => {
    writeFileSync(
      join(root, 'releases.html'),
      '<a href="">Empty link</a><img src="   ">',
    );
    assert.throws(
      () => validateSite(root, expectedVersion, expectedPhrase),
      /Empty (?:href|src) target in releases\.html/,
    );
  });
});

test('rejects a missing internal href or src target', () => {
  withFixture((root) => {
    writeFileSync(
      join(root, 'releases.html'),
      '<a href="missing/page?from=releases#details">Missing</a>',
    );
    assert.throws(
      () => validateSite(root, expectedVersion, expectedPhrase),
      /Missing internal target .*missing\/page.* in releases\.html/,
    );
  });
});

test('accepts directory URLs and ignored URL schemes', () => {
  withFixture((root) => {
    mkdirSync(join(root, 'guide'));
    writeFileSync(join(root, 'guide/index.html'), '<a href="../">Home</a>');
    writeFileSync(
      join(root, 'releases.html'),
      '<a href="/guide/?x=1#top">Guide</a><a href="#top">Anchor</a><a href="https://example.com">Web</a><a href="//example.com">Protocol relative</a><a href="mailto:test@example.com">Email</a><a href="tel:+1">Phone</a><img src="data:image/png;base64,AA">',
    );
    assert.doesNotThrow(() =>
      validateSite(root, expectedVersion, expectedPhrase),
    );
  });
});

test('requires representative generated layout markers', () => {
  withFixture((root) => {
    const indexPath = join(root, 'index.html');
    writeFileSync(
      indexPath,
      readFileSync(indexPath, 'utf8').replace('class="wrapper"', ''),
    );
    assert.throws(
      () => validateSite(root, expectedVersion, expectedPhrase),
      /Missing generated layout marker/,
    );
  });
});
