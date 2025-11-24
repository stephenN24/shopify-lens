(function () {
  const { shop, country, currency, locale, theme } = window.Shopify || {};
  const { rtyp, rid } = window?.__st || {};

  // Helper to safely get location data
  const getLocationData = () => {
    if (!window.location) return null;
    return {
      href: window.location.href,
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    };
  };

  const storeData = {
    tenantId: shop,
    shopURLWithoutDomain: shop ? shop.split(".myshopify.com")[0] : "",
    country,
    currency,
    locale,
    themeId: theme?.id,
    themeName: theme?.name,
    themeSchema: theme?.schema_name,
    themeSchemaVersion: theme?.schema_version,
    isLive: theme?.role === "main",
    windowLocation: getLocationData(),
    boostVersions: [],
    appData: {
      templateId: getTemplateId(),
    },
    resourceType: rtyp, //Current page type
    resourceId: rid, //Collection/product id
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
  if (typeof window.bcsf !== "undefined") storeData.boostVersions.push("V1");
  if (typeof window.BoostPFS !== "undefined")
    storeData.boostVersions.push("V2");
  if (
    typeof window.boostSDAppConfig !== "undefined" ||
    typeof window.boostSD !== "undefined"
  )
    storeData.boostVersions.push("V3");
  if (typeof window.boostWidgetIntegration !== "undefined")
    storeData.boostVersions.push("Turbo");

  if (popupData.storeData.boostVersions.length == 0) {
    popupData.storeData.boostVersions.push("No Data");
  }

  console.log("Popup Data:", popupData);

  // Send the data back to the content script
  window.postMessage({ type: "POPUP_DATA", popupData: popupData }, "*");
})();
