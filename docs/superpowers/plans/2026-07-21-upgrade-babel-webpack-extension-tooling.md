# Upgrade Babel, Webpack, and Extension Tooling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the build and extension toolchain named in issue #192 without changing extension behavior, build outputs, or introducing new audit or web-extension lint findings.

**Architecture:** Keep Webpack's three-entry production build and copied assets intact, but move Babel to one Babel 8-compatible root configuration consumed by `babel-loader`. Add a small build-contract verifier so generated bundles and required extension assets are checked explicitly after every production build.

**Tech Stack:** Node.js 24.15.0, npm, Babel 8, Webpack 5, Jest 29, web-ext 10

## Global Constraints

- Use the exact release versions named in issue #192 as the minimum direct dependency versions.
- Retain Webpack 5.108.4 and compatible loader/plugin versions.
- Preserve the `bundle`, `options`, and `background` entry points and filenames.
- Preserve `options.html`, `manifest.json`, `just-not-sorry.css`, and the copied `img/` assets.
- Do not commit audit snapshots, web-ext lint reports, or generated `build/` artifacts.
- Do not introduce audit or web-ext lint findings.
- Do not change extension functionality, permissions, or user-visible behavior.

---

### Task 1: Add an executable build-output contract

**Files:**

- Create: `scripts/verify-build-output.js`
- Create: `spec/VerifyBuildOutputSpec.test.js`
- Modify: `package.json`

**Interfaces:**

- Produces: `verifyBuildOutput(buildDirectory: string): string[]`, returning missing paths relative to the supplied build directory.
- Produces: `npm run verify:build`, which exits nonzero and lists missing outputs or prints a success message.
- Consumes: the existing `build/` output directory produced by Webpack.

- [ ] **Step 1: Write the failing unit test**

```js
const fs = require('fs');
const os = require('os');
const path = require('path');
const { verifyBuildOutput } = require('../scripts/verify-build-output');

describe('verifyBuildOutput', () => {
  let buildDirectory;

  beforeEach(() => {
    buildDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'jns-build-'));
  });

  afterEach(() => {
    fs.rmSync(buildDirectory, { recursive: true, force: true });
  });

  it('reports every missing required bundle and asset', () => {
    expect(verifyBuildOutput(buildDirectory)).toEqual([
      'bundle.js',
      'options.js',
      'background.js',
      'options.html',
      'manifest.json',
      'just-not-sorry.css',
      'img/JustNotSorry-16.png',
      'img/JustNotSorry-48.png',
      'img/JustNotSorry-128.png',
    ]);
  });

  it('returns no missing paths when the complete contract is present', () => {
    [
      'bundle.js',
      'options.js',
      'background.js',
      'options.html',
      'manifest.json',
      'just-not-sorry.css',
      'img/JustNotSorry-16.png',
      'img/JustNotSorry-48.png',
      'img/JustNotSorry-128.png',
    ].forEach((relativePath) => {
      const outputPath = path.join(buildDirectory, relativePath);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, 'fixture');
    });

    expect(verifyBuildOutput(buildDirectory)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- --runTestsByPath spec/VerifyBuildOutputSpec.test.js`

Expected: FAIL because `../scripts/verify-build-output` does not exist.

- [ ] **Step 3: Implement the verifier**

```js
const fs = require('fs');
const path = require('path');

const REQUIRED_OUTPUTS = [
  'bundle.js',
  'options.js',
  'background.js',
  'options.html',
  'manifest.json',
  'just-not-sorry.css',
  'img/JustNotSorry-16.png',
  'img/JustNotSorry-48.png',
  'img/JustNotSorry-128.png',
];

function verifyBuildOutput(buildDirectory) {
  return REQUIRED_OUTPUTS.filter(
    (relativePath) => !fs.existsSync(path.join(buildDirectory, relativePath))
  );
}

if (require.main === module) {
  const missingOutputs = verifyBuildOutput(path.resolve('build'));

  if (missingOutputs.length > 0) {
    console.error(`Missing build outputs:\n${missingOutputs.join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log('All required build outputs are present.');
  }
}

