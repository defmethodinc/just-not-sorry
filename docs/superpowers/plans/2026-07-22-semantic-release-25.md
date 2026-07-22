# Semantic Release 25 Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade semantic-release and its exec plugin while proving stable and
beta packaging and non-publishing release analysis remain correct.

**Architecture:** Preserve the existing semantic-release configuration and
shell packaging entry point. Add an opt-out only for the expensive Webpack step
so Jest can exercise version mutation and ZIP generation in temporary isolated
directories, then validate the upgraded plugin graph and real dry-run behavior.

**Tech Stack:** semantic-release 25, `@semantic-release/exec` 7, POSIX shell,
Jest, Node.js, Webpack, GitHub CLI

## Global Constraints

- Use exactly semantic-release 25.0.8 and `@semantic-release/exec` 7.1.0.
- Preserve the `main` stable channel and `beta` prerelease channel.
- Preserve `dist/just-not-sorry-chrome.zip`, its tag-derived release asset
  name, label, and package contents.
- Do not publish a release, push a release commit or tag, upload a GitHub asset,
  or submit a Chrome Web Store artifact.
- Avoid unrelated release, workflow, dependency, or application changes.

---

### Task 1: Lock Down the Release Packaging Contract

**Files:**

- Create: `spec/ReleasePackagingSpec.test.js`
- Modify: `package.sh`
- Test: `spec/ReleasePackagingSpec.test.js`

**Interfaces:**

- Consumes: `./package.sh <next-release-version>` and optional
  `SKIP_BUILD=true`
- Produces: stable/beta metadata plus
  `dist/just-not-sorry-chrome.zip` containing the supplied `build/` tree

- [ ] **Step 1: Write the failing stable and beta packaging tests**

Create `spec/ReleasePackagingSpec.test.js` with temporary-workspace helpers and
the complete release contract:

```js
/** @jest-environment node */

import { execFileSync } from 'child_process';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import path from 'path';

const PACKAGE_SCRIPT = path.resolve(__dirname, '..', 'package.sh');
const workspaces = [];

function packageVersion(version) {
  const workspace = mkdtempSync(path.join(tmpdir(), 'jns-release-'));
  workspaces.push(workspace);
  writeFileSync(
    path.join(workspace, 'package.json'),
    JSON.stringify({ version: '0.0.0' }),
  );
  writeFileSync(
    path.join(workspace, 'manifest.json'),
    JSON.stringify({ version: '0.0.0', version_name: '0.0.0' }),
  );
  mkdirSync(path.join(workspace, 'build', 'img'), { recursive: true });
  writeFileSync(path.join(workspace, 'build', 'bundle.js'), 'bundle');
  writeFileSync(path.join(workspace, 'build', 'manifest.json'), 'manifest');
  writeFileSync(path.join(workspace, 'build', 'img', 'icon.png'), 'icon');

  execFileSync(PACKAGE_SCRIPT, [version], {
    cwd: workspace,
    env: { ...process.env, SKIP_BUILD: 'true' },
    stdio: 'pipe',
  });

  return {
    packageJson: JSON.parse(
      readFileSync(path.join(workspace, 'package.json'), 'utf8'),
    ),
    manifest: JSON.parse(
      readFileSync(path.join(workspace, 'manifest.json'), 'utf8'),
    ),
    archivePath: path.join(workspace, 'dist', 'just-not-sorry-chrome.zip'),
  };
}

afterEach(() => {
  workspaces
    .splice(0)
    .forEach((workspace) =>
      rmSync(workspace, { recursive: true, force: true }),
    );
});

describe('release packaging', () => {
  it('packages a stable release with stable extension metadata', () => {
    const result = packageVersion('3.1.0');

    expect(result.packageJson.version).toBe('3.1.0');
    expect(result.manifest).toEqual({
      version: '3.1.0',
      version_name: '3.1.0',
    });
    const entries = execFileSync('unzip', ['-Z1', result.archivePath], {
      encoding: 'utf8',
    });
    expect(entries).toContain('bundle.js');
    expect(entries).toContain('manifest.json');
    expect(entries).toContain('img/icon.png');
  });

  it('maps a beta prerelease to Chrome-compatible extension metadata', () => {
    const result = packageVersion('3.1.0-beta.2');

    expect(result.packageJson.version).toBe('3.1.0-beta.2');
    expect(result.manifest).toEqual({
      version: '3.1.0.2',
      version_name: '3.1.0-beta.2',
    });
  });
});
```

