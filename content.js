var j = document.createElement('script');
j.src = chrome.extension.getURL('jquery-2.1.4.min.js');
(document.head || document.documentElement).appendChild(j);

var k = document.createElement('script');
k.src = chrome.extension.getURL('findAndReplaceDOMText.js');
(document.head || document.documentElement).appendChild(k);

var g = document.createElement('script');
g.src = chrome.extension.getURL('gmail-0.4.js');
(document.head || document.documentElement).appendChild(g);

var s = document.createElement('script');
s.src = chrome.extension.getURL('just-not-sorry.js');
(document.head || document.documentElement).appendChild(s);
