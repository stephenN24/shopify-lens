import svgLibrary from "../../../assets/svgs/svgLibrary.js";
import * as Utils from "../../../utils/utils.js";
import renderQuickAppMenu from "./card-features/menu/quick-app-menu.js";

export default function renderBoostInfo({
  themeId,
  shopURLWithoutDomain,
  boostVersions,
  appData,
}) {
  const { templateId } = appData;
  const boostVersionsInfo = boostVersions.join(" | ");
  const templateSettingsURL = `https://admin.shopify.com/store/${shopURLWithoutDomain}/apps/product-filter-search/shopify-integration/${themeId}`;
  const templateCodeEditorURL = `https://admin.shopify.com/store/${shopURLWithoutDomain}/apps/product-filter-search/shopify-integration/code-editor/${templateId}`;

  return `<div class="section-content boost-info ${
    boostVersions.includes("No Data") ? "not-integrated" : ""
  }">
  <div class="boost-versions"><div class="icon">${svgLibrary.appVersion}</div>
  <div class="version-info">${boostVersionsInfo}</div>
  </div>
  <div class="boost-details">
   ${
     boostVersions.includes("Turbo")
       ? `<div class="template-info">
    ${Utils.renderCopyableField("", templateId, "", "template-id")}
    ${Utils.renderButtonLink(
      svgLibrary.codeEditor,
      "",
      templateCodeEditorURL,
      "template-code-editor",
      "Template code editor"
    )}
    ${Utils.renderButtonLink(
      svgLibrary.editor,
      "",
      templateSettingsURL,
      "template-settings",
      "Template settings"
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
