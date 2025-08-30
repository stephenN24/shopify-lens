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
                  renderPopupData(response.popupData);
                  return;
                }
                //Update the cached data fields
                cachedData.isCached = true;
                cachedData.isShopifyStore = false;
                cachedData.jiraKey = response?.popupData?.jiraKey || null;
                renderPopupData(cachedData);
              });
            }
          }
        );
      }, 100);
    });
  });
} catch (error) {
  console.warn(error);
}

// Function to render the popup data
function renderPopupData(data) {
  const dashboardContent = document.querySelector(".dashboard-content");
  const headerStoreInfo = document.querySelector(".header-store-info");
  let sectionTemplate = `<section class="dashboard-section">{{sectionContent}}</section>`;

  // Render header info - store data
  let storeInfoHtml = renderStoreInfo(data);
  headerStoreInfo.innerHTML = storeInfoHtml;

  // Render dashboard sections
  const renderSections = [renderThemeInfo, renderBoostInfo];
  let html = "";
  renderSections.forEach((fn) => {
    html += sectionTemplate.replace("{{sectionContent}}", fn(data));
  });

  dashboardContent.innerHTML = html;

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
  initSavedReplies(data);
}

function renderStoreInfo(data) {
  const tenantId = data.storeData.shop;
  const tenantIdHTML = renderCopyableField(tenantId, undefined, "tenant-id");
  const shopURLWithoutDomain = tenantId.replace(".myshopify.com", "");
  const dashboardLink = renderButtonLink(
    "",
    "Dashboard",
    `https://dashboard.bc-solutions.net/sync-hook-details/${tenantId}`,
    "system-dashboard"
  );

  const shopifyPartnersLink = renderButtonLink(
    "",
    "Shopify Partners",
    `https://partners.shopify.com/524425/stores?search_value=${tenantId}`,
    "shopify-partners"
  );

  const themesPageLink = renderButtonLink(
    "",
    "Themes Page",
    `https://admin.shopify.com/store/${shopURLWithoutDomain}/themes`,
    "themes-page"
  );

  return `<div class="header-info-content store-info">
  ${tenantIdHTML}
  ${dashboardLink}
  ${shopifyPartnersLink}
  ${themesPageLink}
  </div>`;
}

function renderThemeInfo({ storeData, windowLocation }) {
  const themeId = storeData.theme.id;
  const tenantId = storeData.shop;
  const shopURLWithoutDomain = tenantId.replace(".myshopify.com", "");
  const themeName = storeData.theme.name;
  const themeSchema = `${storeData.theme.schema_name}_v${storeData.theme.schema_version}`;
  const previewLink = buildPreviewLink(windowLocation, themeId);
  const themeCodeEditorLink = `https://admin.shopify.com/store/${shopURLWithoutDomain}/themes/${themeId}`;

  return `<div class="section-content theme-info">
  ${renderCopyableField(themeId, undefined, "theme-id")}
  ${renderCopyableField(themeName, undefined, "theme-name")}
  ${renderCopyableField(themeSchema, undefined, "theme-schema")}
  ${renderCopyableField("Preview Link", previewLink, "preview-link")}
  ${renderButtonLink(
    "",
    "Theme Code Editor",
    themeCodeEditorLink,
    "theme-code-editor"
  )}
  </div>`;
}

function renderBoostInfo(data) {
  const tenantId = data.storeData.shop;
  const themeId = data.storeData.theme.id;
  const templateId = data.appData.templateId;
  const shopURLWithoutDomain = tenantId.replace(".myshopify.com", "");
  const templateSettingsURL = `https://admin.shopify.com/store/${shopURLWithoutDomain}/apps/product-filter-search/shopify-integration/${themeId}`;
  const boostVersions = data.boostVersions.join(", ");
  const shopifyIntegrationLink = `https://admin.shopify.com/store/${shopURLWithoutDomain}/apps/product-filter-search/shopify-integration`;

  return `<div class="section-content boost-info">
  <div class="boost-versions">${boostVersions}</div>
  ${renderCopyableField(templateId)}
  ${renderButtonLink(
    "",
    "Template Setting",
    templateSettingsURL,
    "template-settings"
  )}
  ${renderButtonLink(
    "",
    "Shopify Integration",
    shopifyIntegrationLink,
    "shopify-integration"
  )}
  </div>`;
}

function renderButtonLink(icon, text, url, classModifier) {
  return `<a class="button-link ${classModifier}" href="${url}" target="_blank">
    ${text ? `<span class="text">${text}</span>` : ""}
    ${icon ? `<span class="icon">${icon}</span>` : ""}
  </a>`;
}

function renderCopyableField(title, value, classModifier = "") {
  const dataValue = value || title;
  return `<div class="data-field ${classModifier}">
    <span class="title" data-value="${dataValue}">${title}</span>
    <button class="copy-btn" data-value="${dataValue}" title="Copy">${svgLibrary.copyIcon}</button>
  </div>`;
}

//Utils
function buildPreviewLink(windowLocation, themeId) {
  const separator = windowLocation.search.length > 0 ? "&" : "?";
  return `${windowLocation.href}${separator}preview_theme_id=${themeId}`;
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
    text: "Working theme: {{themeName}}{{isLive}} - ID: {{themeId}}",
  },
  3: {
    name: "Template 3",
    text: "I have updated the template settings for {{themeName}} (ID: {{themeId}}).",
  },
  4: {
    name: "Template 4",
    text: "1/ Detailed description of the issue/request/idea\n\nWorking theme: {{themeName}}{{isLive}} - ID: {{themeId}}\nPreview link: {{previewLink}}\nAccess granted.",
  },
};

// Initialize the extension
async function initSavedReplies(data) {
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
  const windowLocation = data?.windowLocation || null; // need improvement
  const isLive = data?.storeData?.theme?.role == "main" ? " (LIVE)" : "";
  const themeId = data?.storeData?.theme?.id || "No theme ID";
  const previewLink =
    buildPreviewLink(windowLocation, themeId) || "No preview link available";
  const themeName = data?.storeData?.theme?.name || "No theme name";

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
      .replace(/\{\{isLive\}\}/g, isLive)
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
      .replace(/\{\{isLive\}\}/g, isLive)
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

  await loadTemplates(data);
  setupEventListeners();
  // Auto-select Template 1
  templateSelect.value = "1";
  selectTemplate();
}

// END SAVED REPLIES ------------
