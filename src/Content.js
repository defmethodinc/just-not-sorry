var j = document.createElement('script');
j.src = chrome.extension.getURL('lib/jquery-2.1.4.min.js');
(document.head || document.documentElement).appendChild(j);

var k = document.createElement('script');
k.src = chrome.extension.getURL('lib/findAndReplaceDOMText.js');
(document.head || document.documentElement).appendChild(k);

var g = document.createElement('script');
g.src = chrome.extension.getURL('lib/gmail-0.4.js');
(document.head || document.documentElement).appendChild(g);

var t = document.createElement('script');
t.src = chrome.extension.getURL('src/WarningChecker.js');
(document.head || document.documentElement).appendChild(t);

var s = document.createElement('script');
s.src = chrome.extension.getURL('src/JustNotSorry.js');
(document.head || document.documentElement).appendChild(s);
