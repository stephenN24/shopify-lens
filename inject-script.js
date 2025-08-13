(function () {
  const popupData = {
    isShopifyStore: Boolean(window.Shopify),
    storeData: window.Shopify || null,
    jiraKey: findJiraKey(),
    windowLocation: window.location || null,
    boostVersions: [],
    appData: {
      templateId:
        window.boostWidgetIntegration?.generalSettings?.templateId || "",
    },
  };

  // Find Jira key
  function findJiraKey() {
    const pageContent =
      document.body.innerText || document.body.textContent || "";
    const match = pageContent.match(/jira_issue_key to (BOOST|BC)-\d+/);
    return match ? match[0].replace("jira_issue_key to ", "") : null;
  }

  // Get boost version
  for (let key in window) {
    if (key.includes("bcsf") && !popupData.boostVersions.includes("V1")) {
      popupData.boostVersions.push("V1");
    }
    if (key.includes("BoostPFS") && !popupData.boostVersions.includes("V2")) {
      popupData.boostVersions.push("V2");
    }
    if (
      key.includes("boostSDAppConfig") &&
      key.includes("boostSD") &&
      !popupData.boostVersions.includes("V3")
    ) {
      popupData.boostVersions.push("V3");
    }
    if (
      key.includes("boostWidgetIntegration") &&
      !popupData.boostVersions.includes("Turbo")
    ) {
      popupData.boostVersions.push("Turbo");
    }
  }

  if (popupData.boostVersions.length == 0) {
    popupData.boostVersions.push("No Data");
  }

  // Send the data back to the content script
  window.postMessage(
    { type: "POPUP_DATA", popupData: JSON.parse(JSON.stringify(popupData)) },
    "*"
  );
})();
