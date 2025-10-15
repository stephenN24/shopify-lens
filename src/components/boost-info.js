import svgLibrary from "../assets/svgs/svgLibrary.js";
import * as Utils from "./utils.js";

export default function renderBoostInfo({
  themeId,
  shopURLWithoutDomain,
  boostVersions,
  appData,
}) {
  const templateId = appData.templateId;
  const templateSettingsURL = `https://admin.shopify.com/store/${shopURLWithoutDomain}/apps/product-filter-search/shopify-integration/${themeId}`;
  const boostVersionsInfo = boostVersions.join(", ");
  const shopifyIntegrationLink = `https://admin.shopify.com/store/${shopURLWithoutDomain}/apps/product-filter-search/shopify-integration`;

  return `<div class="section-content boost-info">
  <div class="boost-versions">${boostVersionsInfo}</div>
  ${Utils.renderCopyableField("", templateId, "", "template-id")}
  ${Utils.renderButtonLink(
    svgLibrary.templateSettings,
    "",
    templateSettingsURL,
    "template-settings"
  )}
  ${Utils.renderButtonLink(
    svgLibrary.shopifyIntegration,
    "",
    shopifyIntegrationLink,
    "shopify-integration"
  )}
  <div class="highlight-toggle-container">
    <button class="highlight-toggle-btn">
      ${svgLibrary.offStateEyeIcon}
      ${svgLibrary.onStateEyeIcon}
    </button>
  </div>
  `;
}
