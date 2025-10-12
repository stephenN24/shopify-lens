import svgLibrary from "./assets/svgs/svgLibrary.js";

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
    const jiraLink = renderButtonLink(
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
}

function renderStoreInfo({
  tenantId,
  shopURLWithoutDomain,
  resourceId,
  resourceType,
}) {
  const tenantIdHTML = renderCopyableField(
    "",
    tenantId,
    undefined,
    "tenant-id"
  );
  const dashboardLink = renderButtonLink(
    svgLibrary.react,
    "",
    `https://dashboard.bc-solutions.net/sync-hook-details/${tenantId}`,
    "system-dashboard"
  );

  const shopifyPartnersLink = renderButtonLink(
    svgLibrary.shopifyPartner,
    "",
    `https://partners.shopify.com/524425/stores?search_value=${tenantId}`,
    "shopify-partners"
  );

  const themesPageLink = renderButtonLink(
    svgLibrary.shopifyTheme,
    "",
    `https://admin.shopify.com/store/${shopURLWithoutDomain}/themes`,
    "themes-page"
  );

  const currentPageResourceType =
    resourceType == "product" || resourceType == "collection"
      ? resourceType
      : "";

  const currentPageDataHTML =
    currentPageResourceType && resourceId
      ? renderCopyableField(
          currentPageResourceType + " ID",
          resourceId,
          undefined,
          "extra-page-data"
        )
      : "";

  return `<div class="header-info-content store-info">
  ${tenantIdHTML}
  <div class="links-wrapper">
  ${themesPageLink}
  ${dashboardLink}
  ${shopifyPartnersLink}
  </div>
  <div class="current-page-data">
    ${currentPageDataHTML}
  </div>
  ${
    currentPageDataHTML
      ? `<button
        class="arrow-button"
        id="toggleBtn"
        aria-label="Toggle additional info"
      >
        ${svgLibrary.arrowDown}
      </button>`
      : ""
  }
  </div>`;
}

function renderThemeInfo({
  themeId,
  themeName,
  isLive,
  themeSchema,
  themeSchemaVersion,
  shopURLWithoutDomain,
  windowLocation,
}) {
  const themeSchemaInfo = themeSchema
    ? `${themeSchema}${themeSchemaVersion ? `_v${themeSchemaVersion}` : ""}`
    : "No Data";
  const previewLink = buildPreviewLink(windowLocation, themeId);
  const themeEditorLink = buildThemeEditorLink(
    windowLocation,
    shopURLWithoutDomain,
    themeId
  );
  const themeCodeEditorLink = `https://admin.shopify.com/store/${shopURLWithoutDomain}/themes/${themeId}`;

  //Add live beacon
  return `<div class="section-content theme-info">
    <div class="beacon-wrapper">
      <div class="beacon ${
        isLive ? "live-theme-beacon" : "unpublished-theme-beacon"
      }"></div>
        <span>${isLive ? "Live" : "Draft"}</span>
    </div>
  ${renderCopyableField("", themeName, undefined, "theme-name")}
  ${renderCopyableField("", "Preview Link", previewLink, "preview-link")}
  <hr class="divider"/>
  <div class="theme-extra-info">
    ${renderCopyableField("ID", themeId, undefined, "theme-id")}
    ${renderCopyableField("Schema", themeSchemaInfo, undefined, "theme-schema")}
  </div>
  ${renderButtonLink(
    svgLibrary.themeEdit,
    "",
    themeCodeEditorLink,
    "theme-code-editor"
  )}
  ${renderButtonLink(
    svgLibrary.themeEditor,
    "",
    themeEditorLink,
    "theme-editor"
  )}
  </div>`;
}

