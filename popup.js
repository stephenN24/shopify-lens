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
  if (data.storeData == null) return;

  const storeData = data.storeData;
  const popupBody = document.getElementById("popup-content");
  if (data) {
    const bodyHTML = getPopupTemplate(storeData);
    popupBody.innerHTML = bodyHTML;
  } else {
    popupBody.textContent = "No Shopify object found.";
  }

  // Bind Events
  bindEvents();
}

function getPopupTemplate(data) {
  let templateHTML = "";
  templateHTML += buildInfoItemHTML("Shop", data.shop);
  templateHTML += buildInfoItemHTML("Theme ID", data.theme.id);
  templateHTML += buildInfoItemHTML("Theme Name", data.theme.name);
  templateHTML += buildInfoItemHTML("shop", data.shop);
  templateHTML += buildInfoItemHTML("shop", data.shop);
  templateHTML += buildInfoItemHTML("shop", data.shop);
  return templateHTML;
}

function buildInfoItemHTML(title = "N/A", value = "N/A") {
  return `<li class="popup-info-item">
          <span class="title">${title}</span>
          <input type="text" value="${value}" readonly>
          <button class="copy">${svgLibrary.copyIcon}</button>
        </li>
  `;
}

function bindEvents() {
  const copyBtns = document.querySelectorAll("button.copy");
  console.log(copyBtns);
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
