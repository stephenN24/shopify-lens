(function () {
  const { shop, country, currency, locale, theme } = window.Shopify || {};

  const storeData = {
    tenantId: shop,
    shopURLwithoutDomain: shop ? shop.split(".myshopify.com")[0] : "",
    country,
    currency,
    locale,
    themeId: theme?.id,
    themeName: theme?.name,
    themeSchema: theme?.schema_name,
    themeSchemaVersion: theme?.schema_version,
    isLive: theme?.role === "main" ? true : false,
    windowLocation: window.location || null,
    boostVersions: [],
    appData: {
      templateId: getTemplateId(),
    },
  };

  const popupData = {
    isShopifyStore: Boolean(window?.Shopify?.shop),
    storeData,
    jiraKey: findJiraKey(),
  };

  // Find Jira key
  function findJiraKey() {
    const pageContent =
      document.body.innerText || document.body.textContent || "";
    const match = pageContent.match(/jira_issue_key to (BOOST|BC)-\d+/);
    return match ? match[0].replace("jira_issue_key to ", "") : null;
  }

  // Get template ID from global settings
  function getTemplateId() {
    return window?.boostWidgetIntegration?.generalSettings?.templateId ?? "";
  }

  // Get boost version
  for (let key in window) {
    if (
      key.includes("bcsf") &&
      !popupData.storeData.boostVersions.includes("V1")
    ) {
      popupData.storeData.boostVersions.push("V1");
    }
    if (
      key.includes("BoostPFS") &&
      !popupData.storeData.boostVersions.includes("V2")
    ) {
      popupData.storeData.boostVersions.push("V2");
    }
    if (
      key.includes("boostSDAppConfig") &&
      key.includes("boostSD") &&
      !popupData.storeData.boostVersions.includes("V3")
    ) {
      popupData.storeData.boostVersions.push("V3");
    }
    if (
      key.includes("boostWidgetIntegration") &&
      !popupData.storeData.boostVersions.includes("Turbo")
    ) {
      popupData.storeData.boostVersions.push("Turbo");
    }
  }

  if (popupData.storeData.boostVersions.length == 0) {
    popupData.storeData.boostVersions.push("No Data");
  }

  console.log("Popup Data:", popupData);
  // Send the data back to the content script

  window.postMessage(
    { type: "POPUP_DATA", popupData: JSON.parse(JSON.stringify(popupData)) },
    "*"
  );
})();
