import svgLibrary from "../assets/svgs/svgLibrary.js";
import * as Utils from "./utils.js";
import renderQuickAppMenu from "./quick-app-menu.js";

export default function renderBoostInfo({
  themeId,
  shopURLWithoutDomain,
  boostVersions,
  appData,
}) {
  const { templateId } = appData;
  const boostVersionsInfo = boostVersions.join(" | ");
  const templateSettingsURL = `https://admin.shopify.com/store/${shopURLWithoutDomain}/apps/product-filter-search/shopify-integration/${themeId}`;
  const templateCodeEditorURL = `https://admin.shopify.com/store/${shopURLWithoutDomain}/apps/product-filter-search/shopify-integration//code-editor/${templateId}`;
  // const shopifyIntegrationLink = `https://admin.shopify.com/store/${shopURLWithoutDomain}/apps/product-filter-search/shopify-integration`;

  return `<div class="section-content boost-info">
  <div class="boost-versions">${boostVersionsInfo}</div>
  <div class="boost-details">
   ${
     boostVersions.includes("Turbo")
       ? `<div class="template-info">
    ${Utils.renderCopyableField("", templateId, "", "template-id")}
    ${Utils.renderButtonLink(
      svgLibrary.codeEditor,
      "",
      templateCodeEditorURL,
      "template-code-editor"
    )}
    ${Utils.renderButtonLink(
      svgLibrary.editor,
      "",
      templateSettingsURL,
      "template-settings"
    )}
  </div>`
       : ""
   }
   ${renderQuickAppMenu(shopURLWithoutDomain)}
    </div>
   ${renderHighlightToggle()}
  </div>
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

// ${Utils.renderButtonLink(
//   svgLibrary.shopifyIntegration,
//   "",
//   shopifyIntegrationLink,
//   "shopify-integration"
// )}

// App menu items configuration
