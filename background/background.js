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

const BADGE_GRAY = '#c3c8bc';
const BADGE_GREEN = '#9cd67f';
let isEnabled = true;
chrome.action.setBadgeText({text: "ON"});
chrome.action.setBadgeBackgroundColor({ color: BADGE_GREEN });

chrome.action.onClicked.addListener(async function () {
  isEnabled = !isEnabled
  await chrome.action.setBadgeText({text: (isEnabled ? 'ON' : 'OFF')})
  isEnabled ?
    chrome.action.setBadgeBackgroundColor({ color: BADGE_GREEN }) :
    chrome.action.setBadgeBackgroundColor({ color: BADGE_GRAY });
  chrome.storage.sync.set({enabled: isEnabled})
});