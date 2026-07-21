# Modernize Lint, Formatting, and Git Hooks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the issue #193 linting, formatting, staged-file, and Git-hook toolchain while preserving lint policy and all three existing hook behaviors.

**Architecture:** A native `eslint.config.js` will express the existing lint policy with current parser and plugin APIs, while `package.json` remains the command and lint-staged entrypoint. Husky behavior moves into three executable `.husky/` scripts, and CI calls a new non-mutating lint command.

**Tech Stack:** Node.js 24, npm, ESLint 10 flat config, Babel ESLint parser 8, Prettier 3, lint-staged 17, Husky 9, Jest, GitHub Actions.

## Global Constraints

- Preserve the existing pre-commit, pre-push, and interactive Commitizen `prepare-commit-msg` behavior.
- Do not add new lint rules, weaken lint validation, broaden ignored paths, or change extension runtime behavior.
- Keep `eslint-plugin-import` at 2.32.0 and `eslint-plugin-react` at 7.37.5.
- Upgrade only the dependencies named in issue #193 unless a named package has a required peer dependency.
- `npm run lint:check` must not modify files.

---

### Task 1: Dependency and command migration

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**

- Consumes: Existing npm scripts, dev dependencies, Husky v4 configuration, and lint-staged configuration.
- Produces: `npm run lint:check`, a Husky 9 `prepare` lifecycle, exact issue #193 dependency versions, and unchanged staged-file behavior.

- [ ] **Step 1: Record the pre-migration command contract**

Run:

```bash
node -e "const p=require('./package.json'); if(p.scripts.lint!=='eslint . --cache --fix') process.exit(1); if(p.husky.hooks['pre-commit']!=='npm test && lint-staged') process.exit(1); if(p.husky.hooks['pre-push']!=='npm test') process.exit(1); if(p.husky.hooks['prepare-commit-msg']!=='exec < /dev/tty && git cz --hook || true') process.exit(1)"
```

Expected: exit 0.

- [ ] **Step 2: Update package metadata and lockfile**

Run:

```bash
npm install --save-dev --save-exact eslint@10.7.0 @babel/eslint-parser@8.0.1 eslint-config-prettier@10.1.8 eslint-plugin-jest@29.15.5 prettier@3.9.5 lint-staged@17.1.0 husky@9.1.7
npm uninstall --save-dev babel-eslint eslint-plugin-jasmine
```

Then modify `package.json` so the scripts include:

```json
"format": "prettier --log-level warn --write \"{src,spec}/*.{js,css}\" \"*.{md,css,json,js}\"",
"lint": "eslint . --cache --fix",
"lint:check": "eslint .",
"prepare": "husky"
```

Remove the top-level `husky` object. Keep the existing `lint-staged` object byte-for-byte equivalent in behavior.

- [ ] **Step 3: Verify the package contract**

Run:

```bash
node -e "const p=require('./package.json'); const d=p.devDependencies; const exact={eslint:'10.7.0','@babel/eslint-parser':'8.0.1','eslint-config-prettier':'10.1.8','eslint-plugin-jest':'29.15.5',prettier:'3.9.5','lint-staged':'17.1.0',husky:'9.1.7'}; for(const [k,v] of Object.entries(exact)) if(d[k]!==v) throw Error(k); if('babel-eslint' in d||'eslint-plugin-jasmine' in d||'husky' in p) throw Error('legacy config'); if(p.scripts['lint:check']!=='eslint .') throw Error('lint:check')"
npm install --package-lock-only --ignore-scripts
git diff --check
```

