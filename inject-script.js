(function () {
  const popupData = {
    storeData: window.Shopify || null,
    jiraKey: null,
    windowLocation: window.location || null,
    boostVersions: [],
  };

  // Find Jira key
  let pageContent = document.body.innerText || document.body.textContent;
  let match = pageContent.match(/jira_issue_key to BC-\d+/);
  if (match) {
    popupData.jiraKey = match[0].split("BC-")[1];
  }
  // Get boost version
  for (let key in window) {
    if (key.includes("bcsf")) {
      popupData.boostVersions.push("V1");
    }
    if (key.includes("BoostPFS")) {
      popupData.boostVersions.push("V2");
    }
    if (key.includes("boostSDAppConfig") && key.includes("boostSD")) {
      popupData.boostVersions.push("V3");
    }
    if (
      (key.includes("boostSD") && key.includes("boostSDData")) ||
      key.includes(
        "boostWidgetIntegration" && !popupData.boostVersions.includes("Turbo")
      )
    ) {
      popupData.boostVersions.push("Turbo");
    }
  }
  // Send the data back to the content script
  window.postMessage(
    { type: "POPUP_DATA", popupData: JSON.parse(JSON.stringify(popupData)) },
    "*"
  );
})();
