# Just Not Sorry -- the Gmail Plug-in
Inspired by the writings of Tara Mohr and others, this Chrome Extension for Gmail will warn you when you use phrases that might be undermining your message.

## Citations
  * http://www.taramohr.com/8-ways-women-undermine-themselves-with-their-words/
  * http://goop.com/how-women-undermine-themselves-with-words/
  * http://www.fastcompany.com/3032112/strong-female-lead/sorry-not-sorry-why-women-need-to-stop-apologizing-for-everything
  * http://www.fastcompany.com/3049609/the-future-of-work/4-types-of-useless-phrases-you-need-to-eliminate-from-your-emails
  * http://jezebel.com/google-exec-women-stop-saying-just-so-much-you-sound-1715228159

## Development

### Set up
  * `git clone` the repo
  * Follow the [instructions on the Chrome docs](https://developer.chrome.com/extensions/getstarted#unpacked) to load the extension
  * Go to Gmail and open a compose window
  * If you make changes to the code, click the Reload link on the `chrome://extensions` page and then reload your Gmail tab to pick up the changes.
  * Errors will show up in the console

### Jasmine Tests
Open 'SpecRunner.html' in your web browser to run the test suite.

### To Publish to Chrome Webstore
  * Run the `package.sh` shell script to generate a zip file
  * Then follow the steps in the [docs starting at step 5](https://developer.chrome.com/webstore/get_started_simple#step5).

### Libraries Used
For production:
  * [gmail.js](https://github.com/KartikTalwar/gmail.js)
  * [findAndReplaceDOMText](https://github.com/padolsey/findAndReplaceDOMText)
  * [jQuery](https://jquery.com/)
  * Based on [gmail-chrome-extension-boilerplate](https://github.com/KartikTalwar/gmail-chrome-extension-boilerplate)

For test:
  * [jasmine.js](http://jasmine.github.io/)
  * [jasmine-jquery.js](https://github.com/velesin/jasmine-jquery)