- [ ] **Step 2: Run the focused test and verify the expected failure**

Run:

```bash
npm test -- --runInBand spec/ReleasePackagingSpec.test.js
```

Expected: FAIL because `package.sh` ignores `SKIP_BUILD` and attempts
`npm run build` inside the minimal temporary workspace.

- [ ] **Step 3: Add the minimal test-safe build boundary**

Replace the unconditional build line in `package.sh`:

```sh
if [ "${SKIP_BUILD:-false}" != "true" ]; then
  npm run build
fi
```

All existing defaults and output paths remain unchanged when `SKIP_BUILD` is
unset.

- [ ] **Step 4: Add configuration metadata assertions**

Extend the test file with:

```js
describe('semantic-release configuration', () => {
  const config = JSON.parse(
    readFileSync(path.resolve(__dirname, '..', '.releaserc.json'), 'utf8'),
  );

  it('keeps stable and beta release channels', () => {
    expect(config.branches).toEqual([
      'main',
      { name: 'beta', prerelease: 'beta' },
    ]);
  });

  it('keeps packaging and GitHub asset metadata', () => {
    const execPlugin = config.plugins.find(
      ([name]) => name === '@semantic-release/exec',
    );
    const githubPlugin = config.plugins.find(
      ([name]) => name === '@semantic-release/github',
    );

    expect(execPlugin[1].prepareCmd).toBe(
      './package.sh ${nextRelease.version}',
    );
    expect(githubPlugin[1].assets).toEqual([
      {
        path: 'dist/just-not-sorry-chrome.zip',
        name: 'just-not-sorry-${nextRelease.gitTag}.zip',
        label: 'Chrome Web Store package',
      },
    ]);
  });
});
```

- [ ] **Step 5: Run focused and full unit tests**

Run:

```bash
npm test -- --runInBand spec/ReleasePackagingSpec.test.js
npm test -- --runInBand
```

Expected: 8 test suites and 258 tests pass with no tracked metadata changes or
release artifact left in the worktree.

- [ ] **Step 6: Commit the release contract**

```bash
git add package.sh spec/ReleasePackagingSpec.test.js
git commit -m "test: preserve release packaging contract"
```

### Task 2: Upgrade and Validate the Release Plugin Graph

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Test: `spec/ReleasePackagingSpec.test.js`

**Interfaces:**

- Consumes: semantic-release's bundled commit-analyzer,
  release-notes-generator, and GitHub plugins plus direct Git and exec plugins
- Produces: a peer- and engine-valid semantic-release 25.0.8 dependency tree

- [ ] **Step 1: Install the exact requested releases**

Run:

```bash
npm install --save-dev --save-exact semantic-release@25.0.8 @semantic-release/exec@7.1.0
```

Expected: only the requested direct versions and their transitive release
plugin graph change in `package.json` and `package-lock.json`.

- [ ] **Step 2: Validate versions, peers, and Node engines**

Run:

```bash
npm ls semantic-release @semantic-release/exec @semantic-release/git @semantic-release/commit-analyzer @semantic-release/release-notes-generator @semantic-release/github
node -e "for (const name of ['semantic-release','@semantic-release/exec','@semantic-release/git','@semantic-release/commit-analyzer','@semantic-release/release-notes-generator','@semantic-release/github']) { const p=require(name + '/package.json'); console.log(name, p.version, p.engines?.node || 'no engine'); }"
```

Expected: npm exits successfully without invalid or missing peers;
semantic-release is 25.0.8, exec is 7.1.0, and every reported engine accepts
the repository's Node 24.15.0 runtime.

