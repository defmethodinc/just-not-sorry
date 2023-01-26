# Just Not Sorry web page

The Just Not Sorry web site is hosted on GitHub Pages at both https://justnotsorry.com and https://defmethodinc.github.io/just-not-sorry/

It is built using [Jekyll](https://jekyllrb.com/) and a customized version of the [minimal theme](https://github.com/pages-themes/minimal).

## Development

Prerequisites:

- ruby
- bundler

To install dependencies:

```
bundle install
```

Previewing the site locally:

```
bundle exec jekyll serve
```

To make changes, create a new branch, commit your changes to the `site` directory, and submit a PR against the `main` branch. Once the PR is merged, a GitHub Actions CI build will build the site and push it to the `gh-pages` remote branch, which will trigger a deployment to https://justnotsorry.com.

Note that the "List of Warning Phrases" page is dynamically generated, so any changes to the warning phrases (`../src/warnings/phrases.json`) on the `main` branch will trigger an update to justnotsorry.com.
