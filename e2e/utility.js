import * as fs from 'fs';
import * as path from 'path';

// eslint-disable-next-line no-undef
const manifestPath = path.join(__dirname, '..', 'build', 'manifest.json');
export function e2eSetup() {
  fs.readFile(manifestPath, (err, data) => {
    if (err) throw err;
    const newValue = data
      .toString()
      .replace(
        'https://mail.google.com/*',
        'file:///*/just-not-sorry/public/jns-test.html'
      );
    fs.writeFile(manifestPath, newValue, 'utf-8', function (err) {
      if (err) throw err;
    });
  });
}
export function e2eTeardown() {
  fs.readFile(manifestPath, (err, data) => {
    if (err) throw err;
    const newValue = data
      .toString()
      .replace(
        'file:///*/just-not-sorry/public/jns-test.html',
        'https://mail.google.com/*'
      );
    fs.writeFile(manifestPath, newValue, 'utf-8', function (err) {
      if (err) throw err;
    });
  });
}