module.exports = { REQUIRED_OUTPUTS, verifyBuildOutput };
```

Add this script to `package.json`:

```json
"verify:build": "node scripts/verify-build-output.js"
```

- [ ] **Step 4: Run the focused test and existing production build contract**

Run: `npm test -- --runTestsByPath spec/VerifyBuildOutputSpec.test.js && npm run build && npm run verify:build`

Expected: two Jest tests PASS, Webpack exits 0, and the verifier prints `All required build outputs are present.`

- [ ] **Step 5: Commit the build contract**

```bash
git add package.json scripts/verify-build-output.js spec/VerifyBuildOutputSpec.test.js
git commit -m "test(build): verify extension artifacts"
```

### Task 2: Upgrade the named dependencies and migrate Babel configuration

**Files:**

- Delete: `.babelrc`
- Create: `babel.config.json`
- Modify: `webpack.config.js`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**

- Consumes: Babel 8 root configuration discovery through `babel-loader` 10.1.1.
- Produces: browser-targeted ES compilation with explicit classic React JSX behavior.
- Produces: the same Webpack entries and copied output paths as Task 1 verifies.

- [ ] **Step 1: Upgrade only the issue-scoped direct dependencies**

Run:

```bash
npm install --save-dev @babel/cli@8.0.4 @babel/core@8.0.1 @babel/preset-env@8.0.2 @babel/preset-react@8.0.1 concurrently@10.0.3 copy-webpack-plugin@14.0.0 webpack-cli@7.2.1 webpack-dev-server@6.0.0 web-ext@10.5.0
```

Expected: `package.json` and `package-lock.json` update, with no peer dependency conflict against Webpack 5.108.4 or `babel-loader` 10.1.1.

- [ ] **Step 2: Run the production build to expose Babel 8 incompatibilities**

Run: `npm run build`

Expected: FAIL or warn because the Babel 7 configuration uses a preset-local target and leaves the React runtime change implicit; record the exact output before changing configuration.

- [ ] **Step 3: Replace `.babelrc` with a Babel 8-compatible root configuration**

Create `babel.config.json`:

```json
{
  "targets": "defaults",
  "presets": [
    "@babel/preset-env",
    [
      "@babel/preset-react",
      {
        "runtime": "classic",
        "useSpread": true
      }
    ]
  ]
}
```

Delete `.babelrc`. In `webpack.config.js`, replace the Babel rule's divergent inline options:

```js
{
  test: /\.jsx?$/,
  exclude: /node_modules/,
  use: 'babel-loader',
},
```

Also add `clean: true` to `output` so stale files cannot satisfy the build-output contract:

```js
output: {
  clean: true,
  path: path.join(__dirname, 'build'),
  filename: '[name].js',
},
```

- [ ] **Step 4: Verify configuration and exact direct versions**

Run:

```bash
npm run build && npm run verify:build
npm ls @babel/cli @babel/core @babel/preset-env @babel/preset-react concurrently copy-webpack-plugin webpack webpack-cli webpack-dev-server web-ext
```

Expected: build and output verification PASS; the named packages resolve to the issue versions and Webpack resolves to 5.108.4.

- [ ] **Step 5: Commit the toolchain migration**

```bash
git add .babelrc babel.config.json webpack.config.js package.json package-lock.json
git commit -m "build(tooling): upgrade Babel and Webpack tooling"
```

### Task 3: Resolve and document validation behavior in the handoff

**Files:**

- Modify only if a narrowly scoped compatibility correction is required: `manifest.json`, `webpack.config.js`, or `package.json`
- Do not create an audit or lint report file.

**Interfaces:**

- Consumes: the fresh build created in Task 2.
- Produces: terminal evidence for clean install, tests, builds, audit non-regression, and extension lint non-regression.

- [ ] **Step 1: Verify a clean dependency installation**

Run: `npm ci`

Expected: PASS under Node 24.15.0 without peer dependency or engine errors.

- [ ] **Step 2: Run unit, build, and artifact checks**

Run: `npm test && npm run build && npm run verify:build`

Expected: all unit tests PASS; Webpack exits 0; every required bundle and copied asset is present.

- [ ] **Step 3: Run extension lint against the fresh production build**

Run: `npm run webext:lint`

Expected: no new findings compared with the baseline. Capture each remaining finding code and rationale for the final handoff. If an issue-scoped configuration correction can eliminate a finding without changing behavior, first add a focused regression assertion, then make that correction and rerun this command.

- [ ] **Step 4: Compare the final audit to the baseline**

Run: `npm audit --json`

Expected: no new vulnerabilities introduced by the migration, and build-tool findings addressed by `copy-webpack-plugin`, `webpack-dev-server`, or `web-ext` are removed where their upgraded dependency trees permit it. Report only the before/after totals and relevant remaining build-tool findings in the final handoff.

- [ ] **Step 5: Run the end-to-end suite**

Run: `npm run e2e`

Expected: PASS when a compatible local Chromium environment is available. If the environment cannot launch Chromium, retain the exact launcher error and rely on CI for the authoritative browser run; do not weaken or skip the CI job.

- [ ] **Step 6: Review the final diff and repository state**

Run:

```bash
git diff --check
git status -sb
git log --oneline -4
```

Expected: no whitespace errors, no generated `build/` files staged, and only intentional issue #192 changes remain.

- [ ] **Step 7: Commit any narrowly scoped validation correction**

If Step 3 required an issue-scoped correction:

```bash
git add manifest.json webpack.config.js package.json package-lock.json spec scripts
git commit -m "fix(tooling): satisfy extension validation"
```

If no correction was required, do not create an empty commit.
