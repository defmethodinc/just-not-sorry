var scriptsToLoad = [
  chrome.extension.getURL('lib/jquery-2.1.4.min.js'),
  chrome.extension.getURL('lib/jquery.caret.min.js'),
  chrome.extension.getURL('lib/findAndReplaceDOMText.js'),
  chrome.extension.getURL('lib/gmail.js'),
  chrome.extension.getURL('src/WarningChecker.js'),
  chrome.extension.getURL('src/Warnings.js'),
  chrome.extension.getURL('src/JustNotSorry.js'),
];
head.load(scriptsToLoad);
