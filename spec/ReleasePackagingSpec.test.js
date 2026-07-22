import { execFileSync } from 'child_process';
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';

const PACKAGE_SCRIPT = path.resolve(__dirname, '..', 'package.sh');
const workspaces = [];

function packageVersion(version) {
  const workspace = mkdtempSync(path.join(tmpdir(), 'jns-release-'));
  workspaces.push(workspace);
  writeFileSync(
    path.join(workspace, 'package.json'),
    JSON.stringify(
      {
        version: '0.0.0',
        scripts: { build: 'touch build-ran' },
      },
      null,
      2,
    ),
  );
  writeFileSync(
    path.join(workspace, 'manifest.json'),
    JSON.stringify({ version: '0.0.0', version_name: '0.0.0' }, null, 2),
  );
  mkdirSync(path.join(workspace, 'build', 'img'), { recursive: true });
  writeFileSync(path.join(workspace, 'build', 'bundle.js'), 'bundle');
  writeFileSync(path.join(workspace, 'build', 'manifest.json'), 'manifest');
  writeFileSync(path.join(workspace, 'build', 'img', 'icon.png'), 'icon');

  execFileSync(PACKAGE_SCRIPT, [version], {
    cwd: workspace,
    env: { ...process.env, SKIP_BUILD: 'true' },
    stdio: 'pipe',
  });

  return {
    packageJson: JSON.parse(
      readFileSync(path.join(workspace, 'package.json'), 'utf8'),
    ),
    manifest: JSON.parse(
      readFileSync(path.join(workspace, 'manifest.json'), 'utf8'),
    ),
    archivePath: path.join(workspace, 'dist', 'just-not-sorry-chrome.zip'),
    buildRan: existsSync(path.join(workspace, 'build-ran')),
  };
}

afterEach(() => {
  workspaces
    .splice(0)
    .forEach((workspace) =>
      rmSync(workspace, { recursive: true, force: true }),
    );
});

describe('release packaging', () => {
  it('packages a stable release with stable extension metadata', () => {
    const result = packageVersion('3.1.0');

    expect(result.packageJson.version).toBe('3.1.0');
    expect(result.manifest).toEqual({
      version: '3.1.0',
      version_name: '3.1.0',
    });
    expect(result.buildRan).toBe(false);
    const entries = execFileSync('unzip', ['-Z1', result.archivePath], {
      encoding: 'utf8',
    });
    expect(entries).toContain('bundle.js');
    expect(entries).toContain('manifest.json');
    expect(entries).toContain('img/icon.png');
  });

  it('maps a beta prerelease to Chrome-compatible extension metadata', () => {
    const result = packageVersion('3.1.0-beta.2');

    expect(result.packageJson.version).toBe('3.1.0-beta.2');
    expect(result.manifest).toEqual({
      version: '3.1.0.2',
      version_name: '3.1.0-beta.2',
    });
  });
});

describe('semantic-release configuration', () => {
  const config = JSON.parse(
    readFileSync(path.resolve(__dirname, '..', '.releaserc.json'), 'utf8'),
  );

  it('keeps stable and beta release channels', () => {
    expect(config.branches).toEqual([
      'main',
      { name: 'beta', prerelease: 'beta' },
    ]);
  });

  it('keeps packaging and GitHub asset metadata', () => {
    const execPlugin = config.plugins.find(
      (plugin) =>
        Array.isArray(plugin) && plugin[0] === '@semantic-release/exec',
    );
    const githubPlugin = config.plugins.find(
      (plugin) =>
        Array.isArray(plugin) && plugin[0] === '@semantic-release/github',
    );

    expect(execPlugin[1].prepareCmd).toBe(
      './package.sh ${nextRelease.version}',
    );
    expect(githubPlugin[1].assets).toEqual([
      {
        path: 'dist/just-not-sorry-chrome.zip',
        name: 'just-not-sorry-${nextRelease.gitTag}.zip',
        label: 'Chrome Web Store package',
      },
    ]);
  });
});
