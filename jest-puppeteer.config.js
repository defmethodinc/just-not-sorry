//This filename is the default path for jest config

// Allow running without the sandbox on CI only
const ciOnlyArgs =
  process.env.CI === 'true' ? ['--no-sandbox', '--disable-setuid-sandbox'] : [];

module.exports = {
  launch: {
    headless: false,
    slowMo: false,
    devtools: false,
    args: [
      `--disable-extensions-except=build`,
      `--load-extension=build`,
      `--window-size=800,800`,
    ].concat(ciOnlyArgs),
  },
};
