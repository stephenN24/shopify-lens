import svgLibrary from "../assets/svgs/svgLibrary.js";
import * as Utils from "./utils.js";
import DynamicLinkDropdown from "./dynamic-link.js";

export default function renderBoostInfo({
  themeId,
  shopURLWithoutDomain,
  boostVersions,
  appData,
}) {
  const { templateId } = appData;
  const boostVersionsInfo = boostVersions.join(" | ");
  const templateSettingsURL = `https://admin.shopify.com/store/${shopURLWithoutDomain}/apps/product-filter-search/shopify-integration/${themeId}`;
  const shopifyIntegrationLink = `https://admin.shopify.com/store/${shopURLWithoutDomain}/apps/product-filter-search/shopify-integration`;

  return `<div class="section-content boost-info">
  <div class="boost-versions">${boostVersionsInfo}</div>
  <div id="dynamic-link-container"></div>
  ${Utils.renderCopyableField("", templateId, "", "template-id")}
  ${
    boostVersions.includes("Turbo")
      ? Utils.renderButtonLink(
          svgLibrary.templateSettings,
          "",
          templateSettingsURL,
          "template-settings"
        )
      : ""
  }
  ${Utils.renderButtonLink(
    svgLibrary.shopifyIntegration,
    "",
    shopifyIntegrationLink,
    "shopify-integration"
  )}
   ${renderHighlightToggle()}
  `;
}

function renderHighlightToggle() {
  return `
    <div class="highlight-toggle-container">
      <button 
        class="highlight-toggle-btn" 
      >
        ${svgLibrary.eyeOff}
        ${svgLibrary.eyeOn}
      </button>
    </div>
  `;
}

export function renderDynamicLinkDropdown() {
  const menuData = {
    Search: {
      "Engine Control": "/apps/product-filter-search/engine-control",
      "Standard Search": "/apps/product-filter-search/standard-search",
      "AI Search": "/apps/product-filter-search/ai-search",
    },
    Filters: {
      "Filter Layout": "/apps/product-filter-search/filter-layout",
      "Display Settings": "/apps/product-filter-search/display-settings",
    },
  };

  const dropdown = new DynamicLinkDropdown("dynamic-link-container", {
    menuData: menuData,
    onSelect: (selection) => {
      console.log("Selected:", selection);
    },
  });
}
