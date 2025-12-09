import initTools from "../components/features/tools/tools.js";
import bindEventsForTabs from "../components/layout/sidebar.js";
import renderDashboardContent from "../components/layout/dashboard-content.js";
import * as Utils from "../utils/utils.js";
import { initTheme } from "../utils/theme.js";

const ACTIONS = {
  INJECT_SCRIPT: "injectScript",
  GET_POPUP_DATA: "getCurrentPopupData",
  POPUP_DATA_UPDATED: "popupDataUpdated",
};

const STORAGE_KEYS = {
  POPUP_DATA: "popupData",
};

async function initPopup() {
  try {
    const [currentTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!currentTab?.id) {
      throw new Error("No active tab found");
    }

    // Setup listener for data update
    const dataPromise = new Promise((resolve) => {
      const listener = (message) => {
        if (message.action === ACTIONS.POPUP_DATA_UPDATED) {
          chrome.runtime.onMessage.removeListener(listener);
          resolve(message.data);
        }
      };
      chrome.runtime.onMessage.addListener(listener);

      // Fallback/Timeout: Try to get data from background if it's already there or if injection is slow
      // Also check local storage
      setTimeout(async () => {
        chrome.runtime.onMessage.removeListener(listener);
        const bgResponse = await chrome.runtime.sendMessage({
          action: ACTIONS.GET_POPUP_DATA,
        });
        if (bgResponse?.popupData) {
          resolve(bgResponse.popupData);
        } else {
          // Fallback to get data from local storage
          const result = await chrome.storage.local.get(
            STORAGE_KEYS.POPUP_DATA
          );
          resolve(result.popupData || null);
        }
      }, 2000);
    });

    // Inject script
    await chrome.tabs.sendMessage(currentTab.id, {
      action: ACTIONS.INJECT_SCRIPT,
    });

    // Wait for data
    const popupData = await dataPromise;

    if (popupData) {
      handlePopupData(popupData);
    } else {
      console.log("No popup data received");
    }
  } catch (error) {
    // Fallback: Try to load data from local storage
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.POPUP_DATA);
      if (result.popupData) {
        const cachedData = result.popupData;
        cachedData.isCached = true;
        handlePopupData(cachedData);
      } else {
        console.log("No cached data available");
      }
    } catch (storageError) {
      console.log("Failed to load cached data:", storageError);
    }
  }
}

function handlePopupData(popupData) {
  if (popupData.isShopifyStore) {
    renderDashboardContent(popupData);
  } else {
    // Load from cache if not currently on a Shopify store (or if detection failed)
    chrome.storage.local.get(STORAGE_KEYS.POPUP_DATA, (result) => {
      const cachedData = result.popupData;
      if (cachedData) {
        cachedData.isCached = true;
        cachedData.isShopifyStore = false;
        // Update dynamic fields if available
        if (popupData) {
          cachedData.jiraKey = popupData.jiraKey || null;
          cachedData.storeData.resourceId =
            popupData.storeData?.resourceId || null;
          cachedData.storeData.resourceType =
            popupData.storeData?.resourceType || null;
        }
        renderDashboardContent(cachedData);
      } else {
        // If no cache and no current data, maybe show "Not a Shopify Store" message
        renderDashboardContent(popupData); // Render what we have
      }
    });
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initPopup();
  bindEventsForTabs();
  Utils.bindEventsCopyToClipboard();
  initTools();
});
