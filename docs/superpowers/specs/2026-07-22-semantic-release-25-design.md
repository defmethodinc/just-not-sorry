# Semantic Release 25 Upgrade Design

## Goal

Upgrade `semantic-release` to 25.0.8 and `@semantic-release/exec` to 7.1.0
without changing stable or beta release semantics, package contents, release
metadata, or Chrome Web Store handoff behavior.

## Approach

Use a focused dependency and release-contract migration. Keep the established
semantic-release plugin order and responsibilities, update the requested direct
dependencies, and make the packaging boundary testable so stable and beta
version propagation and ZIP generation are verified automatically.

A dependency-only update would leave the most important release behaviors
dependent on manual inspection. Rewriting the release pipeline in JavaScript
would improve testability but introduce unnecessary behavior and review risk.
The selected approach adds coverage at the existing shell-script boundary while
preserving its production interface.

## Release Configuration

`.releaserc.json` continues to define `main` as the stable channel and `beta` as
the `beta` prerelease channel. The plugin sequence remains:

1. `@semantic-release/commit-analyzer`
2. `@semantic-release/release-notes-generator`
3. `@semantic-release/exec`
4. `@semantic-release/github`
5. `@semantic-release/git`

The exec plugin continues to invoke `./package.sh ${nextRelease.version}` during
prepare. The GitHub plugin continues to upload
`dist/just-not-sorry-chrome.zip` under the existing tag-derived asset name and
Chrome Web Store label. The Git plugin continues to commit only `package.json`
and `manifest.json` as release metadata.

## Packaging Contract

`package.sh <next-release-version>` remains the production entry point. It will
retain these outputs:

- `package.json.version` receives the full semantic-release version.
- `manifest.json.version_name` receives the full version, including beta
  prerelease metadata.
- `manifest.json.version` receives a Chrome-compatible numeric version derived
  from the release version.
- the production Webpack build is created and archived at
  `dist/just-not-sorry-chrome.zip`.

Focused tests will run packaging in an isolated temporary copy so neither the
developer worktree nor tracked release metadata is mutated. Stable and beta
examples will assert both version files, the expected asset path, and required
archive entries.

## Dependency Compatibility

`package.json` and `package-lock.json` will resolve semantic-release 25.0.8 and
`@semantic-release/exec` 7.1.0. The installed dependency tree will be checked
for peer and engine errors across commit-analyzer, release-notes-generator,
GitHub, Git, and exec plugins. No other direct release plugin will be upgraded
unless npm demonstrates that it cannot satisfy semantic-release 25's supported
peer or engine requirements.

## Dry-Run Safety

Semantic-release will be exercised with `--dry-run` and repository-scoped test
credentials. Stable and beta branch configurations will each reach release
analysis without running the exec prepare command or any publish step. Before
and after Git references, tracked files, and release artifacts will be compared
to prove the dry runs created no commits, tags, releases, pushed refs, Chrome
uploads, or packaging side effects.

If semantic-release cannot analyze the feature branch by name, the verification
will use an isolated local repository whose branch is named `main` or `beta`
and whose origin points to the same GitHub repository. It will not alter the
actual remote or the main checkout.

## Verification

- Focused stable and beta packaging contract tests pass.
- The complete unit suite, ESLint, Prettier check, production build, and Chrome
  E2E suite pass.
- `npm ls` reports a valid release-plugin dependency tree with supported engines.
- Stable and beta semantic-release dry runs reach release analysis without
  configuration or engine errors.
- Git and GitHub state checks prove no publishing side effects occurred.

## Constraints

- Use exactly semantic-release 25.0.8 and `@semantic-release/exec` 7.1.0.
- Do not publish a release, push a release commit or tag, upload a GitHub asset,
  or submit a Chrome Web Store artifact.
- Preserve the stable/beta branch model, generated ZIP path, release asset
  metadata, package contents, and manual Chrome Web Store workflow.
- Avoid unrelated release, workflow, dependency, or application changes.
