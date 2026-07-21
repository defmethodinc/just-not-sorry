# Upgrade Babel, Webpack, and Extension Tooling Design

## Goal

Upgrade the transpilation, bundling, development-server, and browser-extension tooling named in GitHub issue #192 while preserving the extension's existing build outputs and preventing new security or extension-lint findings.

## Scope

- Upgrade `@babel/cli` to 8.0.4, `@babel/core` to 8.0.1, `@babel/preset-env` to 8.0.2, and `@babel/preset-react` to 8.0.1.
- Upgrade `concurrently` to 10.0.3, `copy-webpack-plugin` to 14.0.0, `webpack-cli` to 7.2.1, `webpack-dev-server` to 6.0.0, and `web-ext` to 10.5.0.
- Retain Webpack 5.108.4 and the current compatible loader and plugin versions unless dependency compatibility requires a narrowly scoped adjustment.
- Migrate Babel and Webpack configuration only where the upgraded APIs require it.
- Do not commit audit or extension-lint reports. Use their before-and-after results as regression checks.

## Configuration Design

Babel configuration will remain centralized and will target the environments needed by the existing source and tests. Webpack's Babel loader will consume that shared configuration rather than maintaining a divergent inline preset list. React JSX transformation will continue to use the project's existing React-compatible behavior.

Webpack will retain the existing production configuration, three entry points (`bundle`, `options`, and `background`), output names, HTML generation, copied image directory, manifest, stylesheet, source maps, and development-server behavior. Configuration changes will be limited to APIs that changed in the upgraded toolchain.

## Build Output Contract

A successful production build must continue to contain:

- `build/bundle.js`
- `build/options.js`
- `build/background.js`
- `build/options.html`
- `build/manifest.json`
- `build/just-not-sorry.css`
- `build/img/` with the extension icons

A focused automated check will verify this contract if no current test already covers it.

## Security and Extension Validation

The pre-upgrade `npm audit` result establishes the regression baseline. After updating the lockfile, the final audit must not introduce findings attributable to this migration; build-tool findings addressed by the named upgrades should be removed where their dependency trees permit it. Findings outside issue #192 remain out of scope unless a required upgrade resolves them transitively.

`npm run webext:lint` will be run against a fresh production build. New findings are not acceptable. Any remaining finding must already exist in the baseline or be a platform limitation, and its code and rationale must be reported in the implementation handoff rather than committed as a report.

## Error Handling and Compatibility

Dependency installation or configuration failures will be handled by identifying the exact changed API or engine constraint and making the smallest compatible configuration change. The migration will not hide build warnings, disable validation, or broaden ignored files merely to make checks pass.

## Testing

Verification will run on the repository's supported Node version and include:

1. A clean `npm ci`.
2. Unit tests with `npm test`.
3. A production build with `npm run build`.
4. An automated assertion that all required bundles and copied assets exist.
5. `npm run webext:lint` and comparison with the pre-upgrade baseline.
6. `npm audit` and comparison with the pre-upgrade baseline.
7. `npm run e2e` where the local browser environment supports it; CI remains the authoritative browser run.

## Non-Goals

- ESLint, Prettier, lint-staged, and Husky modernization from issue #193.
- Broad dependency cleanup unrelated to the named build and extension tools.
- Changes to extension functionality, manifest permissions, or user-visible behavior.
- Committed audit snapshots or generated build artifacts.
