let currentPopupData = null;

// Listen for data updates from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "popupDataUpdated") {
    currentPopupData = message.data;
  } else if (message.action === "getCurrentPopupData") {
    sendResponse({ popupData: currentPopupData });
  }

  if (
    currentPopupData &&
    currentPopupData.isShopifyStore &&
    currentPopupData.storeData
  ) {
    // If a shopify store, save data in storage
    chrome.storage.local.set({ popupData: currentPopupData });
  }
  // chrome.storage.local.get(null, (items) => console.log("Cached data", items));
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
