var scriptsToLoad = [
  chrome.extension.getURL('lib/dom-regexp-match-1.1.0.js'),
  chrome.extension.getURL('src/HighlightGenerator.js'),
  chrome.extension.getURL('src/WarningChecker.js'),
  chrome.extension.getURL('src/Warnings.js'),
  chrome.extension.getURL('src/JustNotSorry.js'),
];
head.load(scriptsToLoad);
