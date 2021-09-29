var gaService = analytics.getService('JustNotSorryTest');

chrome.runtime.onInstalled.addListener(async function ({ reason }) {
  var tracker = gaService.getTracker('UA-3535278-4'); // prod
  var timing = tracker.startTiming('Analytics Performance', 'Send Event');
  tracker.sendAppView('JustNotSorryInstalled');
  timing.send();

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlContains: 'mail.google.com' },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlContains: 'inbox.google.com' },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlContains: 'outlook.live.com' },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ]);
  });

  if (reason === 'update') {
    const url = 'https://defmethodinc.github.io/just-not-sorry/upgraded';
    await chrome.tabs.create({ url });
  }
});

chrome.pageAction.onClicked.addListener(function () {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    // fallback to old way
    window.open(chrome.runtime.getURL('options.html'));
  }
});
