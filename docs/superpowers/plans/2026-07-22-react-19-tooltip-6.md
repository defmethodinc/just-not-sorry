# React 19 and React Tooltip 6 Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the extension UI dependencies to React 19.2.7 and
react-tooltip 6.0.8 while preserving all warning and extension behavior.

**Architecture:** Keep the existing React component and warning pipeline
intact. Characterize the tooltip/highlight contract, update only dependency and
React API boundaries, and verify both source behavior and generated browser
extension output.

**Tech Stack:** React 19, React DOM 19, react-tooltip 6, Jest, Testing Library,
Webpack, Puppeteer, web-ext

## Global Constraints

- Use exactly `react` 19.2.7, `react-dom` 19.2.7, `react-tooltip` 6.0.8, and
  `prop-types` 15.8.1.
- Preserve warning detection, highlight placement, tooltip content, options
  rendering, and content-editable interactions.
- Introduce no intentional public extension API or manifest behavior changes.
- Make no unrelated source or dependency changes.

---

### Task 1: Characterize the Tooltip Contract

**Files:**

- Modify: `spec/WarningHighlightSpec.test.js`
- Test: `spec/WarningHighlightSpec.test.js`

**Interfaces:**

- Consumes: `WarningHighlight({ number, message, container, bounds })`
- Produces: regression assertions for `data-tooltip-id`,
  `data-tooltip-content`, highlight geometry, and the tooltip component id

- [ ] **Step 1: Strengthen the focused characterization test**

Pass `number={3}` in the shared render and extend the attribute test with:

```js
expect(jnsHighlight.dataset.tooltipId).toEqual('jns-highlight-3');
expect(jnsHighlight.dataset.tooltipContent).toEqual('test-message');
expect(document.getElementById('jns-highlight-3')).toHaveClass('jns-tooltip');
```

If react-tooltip intentionally defers the tooltip node until interaction, use
`userEvent.hover(jnsHighlight)` and `await screen.findByRole('tooltip')`, then
assert that node has id `jns-highlight-3` and class `jns-tooltip`.

- [ ] **Step 2: Run the characterization test before the upgrade**

Run: `npm test -- --runInBand spec/WarningHighlightSpec.test.js`

Expected: PASS, proving the assertions describe current user-visible behavior.

- [ ] **Step 3: Commit the characterization test**

```bash
git add spec/WarningHighlightSpec.test.js
git commit -m "test: preserve warning tooltip behavior"
```

### Task 2: Upgrade Dependencies and Adapt Supported APIs

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify only if the upgraded tests or build require it: `src/index.js`
- Modify only if the upgraded tests or build require it:
  `src/components/JustNotSorry.js`
- Modify only if the upgraded tests or build require it:
  `src/components/WarningHighlight.js`
- Test: `spec/WarningHighlightSpec.test.js`
- Test: `spec/JustNotSorrySpec.test.js`

**Interfaces:**

- Consumes: React client root/hydration exports, React DOM `createPortal`, and
  react-tooltip's `Tooltip` plus `data-tooltip-*` anchor attributes
- Produces: the same rendered `JustNotSorry` portal and warning highlight DOM
  under the upgraded packages

- [ ] **Step 1: Install the exact requested versions**

Run:

```bash
npm install --save-dev --save-exact react@19.2.7 react-dom@19.2.7 react-tooltip@6.0.8
npm install --save --save-exact prop-types@15.8.1
```

Expected: `package.json` and `package-lock.json` resolve the four exact versions
and no unrelated top-level package changes appear.

- [ ] **Step 2: Verify the upgrade exposes compatibility failures**

Run:

```bash
npm test -- --runInBand spec/WarningHighlightSpec.test.js spec/JustNotSorrySpec.test.js
```

Expected: either a focused failure or compatibility warning identifying an
obsolete import/prop, or clean passes showing the existing API is supported.
Record the output so every subsequent source edit responds to observed behavior.

- [ ] **Step 3: Make the minimal supported-API edits**

Use named supported exports without changing component behavior:

```js
// src/index.js, if namespace hydration access warns or fails
import { hydrateRoot } from 'react-dom/client';

hydrateRoot(
  document.body,
  <JustNotSorry
    phrases={MESSAGE_PATTERNS}
    onEvents={['input', 'focus', 'cut']}
  />,
);
```

```js
// src/components/JustNotSorry.js, if default interop warns or fails
import { createPortal } from 'react-dom';

return createPortal(warningComponents, currentEmail.offsetParent);
```

Keep `WarningHighlight` on the version-6 `Tooltip` export and its existing
`id`, `float`, `className`, `data-tooltip-id`, and `data-tooltip-content`
contract unless the focused failure demonstrates a renamed supported prop.
There are currently no function-component `defaultProps` declarations; retain
the existing parameter defaults in `JustNotSorry`.

- [ ] **Step 4: Run focused tests and eliminate compatibility warnings**

Run:

```bash
npm test -- --runInBand spec/WarningHighlightSpec.test.js spec/JustNotSorrySpec.test.js
```

Expected: PASS with no React act, legacy root, hydration, portal, unknown prop,
or function-component `defaultProps` warnings.

- [ ] **Step 5: Confirm dependency and source scope**

Run:

```bash
npm ls react react-dom react-tooltip prop-types
git diff -- package.json package-lock.json src spec
```

Expected: the requested exact versions are installed and the diff contains only
the focused compatibility/test changes described above.

- [ ] **Step 6: Commit the migration**

```bash
git add package.json package-lock.json src/index.js src/components/JustNotSorry.js src/components/WarningHighlight.js
git commit -m "build: upgrade React and react-tooltip"
```

Stage only source files that actually changed.

### Task 3: Verify Source and Generated Extension Output

**Files:**

- Verify: `src/**`
- Verify generated ignored output: `build/**`

**Interfaces:**

- Consumes: upgraded application source and dependency graph
- Produces: unit-tested, linted, formatted, bundled, extension-linted, and
  browser-smoke-tested output

- [ ] **Step 1: Run the full source quality suite**

Run:

```bash
npm test -- --runInBand
npm run lint:check
npm run format:check
```

Expected: 7 test suites and 253 or more tests pass; ESLint and Prettier report
no failures; test output contains no React compatibility warnings.

- [ ] **Step 2: Build and lint the extension**

Run:

```bash
npm run build
npx web-ext lint -s ./build
```

Expected: Webpack completes without errors and web-ext reports no extension
errors.

- [ ] **Step 3: Run automated E2E coverage**

Run: `npm run e2e`

Expected: the Puppeteer E2E suite passes against the generated extension
output.

- [ ] **Step 4: Smoke-test supported local browsers**

Run the repository's Chrome/Chromium workflow against `build/`, load a compose
surface, type a known warning phrase such as `just`, and verify a highlight and
its tooltip appear. Repeat with the Firefox workflow where Firefox is installed.
Record any browser that cannot run because the executable or interactive Gmail
session is unavailable; do not treat an unavailable browser as a successful
smoke test.

- [ ] **Step 5: Inspect the final branch**

Run:

```bash
git status -sb
git diff --check HEAD~2..HEAD
git log --oneline --decorate -5
```

Expected: the worktree is clean, there are no whitespace errors, and the branch
contains only the design, characterization, and dependency migration commits.
