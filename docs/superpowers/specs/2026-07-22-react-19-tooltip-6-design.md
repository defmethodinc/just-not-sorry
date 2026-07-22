# React 19 and React Tooltip 6 Upgrade Design

## Goal

Upgrade the extension UI to React 19.2.7, React DOM 19.2.7,
react-tooltip 6.0.8, and prop-types 15.8.1 without changing observable
warning behavior or the extension's public and manifest interfaces.

## Approach

Use a minimal compatibility migration. Update the dependency manifest and lock
file, then change application code only where React 19 or react-tooltip 6 no
longer supports the existing API. Do not use this upgrade to restructure the
warning pipeline, alter copy, or modernize unrelated code.

Dependency-only installation is too optimistic because it would leave any
removed APIs or compatibility warnings undiscovered. A broader React rewrite
would expand regression risk without helping this issue. The selected approach
keeps the migration narrow while explicitly exercising the affected UI.

## Components and APIs

- `src/index.js` remains responsible for mounting `JustNotSorry` into the
  extension document. It will use the React 19-supported client root or
  hydration API appropriate for the existing generated page.
- `src/components/JustNotSorry.js` retains the warning calculation, event
  listener, and content-editable behavior. Its portal call will use the
  React 19-supported `react-dom` export without changing the portal target.
- `src/components/WarningHighlight.js` retains highlight geometry, tooltip
  content, and tooltip identity. Its react-tooltip integration will be adapted
  only if version 6 requires an API change.
- Function-component defaults will be expressed as parameter defaults wherever
  the source still relies on `defaultProps`. Existing parameter defaults remain
  unchanged.

## Behavior Preservation

The warning phrase data and matching pipeline are out of scope. A detected
warning must still create a highlight at the same calculated bounds, expose the
same message through its tooltip, and render into the current content-editable
element's offset parent. Options rendering, extension manifest behavior, and
public extension APIs must not intentionally change.

## Testing and Verification

Preserve the existing warning and content-editable unit assertions. Strengthen
the focused highlight test if necessary so it verifies the tooltip identifier,
content, and rendered tooltip integration rather than merely accepting a
dependency upgrade. Tests that expose React 19 compatibility warnings will be
treated as failures.

After the focused test-first migration, run the complete unit suite, ESLint,
Prettier check, production build, and E2E suite. Lint the generated extension
with `web-ext`. Smoke-test the generated output with the repository's supported
Chrome/Chromium and Firefox workflows where the local environment provides the
required browsers; document any unavailable browser rather than weakening the
automated checks.

## Constraints

- Pin `react` and `react-dom` to 19.2.7, `react-tooltip` to 6.0.8, and
  `prop-types` to 15.8.1 as required by issue #195.
- Introduce no intentional warning copy, warning placement, manifest, public
  API, or content-editable interaction changes.
- Avoid unrelated refactoring and dependency changes.
