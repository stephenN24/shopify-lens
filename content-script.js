// Inject the script into the page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "injectScript") {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("inject-script.js");
    script.onload = function () {
      this.remove(); // Clean up after injecting
    };
    (document.head || document.documentElement).appendChild(script);
  }
});

// Listen for messages from the injected script
window.addEventListener("message", (event) => {
  if (event.source === window && event.data.type === "POPUP_DATA") {
    // Forward the data to the background script
    chrome.runtime.sendMessage({
      action: "popupDataUpdated",
      data: event.data.popupData,
    });
  }
});
