import renderStoreInfo, { bindToggleButton } from "../components/store-info.js";
import renderThemeInfo from "../components/theme-info.js";
import renderBoostInfo from "../components/boost-info.js";
import initSavedReplies from "../components/save-replies.js";
import renderSearchBar, {
  bindEventsForSearchBar,
} from "../components/search-bar.js";
import initTools from "../components/tools.js";
import bindEventsForTabs from "../components/tabs.js";
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
            renderPopupData(response.popupData);
            console.log("RENDER DIRECTLY");
          } else {
            console.log("GET FROM LOCAL STORAGE");
            // If not shopify store, load from localStorage
            chrome.storage.local.get("popupData", (result) => {
              const cachedData = result.popupData;
              if (!cachedData) {
                // Should have fallback
                renderPopupData(response.popupData);
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
              renderPopupData(cachedData);
            });
          }
        }
      );
    }, 100);
  });
});

// Function to render the popup data
function renderPopupData(data) {
  const dashboardContent = document.querySelector(".dashboard-content");
  const headerStoreInfo = document.querySelector(".header-store-info");

  // Render header info - store data
  let storeInfoHtml = renderStoreInfo(data.storeData);
  headerStoreInfo.innerHTML = storeInfoHtml;

  // Render dashboard sections
  const renderSections = [renderSearchBar, renderThemeInfo, renderBoostInfo];
  let html = "";
  renderSections.forEach((fn) => {
    html += `
        <section class="dashboard-section">
          ${fn(data.storeData)}
        </section>
      `;
  });

  dashboardContent.innerHTML = html;

  //Bind events for tabs
  bindEventsForTabs();

  // Bind events for search bar
  bindEventsForSearchBar();

  //Bind events for toggle button
  bindToggleButton();

  // Bind event for highlight toggle button
  bindHighlightToggleButtonEvent();

  // Render Jira info
  const jiraDataTab = document.querySelector(".jira-content");
  const jiraKey = data.jiraKey;
  if (jiraKey) {
    document.querySelector("[data-tab=tab2]").classList.remove("hidden"); // Show the Jira tab if jiraKey exists
    const jiraLink = Utils.renderButtonLink(
      "",
      jiraKey,
      `https://oneapphub.atlassian.net/browse/${jiraKey}`,
      "jira-link"
    );
    jiraDataTab.innerHTML = `<div class="section-content jira-info">${jiraLink}</div>`;
    switchTab("tab2");
  } else {
    document.querySelector("[data-tab=tab2]").classList.add("hidden"); // Hide the Jira tab if jiraKey does not exist
  }
  console.log("Popup data rendered", data);
  if (data.isCached) {
    const isCachedNotice = `<span>Cached</span>`;
    const cachedNotice = document.querySelector(".cache-indicator");
    cachedNotice.innerHTML = isCachedNotice;
  }

  // Init Saved Replies feature
  initSavedReplies(data.storeData);

  // Init Tools feature
  initTools();

  // Bind copy to clipboard events
  Utils.bindEventsCopyToClipboard();
}

//Bind event toggle buttons
function bindHighlightToggleButtonEvent() {
  const toggleBtn = document.querySelector(".highlight-toggle-btn");

  toggleBtn.addEventListener("click", async function () {
    this.classList.toggle("active");
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: highlightElements,
    });
  });
}

function highlightElements() {
  const HIGHLIGHT_CLASS = "boost-highlight";
  const STYLE_ID = "boost-highlight-style";

  // Inject highlight style if not already present
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
        .${HIGHLIGHT_CLASS} {
          outline: 3px solid magenta !important;
          outline-offset: 2px !important;
          transition: outline 0.2s ease-in-out;
        }
      `;
    document.head.appendChild(style);
  }

  // Get all matching elements
  const matches = Array.from(
    document.querySelectorAll('[class*="boost-sd"], [class*="boost-pfs"]')
  ).filter(
    (el) =>
      el !== document.body &&
      Array.from(el.classList).some(
        (c) => c.startsWith("boost-sd") || c.startsWith("boost-pfs")
      )
  );

  // Determine toggle state
  const anyHighlighted = matches.some((el) =>
    el.classList.contains(HIGHLIGHT_CLASS)
  );

  // Apply or remove highlight class
  matches.forEach((el) => {
    if (anyHighlighted) {
      el.classList.remove(HIGHLIGHT_CLASS);
    } else {
      el.classList.add(HIGHLIGHT_CLASS);
    }
  });
}
