//This filename is the default path for jest config
module.exports = {
  launch: {
    headless: false,
    slowMo: false,
    devtools: false,
    args: [
      `--disable-extensions-except=build`,
      `--load-extension=build`,
      `--window-size=800,800`,
    ],
  },
};
