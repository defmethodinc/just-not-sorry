var scripts = [
  chrome.extension.getURL('js/gmail-0.4.js'),
  chrome.extension.getURL('js/content.js'),
];
head.load(chrome.extension.getURL('js/gmail-0.4.js'), function() {
  head.load(chrome.extension.getURL('js/content.js'));
});