Expected: all commands exit 0 and npm reports the lockfile is up to date.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: upgrade lint and hook tooling"
```

### Task 2: Native ESLint flat configuration

**Files:**

- Create: `eslint.config.js`
- Delete: `.eslintrc.json`
- Delete: `.eslintignore`

**Interfaces:**

- Consumes: `@babel/eslint-parser`, ESLint core recommended rules, import/React/Jest plugin flat configurations, Prettier's flat configuration, and the legacy rule contract.
- Produces: A flat configuration consumed by `eslint .`, including focused Jest rules for `**/*.test.js`.

- [ ] **Step 1: Verify ESLint 10 rejects the missing flat configuration**

Run:

```bash
npx eslint .
```

Expected: FAIL because ESLint 10 cannot find `eslint.config.js`.

- [ ] **Step 2: Create the minimal native flat configuration**

Create `eslint.config.js` with CommonJS imports for `@eslint/js`, `@babel/eslint-parser`, `eslint-plugin-import`, `eslint-plugin-react`, `eslint-plugin-jest`, `eslint-config-prettier/flat`, and the `globals` package already supplied by ESLint. Export an array that begins as follows:

```js
const js = require('@eslint/js');
const babelParser = require('@babel/eslint-parser');
const importPlugin = require('eslint-plugin-import');
const jestPlugin = require('eslint-plugin-jest');
const reactPlugin = require('eslint-plugin-react');
const prettierConfig = require('eslint-config-prettier/flat');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'build/**',
      'dist/**',
      'gulpfile.js',
      'webpack.config.js',
      'jest-puppeteer.config.js',
    ],
  },
  js.configs.recommended,
  importPlugin.flatConfigs.errors,
  reactPlugin.configs.flat.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        ecmaVersion: 2018,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        analytics: 'readonly',
        browser: 'readonly',
        chrome: 'readonly',
        context: 'readonly',
        document: 'readonly',
        global: 'readonly',
        jestPuppeteer: 'readonly',
        page: 'readonly',
        window: 'readonly',
      },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'import/no-unresolved': 'off',
      'react/prop-types': 'off',
      'react/no-unknown-property': ['error', { ignore: ['class'] }],
    },
  },
  {
    files: ['**/*.test.js'],
    ...jestPlugin.configs['flat/recommended'],
  },
  prettierConfig,
];
```

Merge the Jest config's language options with `globals.node` and its supplied Jest globals so it does not replace the shared parser settings. Preserve the shown ordering so Prettier compatibility remains last. Translate every pattern from `.eslintignore`; do not add source paths to the ignore list.

- [ ] **Step 3: Remove the legacy ESLint files and run RED/GREEN diagnostics**

Delete `.eslintrc.json` and `.eslintignore`, then run:

```bash
npm run lint:check
```

Expected: Either PASS, or fail only with explicit flat-config compatibility or newly activated recommended-rule differences. Resolve configuration compatibility explicitly; do not edit application source or suppress existing legacy rules.

- [ ] **Step 4: Prove lint checking is non-mutating**

Run:

```bash
git diff --quiet
npm run lint:check
git diff --quiet
```

Expected: both `git diff --quiet` checks have the same status and lint exits 0. If configuration files are intentionally uncommitted, record `git diff --binary` checksums before and after instead.

- [ ] **Step 5: Commit**

```bash
git add eslint.config.js .eslintrc.json .eslintignore
git commit -m "build: migrate ESLint to flat config"
```

### Task 3: Husky 9 hook migration

**Files:**

- Create: `.husky/pre-commit`
- Create: `.husky/pre-push`
- Create: `.husky/prepare-commit-msg`

**Interfaces:**

- Consumes: npm test, lint-staged, Commitizen, and the commit message file argument passed by Git.
- Produces: Executable Husky hooks with the same shell commands and exit behavior as the removed Husky v4 configuration.

- [ ] **Step 1: Verify hook files do not exist**

Run:

```bash
test ! -e .husky/pre-commit && test ! -e .husky/pre-push && test ! -e .husky/prepare-commit-msg
```

Expected: exit 0.

- [ ] **Step 2: Add the three hook files**

Create `.husky/pre-commit`:

```sh
npm test && npx lint-staged
```

Create `.husky/pre-push`:

```sh
npm test
```

Create `.husky/prepare-commit-msg`:

```sh
exec < /dev/tty && npx git-cz --hook || true
```

Make all three files executable. The `prepare-commit-msg` command preserves the existing terminal attachment and non-blocking fallback; it must not receive new conditions or arguments.

- [ ] **Step 3: Verify installation and hook contents**

Run:

```bash
npm run prepare
test -x .husky/pre-commit
test -x .husky/pre-push
test -x .husky/prepare-commit-msg
test "$(cat .husky/pre-commit)" = "npm test && npx lint-staged"
test "$(cat .husky/pre-push)" = "npm test"
test "$(cat .husky/prepare-commit-msg)" = "exec < /dev/tty && npx git-cz --hook || true"
```

Expected: all checks exit 0.

- [ ] **Step 4: Exercise validation hooks safely**

Run:

```bash
.husky/pre-commit
.husky/pre-push
.husky/prepare-commit-msg /tmp/just-not-sorry-commit-message
```

Expected: both validation hooks pass; the Commitizen hook exits 0 even when the non-interactive environment has no `/dev/tty`. No commit is created.

- [ ] **Step 5: Commit**

```bash
git add .husky/pre-commit .husky/pre-push .husky/prepare-commit-msg
git commit -m "build: migrate Git hooks to Husky 9"
```

### Task 4: CI lint gate and formatting stabilization

**Files:**

- Modify: `.github/workflows/nodejs.yml`
- Modify: formatter-governed files only if Prettier 3 changes their output.

**Interfaces:**

- Consumes: `npm run lint:check`, `npm run format`, existing CI build/test/e2e pipeline.
- Produces: A non-mutating CI lint gate and stable Prettier 3 output.

- [ ] **Step 1: Add the CI lint check**

After `npm ci`, add:

```yaml
- name: Run lint checks
  run: npm run lint:check
```

- [ ] **Step 2: Run Prettier 3 and prove stability**

Run:

```bash
npm run format
git diff --check
npm run format
git diff --check
```

Expected: the second format run creates no further diff. Review every formatted source change and retain only deterministic Prettier output within the format script's existing globs.

- [ ] **Step 3: Run the complete verification suite**

Run:

```bash
npm run lint:check
npm test
npm run build
npm ci
npm run lint:check
npm test
npm run build
```

Expected: every command exits 0; lint output has no errors; Jest reports 7 passing suites and 253 passing tests; Webpack completes successfully. Run `npm run e2e` if the local browser environment supports it, otherwise report CI as authoritative for e2e.

- [ ] **Step 4: Confirm a clean non-mutating lint pass**

Run:

```bash
git status --short
npm run lint:check
git status --short
```

Expected: status output is identical before and after lint.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/nodejs.yml package.json package-lock.json eslint.config.js .husky
git add src spec README.md PRIVACY.md just-not-sorry.css manifest.json webpack.config.js
git commit -m "ci: enforce non-mutating lint checks"
```

Before committing, use `git diff --name-only` to unstage any listed path that Prettier did not actually modify. Do not stage generated files or unrelated changes.