function renderBoostInfo({
  themeId,
  shopURLWithoutDomain,
  boostVersions,
  appData,
}) {
  const templateId = appData.templateId;
  const templateSettingsURL = `https://admin.shopify.com/store/${shopURLWithoutDomain}/apps/product-filter-search/shopify-integration/${themeId}`;
  const boostVersionsInfo = boostVersions.join(", ");
  const shopifyIntegrationLink = `https://admin.shopify.com/store/${shopURLWithoutDomain}/apps/product-filter-search/shopify-integration`;

  return `<div class="section-content boost-info">
  <div class="boost-versions">${boostVersionsInfo}</div>
  ${renderCopyableField("", templateId, "", "template-id")}
  ${renderButtonLink(
    svgLibrary.templateSettings,
    "",
    templateSettingsURL,
    "template-settings"
  )}
  ${renderButtonLink(
    svgLibrary.shopifyIntegration,
    "",
    shopifyIntegrationLink,
    "shopify-integration"
  )}
  <div class="highlight-toggle-container">
    <button class="highlight-toggle-btn">
      <!-- Off State: Eye outline (black) -->
      <svg class="icon-off" viewBox="0 0 512.001 512.001" xmlns="http://www.w3.org/2000/svg">
        <g>
          <path fill="black" d="M256,192.012c-35.313,0-64.002,28.688-64.002,64s28.689,63.969,64.002,63.969s64-28.656,64-63.969 S291.313,192.012,256,192.012z"></path>
          <path fill="black" d="M505.381,236.512c-56.082-72.938-125.065-140.438-249.225-140.5h-0.016h-0.016c0-0.031-0.094-0.031-0.125,0 c0,0-0.078,0-0.109,0c-0.016,0-0.016,0-0.016,0h-0.016c-0.016,0-0.016,0-0.016,0C131.684,96.075,62.7,163.575,6.62,236.512 c-8.826,11.5-8.826,27.5,0,39c56.08,72.938,125.065,140.438,249.225,140.5c0,0,0,0,0.016,0h0.016c0,0,0,0,0.016,0h0.016 c0.016,0,0.094,0,0.094,0c0.016,0,0.031,0,0.064,0h0.029h0.016h0.016h0.016h0.016c0.109,0,0.219,0,0.344,0 c0.141-0.031,0.281-0.031,0.422,0c123.66-0.336,192.486-67.719,248.459-140.5C514.207,264.012,514.207,248.012,505.381,236.512z M256.094,352.012h-0.018h-0.012h-0.018h-0.031H256c-0.031,0-0.065,0-0.065,0h-0.014c0,0,0,0-0.016,0 c-52.879-0.063-95.908-43.125-95.908-96s43.029-95.938,95.908-96c0.029,0,0.078,0,0.141,0h0.047 c52.877,0.063,95.906,43.125,95.906,96S308.971,351.95,256.094,352.012z"></path>
        </g>
      </svg>
      <!-- On State: Eye (green) -->
      <svg class="icon-on" viewBox="0 0 512.001 512.001" xmlns="http://www.w3.org/2000/svg">
        <g>
          <path fill="#1cba59" d="M256,192.012c-35.313,0-64.002,28.688-64.002,64s28.689,63.969,64.002,63.969s64-28.656,64-63.969 S291.313,192.012,256,192.012z"></path>
          <path fill="#1cba59" d="M505.381,236.512c-56.082-72.938-125.065-140.438-249.225-140.5h-0.016h-0.016c0-0.031-0.094-0.031-0.125,0 c0,0-0.078,0-0.109,0c-0.016,0-0.016,0-0.016,0h-0.016c-0.016,0-0.016,0-0.016,0C131.684,96.075,62.7,163.575,6.62,236.512 c-8.826,11.5-8.826,27.5,0,39c56.08,72.938,125.065,140.438,249.225,140.5c0,0,0,0,0.016,0h0.016c0,0,0,0,0.016,0h0.016 c0.016,0,0.094,0,0.094,0c0.016,0,0.031,0,0.064,0h0.029h0.016h0.016h0.016h0.016c0.109,0,0.219,0,0.344,0 c0.141-0.031,0.281-0.031,0.422,0c123.66-0.336,192.486-67.719,248.459-140.5C514.207,264.012,514.207,248.012,505.381,236.512z M256.094,352.012h-0.018h-0.012h-0.018h-0.031H256c-0.031,0-0.065,0-0.065,0h-0.014c0,0,0,0-0.016,0 c-52.879-0.063-95.908-43.125-95.908-96s43.029-95.938,95.908-96c0.029,0,0.078,0,0.141,0h0.047 c52.877,0.063,95.906,43.125,95.906,96S308.971,351.95,256.094,352.012z"></path>
        </g>
      </svg>
    </button>
    <span class="toggle-label">Highlight</span>
  </div>
  `;
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

function renderButtonLink(icon, text, url, classModifier) {
  return `<a class="button-link styled-btn ${classModifier}" href="${url}" target="_blank">
    ${text ? `<span class="text">${text}</span>` : ""}
    ${icon ? `<div class="icon">${icon}</div>` : ""}
  </a>`;
}

function renderCopyableField(fieldName, title, value, classModifier = "") {
  if (!title && !value) return "";
  const dataValue = value || title;
  return `<div class="data-field ${classModifier}">
    <div class="title" data-value="${dataValue}">${
    fieldName ? `<div class="field-name">• ${fieldName} | </div>` : ""
  }<span class="title-text">${title}</span></div>
    <button class="copy-btn" data-value="${dataValue}" title="Copy">${
    svgLibrary.copyIcon
  }</button>
  </div>`;
}

//Utils
function buildPreviewLink(windowLocation, themeId) {
  if (!windowLocation || !themeId) return "No preview link available";
  const separator = windowLocation.search.length > 0 ? "&" : "?";
  return `${windowLocation.href}${separator}preview_theme_id=${themeId}`;
}

function buildThemeEditorLink(windowLocation, shopURLWithoutDomain, themeId) {
  if (!windowLocation || !themeId) return "No edior link available";
  return `https://admin.shopify.com/store/${shopURLWithoutDomain}/themes/${themeId}/editor?previewPath=${encodeURIComponent(
    windowLocation.pathname.replace(/^\/[a-z]{2}(?=\/)/i, "") // Strip locale
  )}`; // Strip locale
}

// Event delegation for copy buttons
document.addEventListener("click", function (e) {
  const dataField = e.target.closest(".data-field");
  if (dataField) {
    const value =
      dataField.getAttribute("data-value") ||
      dataField.querySelector(".title")?.getAttribute("data-value");
    if (value) {
      navigator.clipboard.writeText(value);
      const svg = dataField.querySelector(".copy-btn svg");
      if (svg) {
        svg.classList.add("clicked"); // Add clicked class to animate
        setTimeout(() => svg.classList.remove("clicked"), 300);
      }
    }
  }
});

// Handle tab switching
const buttons = document.querySelectorAll(".sidebar button");
const tabs = document.querySelectorAll(".tab");

function switchTab(tabId) {
  // Remove active classes
  buttons.forEach((btn) => btn.classList.remove("active"));
  tabs.forEach((tab) => tab.classList.remove("active"));

  // Activate the correct button
  const activeButton = document.querySelector(
    `.sidebar button[data-tab="${tabId}"]`
  );
  if (activeButton) {
    activeButton.classList.add("active");
  }

  // Activate the correct tab
  const activeTab = document.getElementById(tabId);
  if (activeTab) {
    activeTab.classList.add("active");
  }
}

// Event listener for tab buttons
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    switchTab(button.dataset.tab);
  });
});

