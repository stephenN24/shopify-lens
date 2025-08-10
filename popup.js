import svgLibrary from "./assets/svgs/svgLibrary.js";

try {
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
            setTimeout(function () {
              if (response?.popupData?.isShopifyStore) {
                // If it's a Shopify store, render the new popup data
                renderPopupData(response.popupData);
              } else {
                // If not shopify store, load from localStorage
                chrome.storage.local.get("popupData", (result) => {
                  const cachedData = result.popupData;
                  //Update the cached data fields
                  cachedData.isCached = true;
                  cachedData.isShopifyStore = false;
                  cachedData.jiraKey = response?.popupData?.jiraKey || null;
                  renderPopupData(cachedData);
                });
              }
            }, 700);
          }
        );
      }, 100);
    });
  });
} catch (error) {
  console.warn(error);
}

// Function to display popup data
function renderPopupData(data) {
  const shopifyDataTab = document.querySelector(".popup-content");
  if (data) {
    let bodyHTML = getShopifyDataTemplate(data);
    if (bodyHTML == "") {
      bodyHTML =
        '<div class="popup-empty"><img class="no-result-message" src="/assets/images/no-data-found.webp"/></div>';
    }

    shopifyDataTab.innerHTML = bodyHTML;
  } else {
    shopifyDataTab.textContent = "No Shopify object found.";
  }
  const jiraDataTab = document.querySelector(".jira-content");
  const jiraDataTabHTM = getJiraDataTemplate(data);
  jiraDataTab.innerHTML = jiraDataTabHTM;

  // Bind Events
  bindEvents();
}

function getShopifyDataTemplate(data) {
  const storeData = data.storeData;
  const shopURLWithoutDomain = storeData?.shop.replace(".myshopify.com", "");

  let html = "";

  if (storeData) {
    html += buildInfoItem("Shop", storeData.shop);
    html += buildInfoItem("Theme ID", storeData.theme.id);
    html += buildInfoItem("Theme Name", storeData.theme.name);
    html += buildInfoItem(
      "Theme Schema",
      storeData.theme.schema_name + "_v" + storeData.theme.schema_version
    );
    html += buildInfoItem("Preview Link", buildPreviewLink(data));
    html += buildInfoItem("Boost Version", data.boostVersions.join(", "));
    html += buildItemRedirectLink(
      "Collection All",
      buildLinkCollectionAll(data)
    );
    html += buildItemRedirectLink(
      "Theme Code Editor",
      `https://admin.shopify.com/store/${shopURLWithoutDomain}/themes/${storeData.theme.id}`
    );
    html += buildItemRedirectLink(
      "Dashboard",
      `https://dashboard.bc-solutions.net/sync-hook-details/${storeData.shop}`
    );
    html += buildItemRedirectLink(
      "Shopify Partners",
      `https://partners.shopify.com/524425/stores?search_value=${storeData.shop}`
    );
    html += buildItemRedirectLink(
      "Shopify Integration",
      `https://admin.shopify.com/store/${shopURLWithoutDomain}/apps/product-filter-search/shopify-integration`
    );
  }
  return html;
}
function getJiraDataTemplate(data) {
  const jiraKey = data.jiraKey;
  return jiraKey
    ? buildItemRedirectLink(
        "Jira Link",
        buildJiraLink(data.jiraKey),
        "BC-" + data.jiraKey
      )
    : "No Jira key found";
}

function buildInfoItem(title, value = "No data") {
  return `<li class="popup-info-item">
          <span class="title">${title}</span>
          <input type="text" value="${value}" readonly>
          <button class="copy">${svgLibrary.copyIcon}</button>
        </li>
  `;
}
function buildItemRedirectLink(title, url = "#", urlName = "Open Link") {
  return `<li class="popup-info-item">
          <span class="title">${title}</span>
          <a class="redirect-link" target="_blank" href="${url}">
            <div class="redirect-link-content">
              <div class="redirect-link-text">${urlName}</div>
              <div class="redirect-link-icon">${svgLibrary.hyperlinkIcon}</div>
            </div>
          </a>
        </li>
  `;
}

function buildPreviewLink(data) {
  const { windowLocation } = data;
  const themeId = data.storeData.theme.id;

  const separator = windowLocation.search.length > 0 ? "&" : "?";
  return `${windowLocation.href}${separator}preview_theme_id=${themeId}`;
}

function buildLinkCollectionAll(data) {
  const { windowLocation } = data;
  return `${windowLocation.origin}/collections/all`;
}

function buildJiraLink(jiraKey) {
  if (!jiraKey) return "";

  return `https://oneapphub.atlassian.net/browse/BC-${jiraKey}`;
}

function bindEvents() {
  const copyBtns = document.querySelectorAll("button.copy");
  copyBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      btn.closest("li").querySelector("input").select();
      document.execCommand("copy");
      btn.textContent = "Copied!";
      btn.style.backgroundImage =
        "linear-gradient(160deg, #0093e9 0%, #80d0c7 100%)";
      btn.style.color = "white";
    });
  });
}

//
const buttons = document.querySelectorAll(".sidebar button");
const tabs = document.querySelectorAll(".tab");

buttons.forEach((button, index) => {
  button.addEventListener("click", () => {
    // Remove active class from all buttons
    buttons.forEach((btn) => btn.classList.remove("active"));
    // Add active class to clicked button
    button.classList.add("active");

    // Hide all tabs
    tabs.forEach((tab) => tab.classList.remove("active"));
    // Show the tab corresponding to the button index
    tabs[index].classList.add("active");
  });
});
