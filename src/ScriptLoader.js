var scriptsToLoad = [
  'lib/jquery-2.1.4.min.js',
  'lib/jquery.caret.min.js',
  'lib/findAndReplaceDOMText.js',
  'lib/gmail-0.4.js',
  'src/WarningChecker.js',
  'src/Warnings.js',
  'src/JustNotSorry.js',
];
scriptsToLoad.forEach(function(currScript) {
  var scriptTag = document.createElement('script');
  scriptTag.src = chrome.extension.getURL(currScript);
  (document.head || document.documentElement).appendChild(scriptTag);
});