// Use tab key to switch tabs
document.addEventListener("keydown", function (e) {
  if (e.key === "Tab") {
    e.preventDefault();
    const visibleButtons = Array.from(buttons).filter(
      (btn) => !btn.classList.contains("hidden")
    );
    const activeIndex = visibleButtons.findIndex((btn) =>
      btn.classList.contains("active")
    );
    let nextIndex = (activeIndex + 1) % visibleButtons.length;
    switchTab(visibleButtons[nextIndex].dataset.tab);
    visibleButtons[nextIndex].focus();
  }
});

// Tools - Refine API Request
const openRefinedUrl = document.querySelector("#open-url-btn");
const apiRequestInput = document.querySelector("#apiRequest");

openRefinedUrl.addEventListener("click", handleOpenRefinedUrl);
apiRequestInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    handleOpenRefinedUrl();
  }
});

function handleOpenRefinedUrl() {
  const originalApiRequest = apiRequestInput.value;
  const url = refineAPIRequest(originalApiRequest);
  const errorMsg = document.querySelector(".url-refactor .error-message");
  if (url) {
    window.open(url, "_blank");
    errorMsg.style.display = "none";
  } else {
    errorMsg.textContent = "Invalid URL";
    errorMsg.style.display = "inline";
  }
}

function refineAPIRequest(url) {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.delete("widgetId");
    return urlObj.toString();
  } catch (e) {
    console.warn("Invalid URL:", url);
    return null;
  }
}

// Tools - Helpdoc Finder
const helpdocSearchInput = document.getElementById("helpdocSearch");

