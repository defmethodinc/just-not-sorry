# Standalone Jekyll and GitHub Pages Design

## Context

Issue #197 upgrades the website runtime and dependency bundle. The attempted
combination of Ruby 4.0.6 and `github-pages` 232 cannot resolve because the
`github-pages` dependency graph includes `commonmarker` versions that require
Ruby below 4. The `github-pages` gem is also no longer an appropriate owner for
the site's build toolchain.

The website already uses conventional Jekyll Markdown, Liquid layouts,
includes, data files, and the `jekyll-theme-minimal` theme. The migration must
preserve that content and its rendered appearance.

## Decision

Replace the `github-pages` gem with direct, maintained dependencies:

- Ruby 4.0.6
- Jekyll 4.4.1, constrained within the 4.4 release line
- `jekyll-theme-minimal` 0.2.0, retained explicitly because `_config.yml`
  selects it
- WEBrick 1.9.2 for local serving on modern Ruby

Generate a new `site/Gemfile.lock` with `bundle install` under Ruby 4.0.6.
Do not use `bundle update` and do not pin transitive dependencies individually.

## Build Flow

The website remains rooted at `site/`. Before building, the workflow must
populate the two generated data inputs that the current deployment creates:

1. Copy `src/warnings/phrases.json` to `site/_data/phrases.json`.
2. Write the current short commit SHA to `site/_data/version.json`.
3. Run Jekyll from `site/` and emit the static site to `site/_site`.

Local development continues to use `bundle exec jekyll serve` from `site/`.
The Markdown pages, Liquid templates, theme overrides, images, manifest, and
custom-domain `CNAME` file remain unchanged.

## Validation

The obsolete `bundle exec github-pages health-check` command is removed. Build
validation instead checks the artifact that will actually be deployed:

- `bundle install` resolves under Ruby 4.0.6.
- `bundle exec jekyll build` succeeds.
- Expected pages such as `index.html`, `phrases.html`, and `releases.html`
  exist in `site/_site`.
- The generated site contains the copied warning data's rendered content, the
  current version metadata, theme assets, and `CNAME`.
- A small repository-owned Node validation script checks required files,
  internal links, the custom domain, generated phrase content, version metadata,
  and theme stylesheet references without depending on the already-deployed
  production domain.
- Representative generated pages are inspected for the existing layout markers
  and theme stylesheet so unintended structural or styling changes fail CI.

## Deployment

Replace branch-based publishing through the npm `gh-pages` package with the
native GitHub Pages artifact workflow:

1. Check out the repository.
2. Install Node dependencies only for the existing data-generation scripts.
3. Select Ruby from `site/.ruby-version` with `ruby/setup-ruby@v1` and install
   the locked bundle from `site/`.
4. Generate site data and build `site/_site`.
5. Upload `site/_site` with `actions/upload-pages-artifact`.
6. On `main` only, deploy with `actions/deploy-pages` to the `github-pages`
   environment.

Pull requests run the complete build and validation path but never deploy.
The workflow receives only the documented `pages: write` and `id-token: write`
permissions needed by the deployment job. Repository Pages settings must use
GitHub Actions as the publishing source.

## Repository Cleanup

Remove the npm `gh-pages` dependency and its obsolete deploy script after the
native workflow owns deployment. Update the root and site documentation to
describe direct Jekyll development and artifact deployment. Keep
`ruby/setup-ruby@v1`; it reads the version pinned in `site/.ruby-version`.

## Risks and Mitigations

- Jekyll 3-to-4 rendering changes could alter output. Build both versions where
  practical and inspect the generated HTML and CSS before accepting the change.
- GitHub Pages will not deploy until the repository publishing source is set to
  GitHub Actions. Document this one-time repository setting and verify it before
  merging.
- External-link checks can be flaky. Validate internal links and generated
  files in CI; treat live-domain availability as a post-deployment check rather
  than a dependency-resolution gate.
- Ruby 4 support is validated from the resolved lockfile and actual build, not
  inferred only from top-level gem constraints.

## Acceptance Criteria

- No dependency on the `github-pages` gem remains.
- Ruby 4.0.6 installs the bundle without `bundle update`.
- The standalone Jekyll build and artifact validation pass locally and in CI.
- Existing site content, routes, theme behavior, generated phrases, version
  footer, and custom domain are preserved.
- Pull requests cannot publish; `main` deploys the verified `site/_site`
  artifact through GitHub's supported Pages actions.
