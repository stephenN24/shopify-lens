let currentPopupData = null;

// Listen for data updates from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "popupDataUpdated") {
    currentPopupData = message.data;
  } else if (message.action === "getCurrentPopupData") {
    sendResponse({ popupData: currentPopupData });
  }

  if (currentPopupData && currentPopupData.isShopifyStore) {
    // If a shopify store, save data in storage
    chrome.storage.local.set({ popupData: currentPopupData });
  }
  return true;
});

// Listen for tab switches and updates
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.sendMessage(
    activeInfo.tabId,
    { action: "injectScript" },
    (response) => {
      if (chrome.runtime.lastError) {
        console.log("Message failed:", chrome.runtime.lastError.message);
      }
    }
  );
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    chrome.tabs.sendMessage(tabId, { action: "injectScript" }, (response) => {
      if (chrome.runtime.lastError) {
        console.log("Message failed:", chrome.runtime.lastError.message);
      }
    });
  }
});

// Clean up highlight toggle states when tabs are closed/ updated
function keyFor(tabId) {
  return `highlight:${tabId}`;
}

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  await chrome.storage.local.remove(keyFor(tabId));
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  await chrome.storage.local.remove(keyFor(tabId));
});