function handleHelpdocSearch() {
  const keyword = helpdocSearchInput.value.trim();
  const errorMsg = document.querySelector(".helpdoc-finder .error-message");
  if (keyword) {
    const url = `https://support.boostcommerce.net/en/?q=${encodeURIComponent(
      keyword
    )}`;
    window.open(url, "_blank");
    errorMsg.style.display = "none";
  } else {
    errorMsg.textContent = "Please enter a keyword";
    errorMsg.style.display = "inline";
  }
}

document
  .getElementById("search-helpdoc-btn")
  .addEventListener("click", handleHelpdocSearch);

helpdocSearchInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    handleHelpdocSearch();
  }
});

// SAVED REPLIES ------------
// Fixed date values
const dateValues = {
  day: 11,
  month: 12,
  year: 2025,
};

// Default templates
const defaultTemplates = {
  1: {
    name: "Template 1",
    text: "Could you please check it again? Here is the preview link: {{previewLink}}\n\nThank you!",
  },
  2: {
    name: "Template 2",
    text: "Working theme: {{themeName}}{{isLiveTheme}} - ID: {{themeId}}",
  },
  3: {
    name: "Template 3",
    text: "I have updated the template settings for {{themeName}} (ID: {{themeId}}).",
  },
  4: {
    name: "Template 4",
    text: "1/ Detailed description of the issue/request/idea\n\nWorking theme: {{themeName}}{{isLiveTheme}} - ID: {{themeId}}\nPreview link: {{previewLink}}\nAccess granted.",
  },
};