- [ ] **Step 3: Run the release contract and source checks**

Run:

```bash
npm test -- --runInBand spec/ReleasePackagingSpec.test.js
npm run lint:check
npm run format:check
npm run build
```

Expected: all commands pass and the production build completes without release
configuration or engine errors.

- [ ] **Step 4: Inspect and commit the dependency migration**

Run:

```bash
git diff --check
git diff -- package.json package-lock.json
git status -sb
```

Then commit:

```bash
git add package.json package-lock.json
git commit -m "build: upgrade semantic-release tooling"
```

### Task 3: Prove Non-Publishing Stable and Beta Analysis

**Files:**

- Verify: `.releaserc.json`
- Verify: `package.sh`
- Verify generated ignored output: `build/**`, `dist/**`

**Interfaces:**

- Consumes: the upgraded release configuration, Git history, and a
  repository-scoped GitHub token
- Produces: stable/beta analysis logs and before/after evidence proving no
  release side effects

- [ ] **Step 1: Capture pre-dry-run local and remote state**

Run:

```bash
git rev-parse HEAD
git status --porcelain
git tag --list --sort=refname
git ls-remote --tags origin
gh release list --limit 20 --json tagName,isPrerelease,publishedAt
```

Save the outputs for comparison after both runs. Expected: the worktree is
clean and contains no `dist/` artifact from the focused temporary tests.

- [ ] **Step 2: Run stable release analysis in an isolated `main` clone**

Create a temporary shared clone, check out the current work as `main`, point its
origin at the GitHub repository, and expose the verified dependency tree:

```bash
release_dir=$(mktemp -d)
source_dir=$PWD
git clone --shared --no-checkout . "$release_dir"
git -C "$release_dir" checkout -b main HEAD
git -C "$release_dir" remote set-url origin https://github.com/defmethodinc/just-not-sorry.git
ln -s "$source_dir/node_modules" "$release_dir/node_modules"
(cd "$release_dir" && GH_TOKEN=$(gh auth token) "$source_dir/node_modules/.bin/semantic-release" --dry-run --no-ci)
```

Expected: semantic-release verifies the configuration, reaches commit analysis,
identifies the stable `main` channel, and explicitly skips prepare, publish,
success, and fail steps because this is a dry run.

- [ ] **Step 3: Run beta release analysis in an isolated `beta` clone**

Repeat in a fresh temporary clone with branch `beta`:

```bash
release_beta_dir=$(mktemp -d)
source_dir=$PWD
git clone --shared --no-checkout . "$release_beta_dir"
git -C "$release_beta_dir" checkout -b beta HEAD
git -C "$release_beta_dir" remote set-url origin https://github.com/defmethodinc/just-not-sorry.git
ln -s "$source_dir/node_modules" "$release_beta_dir/node_modules"
(cd "$release_beta_dir" && GH_TOKEN=$(gh auth token) "$source_dir/node_modules/.bin/semantic-release" --dry-run --no-ci)
```

Expected: semantic-release verifies the configuration, reaches commit analysis,
and identifies the `beta` prerelease channel without executing prepare or any
publish step.

- [ ] **Step 4: Prove both dry runs had no side effects**

Repeat the Step 1 commands and compare outputs. Also run:

```bash
test ! -e dist/just-not-sorry-chrome.zip
git status -sb
```

Expected: HEAD, tracked status, local tags, remote tags, and GitHub releases are
unchanged; no local package artifact exists; no release commit or tag was
created or pushed.

- [ ] **Step 5: Run complete acceptance verification**

Run:

```bash
npm test -- --runInBand
npm run lint:check
npm run format:check
npm run build
npm run e2e
```

Expected: all unit suites, lint, formatting, Webpack, and all four Chrome E2E
tests pass.

- [ ] **Step 6: Audit the final branch**

Run:

```bash
git diff --check main...HEAD
git status -sb
git log --oneline --decorate main..HEAD
```

Expected: the branch is clean and contains only the design, plan, release
contract, and dependency migration commits.
