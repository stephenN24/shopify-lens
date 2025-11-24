// Store popup data per tab
const popupDataMap = new Map();

const ACTIONS = {
  POPUP_DATA_UPDATED: "popupDataUpdated",
  GET_POPUP_DATA: "getCurrentPopupData",
  INJECT_SCRIPT: "injectScript",
};

const STORAGE_KEYS = {
  POPUP_DATA: "popupData",
};

// Listen for data updates from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id;

  if (message.action === ACTIONS.POPUP_DATA_UPDATED) {
    if (tabId) {
      popupDataMap.set(tabId, message.data);

      // Save to local storage for caching (last visited store)
      if (message.data.isShopifyStore) {
        chrome.storage.local.set({ [STORAGE_KEYS.POPUP_DATA]: message.data });
      }
    }
  } else if (message.action === ACTIONS.GET_POPUP_DATA) {
    // When popup asks for data, try to get it from the active tab's stored data
    // We need to know which tab the popup is looking at.
    // Usually popup is for the active tab.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTabId = tabs[0]?.id;
      const data = currentTabId ? popupDataMap.get(currentTabId) : null;
      sendResponse({ popupData: data });
    });
    return true; // Keep channel open for async response
  }

  return false;
});

// Inject script helper
function injectScript(tabId) {
  chrome.tabs.sendMessage(
    tabId,
    { action: ACTIONS.INJECT_SCRIPT },
    (response) => {
      if (chrome.runtime.lastError) {
        // Ignore errors that happen if the tab is not a web page (e.g. chrome:// URLs)
        // console.log("Message failed:", chrome.runtime.lastError.message);
      }
    }
  );
}

// Listen for tab switches and inject script
chrome.tabs.onActivated.addListener((activeInfo) => {
  injectScript(activeInfo.tabId);
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Inject script when page completes loading
  if (changeInfo.status === "complete") {
    injectScript(tabId);
  }

  // Clean up highlight toggle states
  chrome.storage.local.remove(`highlight:${tabId}`);
});

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  popupDataMap.delete(tabId);
  chrome.storage.local.remove(`highlight:${tabId}`);
});
