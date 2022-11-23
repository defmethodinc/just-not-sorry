const { GIT_BRANCH: branch } = process.env;
const isProd = branch === 'automate-release-process'; // TODO: switch back to main
const prepareCmd = './package.sh ${nextRelease.version}';
const extensionId = isProd
  ? 'fmegmibednnlgojepmidhlhpjbppmlci'
  : 'fgnoahpabaeffmkacgedecamkmddkebn';
// const target = isProd ? 'default' : 'trustedTesters'; // TODO: uncomment
const target = 'draft'; // TODO: delete me
const packageName = 'just-not-sorry-${nextRelease.gitTag}.zip';
const chromeWebStoreParams = {
  extensionId,
  distFolder: 'build',
  target,
  asset: packageName,
};
const githubAssets = [
  {
    name: packageName,
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
    // {
    //   name: 'beta',
    //   prerelease: true,
    // },
    {
      // TODO: remove me
      name: 'automate-release-process',
      prerelease: 'beta',
    },
  ],
  plugins: isProd
    ? [
        ['@semantic-release/commit-analyzer'],
        ['@semantic-release/release-notes-generator', { linkCompare: false }],
        ['@semantic-release/exec', { prepareCmd }],
        ['semantic-release-chrome', chromeWebStoreParams],
        ['@semantic-release/github', { assets: githubAssets }],
        ['@semantic-release/git', { assets: gitAssetsToUpdate }],
        ['@qiwi/semantic-release-gh-pages-plugin', { src: 'site' }],
      ]
    : [
        ['@semantic-release/commit-analyzer'],
        ['@semantic-release/release-notes-generator', { linkCompare: false }],
        ['@semantic-release/exec', { prepareCmd }],
        ['semantic-release-chrome', chromeWebStoreParams],
        ['@semantic-release/github', { assets: githubAssets }],
        ['@semantic-release/git', { assets: gitAssetsToUpdate }],
      ],
};
