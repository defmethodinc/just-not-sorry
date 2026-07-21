# Modernize Lint, Formatting, and Git Hooks Design

## Goal

Modernize the static-analysis, formatting, staged-file, and Git-hook tooling named in GitHub issue #193 while preserving the project's lint rules and commit workflow.

## Scope

- Upgrade ESLint to 10.7.0 and replace the legacy ESLint configuration with native flat configuration.
- Replace `babel-eslint` with `@babel/eslint-parser` 8.0.1.
- Upgrade `eslint-config-prettier` to 10.1.8, `eslint-plugin-jest` to 29.15.5, Prettier to 3.9.5, lint-staged to 17.1.0, and Husky to 9.1.7.
- Retain the audited current versions of `eslint-plugin-import` and `eslint-plugin-react`.
- Remove the unused `eslint-plugin-jasmine` dependency.
- Preserve the existing pre-commit, pre-push, and interactive Commitizen `prepare-commit-msg` behavior.
- Add non-mutating lint verification to the project scripts and CI.

## ESLint Configuration

`eslint.config.js` will replace `.eslintrc.json` and `.eslintignore`. It will use native flat-config objects rather than a compatibility wrapper. The configuration will preserve the current browser and project globals, Babel parsing, React and import recommendations, Prettier compatibility, custom rule overrides, and the Jest-specific test-file rules. Existing ignored paths will move into the flat configuration's global ignores.

The migration will not add stricter rules merely because newer plugin presets expose them. Any unavoidable differences in current recommended presets will be resolved explicitly so this issue remains a tooling migration rather than an application-code lint rewrite.

## Commands and Staged Files

`npm run lint` will remain the explicit mutating/fixing command. A new `npm run lint:check` command will run ESLint without `--fix` or any other file mutation. The formatting command will remain separate and mutating, with its Prettier CLI options updated for Prettier 3 where required.

The lint-staged configuration will remain in `package.json`. Staged JavaScript files will continue to be formatted and lint-fixed, while staged Markdown, CSS, and JSON files will continue to be formatted. No broader staged-file behavior will be introduced.

## Git Hooks

Husky's package-based v4 hook configuration will move into executable files under `.husky/` using Husky 9's supported layout:

- `pre-commit` will continue to run the unit tests followed by lint-staged.
- `pre-push` will continue to run the unit tests.
- `prepare-commit-msg` will preserve the existing interactive Commitizen invocation, including its terminal attachment and current non-blocking fallback.

The migration will add the package lifecycle setup required for Husky 9, but it will not change how contributors create commits or which commit message workflow they see.

## Continuous Integration

The Node.js CI workflow will run `npm run lint:check` after dependency installation and before the existing build and test checks. Lint failures will therefore stop CI without rewriting repository files. Existing build, unit-test, end-to-end, and release steps will otherwise remain unchanged.

## Formatting Stability

Prettier 3 will be run over the repository paths already governed by the format script. Any resulting source changes will be limited to deterministic formatter output. A second formatting check/run must produce no diff, demonstrating stable formatting.

## Verification

The migration will be verified on the repository's supported Node version with:

1. A clean dependency installation and lockfile consistency check.
2. `npm run lint:check`, with a clean working tree before and after the command to prove it is non-mutating.
3. The formatting command followed by a second run or check that produces no additional changes.
4. Direct inspection and representative execution of all three Husky hooks, with the Commitizen hook exercised in a way that does not alter commit history.
5. `npm test`.
6. `npm run build`.
7. The CI-equivalent command sequence; end-to-end tests remain authoritative in CI if the local browser environment cannot run them.

## Error Handling and Compatibility

Configuration failures will be traced to the exact ESLint flat-config, parser, plugin, Prettier, lint-staged, or Husky compatibility boundary and corrected with the smallest explicit change. The implementation will not suppress lint errors, broaden ignores, weaken hooks, or change commit behavior merely to make checks pass.

## Non-Goals

- New lint rules or unrelated source cleanup.
- Changes to extension functionality or user-visible behavior.
- Changes to Commitizen, commit conventions, or the commit process.
- Dependency upgrades not named in issue #193 unless strictly required by the named tools and documented during implementation.
