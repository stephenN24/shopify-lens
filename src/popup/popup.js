import initTools from "../components/tools.js";
import bindEventsForTabs from "../components/sidebar.js";
import renderPopupContent from "../components/popup-content.js";
import * as Utils from "../components/utils.js";

// Request the current popup data
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const currentTab = tabs[0]; // The current active tab
  const tabId = currentTab.id; // The ID of the current tab
  chrome.tabs.sendMessage(tabId, { action: "injectScript" }, function () {
    if (chrome.runtime.lastError) {
      console.log("Message failed:", chrome.runtime.lastError.message);
    }
    setTimeout(function () {
      chrome.runtime.sendMessage(
        { action: "getCurrentPopupData" },
        (response) => {
          console.log("Response from background:", response);
          if (response?.popupData?.isShopifyStore) {
            // If it's a Shopify store, render the new popup data
            renderPopupContent(response.popupData);
            console.log("RENDER DIRECTLY");
          } else {
            console.log("GET FROM LOCAL STORAGE");
            // If not shopify store, load from localStorage
            chrome.storage.local.get("popupData", (result) => {
              const cachedData = result.popupData;
              if (!cachedData) {
                // Should have fallback
                renderPopupContent(response.popupData);
                return;
              }
              //Update the cached data fields with latest dynamic values
              cachedData.isCached = true;
              cachedData.isShopifyStore = false;
              cachedData.jiraKey = response?.popupData?.jiraKey || null;
              cachedData.storeData.resourceId =
                response?.storeData?.resourceId || null;
              cachedData.storeData.resourceType =
                response?.storeData?.resourceType || null;
              renderPopupContent(cachedData);
            });
          }
        }
      );
    }, 100);
  });
});

//Bind event for sidebar tabs
bindEventsForTabs();

// Bind event for copy to clipboard button
Utils.bindEventsCopyToClipboard();

// Init Tools
initTools();