// Initialize the extension
async function initSavedReplies({
  themeId,
  themeName,
  windowLocation,
  isLive,
}) {
  let templates = {};
  let currentTemplateId = null;

  // DOM elements
  const templateSelect = document.getElementById("templateSelect");
  const templateEditor = document.getElementById("templateEditor");
  const templateName = document.getElementById("templateName");
  const templateText = document.getElementById("templateText");
  const preview = document.getElementById("preview");
  const editSection = document.getElementById("editSection");
  const editBtn = document.getElementById("editBtn");
  const saveBtn = document.getElementById("saveBtn");
  const copyBtn = document.getElementById("copyBtn");
  const notification = document.getElementById("notification");

  // Variables - need improvement
  const isLiveTheme = isLive ? " [Live]" : "";
  const previewLink =
    buildPreviewLink(windowLocation, themeId) || "No preview link available";

  // Load templates from Chrome storage
  async function loadTemplates() {
    try {
      const result = await chrome.storage.sync.get("templates");

      if (result.templates && Object.keys(result.templates).length > 0) {
        templates = result.templates;
      } else {
        // First time setup - use default templates
        templates = { ...defaultTemplates };
        await saveTemplatesToStorage();
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      templates = { ...defaultTemplates };
      showNotification("Error loading templates, using defaults", "error");
    }
  }

  // Save templates to Chrome storage
  async function saveTemplatesToStorage() {
    try {
      await chrome.storage.sync.set({ templates: templates });
    } catch (error) {
      console.error("Error saving templates:", error);
      showNotification("Error saving templates", "error");
    }
  }

  // Setup event listeners
  function setupEventListeners() {
    templateSelect.addEventListener("change", selectTemplate);
    templateText.addEventListener("input", updatePreview);
    editBtn.addEventListener("click", toggleEditMode);
    saveBtn.addEventListener("click", saveTemplate);
    copyBtn.addEventListener("click", copyToClipboard);
  }

  // Select template from dropdown
  function selectTemplate() {
    currentTemplateId = templateSelect.value;

    if (currentTemplateId) {
      const template = templates[currentTemplateId];
      if (template) {
        templateEditor.classList.add("active");
        templateName.textContent = template.name;
        templateText.value = template.text;

        // Reset to view mode when selecting a new template
        exitEditMode();
        updatePreview();
      }
    } else {
      templateEditor.classList.remove("active");
      currentTemplateId = null;
      exitEditMode();
    }
  }

  // Update preview with rendered template
  function updatePreview() {
    let text = templateText.value;
    if (editSection.style.display !== "none") {
      text = templateText.value;
    } else if (currentTemplateId && templates[currentTemplateId]) {
      text = templates[currentTemplateId].text;
    } else {
      text = "";
    }

    if (!text.trim()) {
      preview.textContent = "Enter some text to see the preview";
      return;
    }

    const rendered = text
      .replace(/\{\{themeName\}\}/g, themeName)
      .replace(/\{\{themeId\}\}/g, themeId)
      .replace(/\{\{isLiveTheme\}\}/g, isLiveTheme)
      .replace(/\{\{previewLink\}\}/g, previewLink);

    // Convert line breaks to HTML breaks for display
    const htmlRendered = rendered.replace(/\n/g, "<br>");
    preview.innerHTML = htmlRendered;
  }

  // Save template changes
  async function saveTemplate() {
    if (!currentTemplateId) {
      showNotification("Please select a template first", "info");
      return;
    }

    const text = templateText.value.trim();

    if (!text) {
      showNotification("Template cannot be empty", "error");
      return;
    }

    try {
      templates[currentTemplateId].text = text;
      await saveTemplatesToStorage();
      showNotification("Template saved successfully!", "success");
      exitEditMode();
      updatePreview();
    } catch (error) {
      console.error("Error saving template:", error);
      showNotification("Error saving template", "error");
    }
  }

  // Copy rendered text to clipboard
  async function copyToClipboard() {
    if (!currentTemplateId) {
      showNotification("Please select a template first", "info");
      return;
    }

    // Get the original text with line breaks preserved
    let text;
    if (editSection.style.display !== "none") {
      text = templateText.value;
    } else {
      text = templates[currentTemplateId].text;
    }

    if (!text.trim()) {
      showNotification("Nothing to copy", "info");
      return;
    }

    const textToCopy = text
      .replace(/\{\{themeName\}\}/g, themeName)
      .replace(/\{\{themeId\}\}/g, themeId)
      .replace(/\{\{isLiveTheme\}\}/g, isLiveTheme)
      .replace(/\{\{previewLink\}\}/g, previewLink);

    try {
      await navigator.clipboard.writeText(textToCopy);
      showNotification("Copied to clipboard!", "success");
    } catch (error) {
      console.error("Error copying to clipboard:", error);

      // Fallback for older browsers
      try {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        showNotification("Copied to clipboard!", "success");
      } catch (fallbackError) {
        showNotification("Failed to copy to clipboard", "error");
      }
    }
  }

  // Toggle edit mode
  function toggleEditMode() {
    if (!currentTemplateId) {
      showNotification("Please select a template first", "info");
      return;
    }

    const isEditing = editSection.style.display !== "none";

    if (isEditing) {
      exitEditMode();
    } else {
      enterEditMode();
    }
  }

  // Enter edit mode
  function enterEditMode() {
    editSection.style.display = "block";
    editBtn.textContent = "Cancel Edit";
    editBtn.style.background = "linear-gradient(135deg, #e74c3c, #c0392b)";
    saveBtn.style.display = "inline-block";
    templateText.focus();
  }

  // Exit edit mode
  function exitEditMode() {
    editSection.style.display = "none";
    editBtn.textContent = "Edit Template";
    editBtn.style.background = "linear-gradient(135deg, #f39c12, #e67e22)";
    saveBtn.style.display = "none";
  }

  // Show notification
  function showNotification(message, type = "info") {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add("show");

    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  }

  await loadTemplates();
  setupEventListeners();
  // Auto-select Template 1
  templateSelect.value = "1";
  selectTemplate();
}

// END SAVED REPLIES ------------

// START SEACRH BAR ------------

// Render search bar HTML
function renderSearchBar({ shopURLWithoutDomain }) {
  return `
    <div class="search-container">
      <div class="search-wrapper">
        ${renderFilterDropdown(shopURLWithoutDomain)}
          <input 
            type="text"   
            class="search-input" 
            id="searchInput"
            placeholder="Search for products..."
            autocomplete="off"
          >
        <a href="https://admin.shopify.com/store/${shopURLWithoutDomain}/products" class="styled-btn small search-button" id="searchButton">Go</a>
      </div>
    </div>
  `;
}

function renderFilterDropdown(shopURLWithoutDomain) {
  const options = [
    {
      searchType: "product",
      href: `https://admin.shopify.com/store/${shopURLWithoutDomain}/products`,
      placeholder: "Search product...",
      label: "Product",
      active: true,
      icon: `
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      `,
    },
    {
      searchType: "collection",
      href: `https://admin.shopify.com/store/${shopURLWithoutDomain}/collections`,
      placeholder: "Search collection...",
      label: "Collection",
      icon: `
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
      `,
    },
    {
      searchType: "theme",
      href: `https://admin.shopify.com/store/${shopURLWithoutDomain}/themes/`,
      placeholder: "Go to theme...",
      label: "Theme",
      icon: `
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
      `,
    },
  ];

  return `
    <div class="filter-dropdown" id="filterDropdown">
      ${renderFilterButton()}
      <div class="dropdown-menu" id="dropdownMenu">
        ${options.map(renderDropdownOption).join("")}
      </div>
    </div>
  `;
}

function renderFilterButton() {
  return `
    <button class="filter-button" id="filterButton">
      <div>
        <svg class="filter-icon" viewBox="0 0 24 24">
          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
        </svg>
        <span id="filterText">Product</span>
      </div>
      <svg class="chevron" viewBox="0 0 24 24">
        <polyline points="6,9 12,15 18,9"/>
      </svg>
    </button>
  `;
}

function renderDropdownOption({
  searchType,
  href,
  placeholder,
  label,
  active,
  icon,
}) {
  return `
    <div 
      class="dropdown-option ${active ? "active" : ""}" 
      data-searchType="${searchType}" 
      data-href="${href}" 
      data-placeholder="${placeholder}">
      <svg class="filter-icon" viewBox="0 0 24 24">${icon}</svg>
      ${label}
    </div>
  `;
}

// Bind events for search bar
function bindEventsForSearchBar() {
  const filterDropdown = document.getElementById("filterDropdown");
  const filterButton = document.getElementById("filterButton");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const filterText = document.getElementById("filterText");
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const dropdownOptions = document.querySelectorAll(".dropdown-option");

  // Toggle dropdown
  filterButton.addEventListener("click", (e) => {
    e.stopPropagation();
    filterDropdown.classList.toggle("open");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!filterDropdown.contains(e.target)) {
      filterDropdown.classList.remove("open");
    }
  });

  // Handle option selection
  dropdownOptions.forEach((option) => {
    option.addEventListener("click", () => {
      // Remove active class from all options
      dropdownOptions.forEach((opt) => opt.classList.remove("active"));

      // Add active class to selected option
      option.classList.add("active");

      // Update filter text
      const value = option.dataset.searchtype;
      searchInput.dataset.searchtype = value;
      filterText.textContent = value.charAt(0).toUpperCase() + value.slice(1);

      // Update input placeholder
      searchInput.placeholder = option.dataset.placeholder;

      // Update button href
      searchButton.href = option.dataset.href;

      // Close dropdown
      filterDropdown.classList.remove("open");

      // Add a subtle animation effect
      searchInput.style.transform = "scale(1.02)";
      setTimeout(() => {
        searchInput.style.transform = "scale(1)";
      }, 150);
    });
  });

  // Handle search input
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      performSearch();
    }
  });

  // Add search functionality to the Go button
  searchButton.addEventListener("click", (e) => {
    e.preventDefault();
    performSearch();
  });

  // Add floating label effect
  searchInput.addEventListener("focus", () => {
    searchInput.parentElement.style.transform = "scale(1.02)";
  });

  searchInput.addEventListener("blur", () => {
    searchInput.parentElement.style.transform = "scale(1)";
  });

  // Prevent dropdown from closing when clicking inside
  dropdownMenu.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  function performSearch() {
    const searchQuery = encodeURIComponent(searchInput.value);
    const currentHref = searchButton.href;
    const searchType = searchInput.dataset.searchtype;
    let searchURL = `${currentHref}?query=${searchQuery}`;
    if (searchType === "theme") {
      searchURL = `${currentHref}${searchQuery}`;
    }
    window.open(searchURL, "_blank");
  }
}

// END SEARCH BAR ------------

// Bind toggle button event
function bindToggleButton() {
  const card = document.querySelector(".header-info-content");
  const toggleBtn = document.getElementById("toggleBtn");
  if (!toggleBtn) return;
  toggleBtn.addEventListener("click", () => {
    card.classList.toggle("expanded");
  });
}

// Add smooth interactions for sidebar
const sidebar = document.querySelector(".sidebar");
const sidebarButtons = sidebar.querySelectorAll(".tab-btn:not(.hidden)");

sidebarButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    // Add ripple effect
    createRipple(button, event);
  });
});

// Enhanced ripple effect function
function createRipple(button, event) {
  const ripple = document.createElement("span");
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                pointer-events: none;
                transform: scale(0);
                animation: rippleEffect 0.6s ease-out;
                z-index: 100;
            `;

  button.style.position = "relative";
  button.style.overflow = "hidden";
  button.appendChild(ripple);
}
