chrome.runtime.onInstalled.addListener(function ({ reason }) {
  if (reason === 'update') {
    const notificationId = `JNS-${Date.now()}`;
    const url = 'https://defmethodinc.github.io/just-not-sorry/releases.html';
    const manifest = chrome.runtime.getManifest();
    chrome.notifications.create(notificationId, {
      requireInteraction: true,
      iconUrl: 'img/JustNotSorry-48.png',
      title: `JustNotSorry updated to v${manifest.version_name}`,
      message: "Click here to see what's new",
      buttons: [{ title: 'View Release Notes' }],
      type: 'basic',
    });
    const handleClick = function () {
      chrome.tabs.create({ url });
      chrome.notifications.clear(notificationId);
    };
    chrome.notifications.onClicked.addListener(handleClick);
    chrome.notifications.onButtonClicked.addListener(handleClick);
  }
});

chrome.action.onClicked.addListener(function () {
  chrome.runtime.openOptionsPage();
});
