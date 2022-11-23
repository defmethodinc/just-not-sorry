const { GIT_BRANCH: branch } = process.env;
const prepareCmd = './package.sh ${nextRelease.version}';
const githubAssets = [
  {
    path: 'dist/just-not-sorry-chrome.zip',
    name: 'just-not-sorry-${nextRelease.gitTag}.zip',
    label: 'Chrome Web Store package',
  },
];
const gitAssetsToUpdate = ['package.json', 'manifest.json'];

module.exports = {
  dryRun: true, // TODO: remove me
  branches: [
    {
      name: 'main',
    },
    {
      name: 'beta',
      prerelease: true,
    },
    {
      // TODO: remove me
      name: 'automate-release-process',
      prerelease: true,
    },
  ],
  plugins:
    branch === 'automate-release-process' // TODO: switch back to main
      ? [
          ['@semantic-release/commit-analyzer'],
          ['@semantic-release/release-notes-generator', { linkCompare: false }],
          ['@semantic-release/exec', { prepareCmd }],
          ['@semantic-release/github', { assets: githubAssets }],
          ['@semantic-release/git', { assets: gitAssetsToUpdate }],
          ['@qiwi/semantic-release-gh-pages-plugin', { src: 'site' }],
        ]
      : [
          ['@semantic-release/commit-analyzer'],
          ['@semantic-release/release-notes-generator', { linkCompare: false }],
          ['@semantic-release/exec', { prepareCmd }],
          ['@semantic-release/github', { assets: githubAssets }],
          ['@semantic-release/git', { assets: gitAssetsToUpdate }],
        ],
};
