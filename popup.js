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
  const displayElement = document.getElementById("shopifyObject");
  if (data) {
    displayElement.textContent = JSON.stringify(data, null, 2);
  } else {
    displayElement.textContent = "No Shopify object found.";
  }
}
