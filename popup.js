import svgLibrary from "./assets/svgs/svgLibrary.js";

// Request the current popup data
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const currentTab = tabs[0]; // The current active tab
  const tabId = currentTab.id; // The ID of the current tab
  chrome.tabs.sendMessage(tabId, { action: "injectScript" }, function () {
    setTimeout(function () {
      chrome.runtime.sendMessage(
        { action: "getCurrentPopupData" },
        (response) => {
          displayPopupData(response?.popupData);
        }
      );
    }, 100);
  });
});

// Function to display popup data
function displayPopupData(data) {
  const popupBody = document.getElementById("popup-content");
  if (data) {
    const bodyHTML = getPopupBodyTemplate(data);
    popupBody.innerHTML = bodyHTML;
  } else {
    popupBody.textContent = "No Shopify object found.";
  }

  // Bind Events
  bindEvents();
}

function getPopupBodyTemplate(data) {
  const storeData = data.storeData;
  const jiraKey = data.jiraKey;

  let html = "";
  if (storeData) {
    html += buildInfoItem("Shop", storeData.shop);
    html += buildInfoItem("Theme ID", storeData.theme.id);
    html += buildInfoItem("Theme Name", storeData.theme.name);
    html += buildInfoItem("Preview Link", buildPreviewLink(data));
  }
  if (jiraKey) {
    html += buildItemRedirectLink("Jira Link", buildJiraLink(data.jiraKey));
  }

  return html;
}

function buildInfoItem(title, value = "No data") {
  return `<li class="popup-info-item">
          <span class="title">${title}</span>
          <input type="text" value="${value}" readonly>
          <button class="copy">${svgLibrary.copyIcon}</button>
        </li>
  `;
}
function buildItemRedirectLink(title, value = "#") {
  return `<li class="popup-info-item">
          <span class="title">${title}</span>
          <a class="redirectLink" target="_blank" href="${value}">URL</a>
        </li>
  `;
}

function buildPreviewLink(data) {
  const { windowLocation } = data;
  const themeId = data.storeData.theme.id;

  const separator = windowLocation.search.length > 0 ? "&" : "?";
  return `${windowLocation.href}${separator}preview_theme_id=${themeId}`;
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
