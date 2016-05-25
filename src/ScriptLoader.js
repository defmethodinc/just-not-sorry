function load__() {
  var scriptsToLoad = [
    chrome.extension.getURL('lib/jquery-2.2.4.min.js'),
    chrome.extension.getURL('lib/dom-regexp-match-1.1.0.js'),
    chrome.extension.getURL('lib/gmail.js'),
    chrome.extension.getURL('lib/webcomponents.min.js'),
    chrome.extension.getURL('src/HighlightGenerator.js'),
    chrome.extension.getURL('src/WarningChecker.js'),
    chrome.extension.getURL('src/Warnings.js'),
    chrome.extension.getURL('src/JustNotSorry.js'),
  ];

  function loadScript(url) {
    var scriptElm = document.createElement('script');
    scriptElm.src = url;
    document.head.appendChild(scriptElm);
  }

  scriptsToLoad.forEach(loadScript);
  // head.load(scriptsToLoad);


  var polymerTemplates = [
    'templates/polymer/polymer.html',
    'templates/paper-card/paper-card.html',
    'templates/paper-button/paper-button.html',
    'templates/iron-icons/iron-icons.html',
    'templates/popup.html'
  ];

  (function next_(templates, i) {
    if (!polymerTemplates[i]) return;
    var link = document.createElement('link');
    link.rel = 'import';
    link.href = chrome.extension.getURL(polymerTemplates[i]);
    document.head.appendChild(link);
    setTimeout(next_.bind(this, templates, ++i), 10);
  }(polymerTemplates, 0));
}

setTimeout(load__, 5000);