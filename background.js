let currentPopupData = null;

// Listen for data updates from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "popupDataUpdated") {
    currentPopupData = message.data;
  } else if (message.action === "getCurrentPopupData") {
    sendResponse({ popupData: currentPopupData });
  }
  return true;
});

// Listen for tab switches and updates
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.sendMessage(activeInfo.tabId, { action: "injectScript" });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    chrome.tabs.sendMessage(tabId, { action: "injectScript" });
  }
});
