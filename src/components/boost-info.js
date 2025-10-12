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
      <!-- Off State: Eye outline (black) -->
      <svg class="icon-off" viewBox="0 0 512.001 512.001" xmlns="http://www.w3.org/2000/svg">
        <g>
          <path fill="black" d="M256,192.012c-35.313,0-64.002,28.688-64.002,64s28.689,63.969,64.002,63.969s64-28.656,64-63.969 S291.313,192.012,256,192.012z"></path>
          <path fill="black" d="M505.381,236.512c-56.082-72.938-125.065-140.438-249.225-140.5h-0.016h-0.016c0-0.031-0.094-0.031-0.125,0 c0,0-0.078,0-0.109,0c-0.016,0-0.016,0-0.016,0h-0.016c-0.016,0-0.016,0-0.016,0C131.684,96.075,62.7,163.575,6.62,236.512 c-8.826,11.5-8.826,27.5,0,39c56.08,72.938,125.065,140.438,249.225,140.5c0,0,0,0,0.016,0h0.016c0,0,0,0,0.016,0h0.016 c0.016,0,0.094,0,0.094,0c0.016,0,0.031,0,0.064,0h0.029h0.016h0.016h0.016h0.016c0.109,0,0.219,0,0.344,0 c0.141-0.031,0.281-0.031,0.422,0c123.66-0.336,192.486-67.719,248.459-140.5C514.207,264.012,514.207,248.012,505.381,236.512z M256.094,352.012h-0.018h-0.012h-0.018h-0.031H256c-0.031,0-0.065,0-0.065,0h-0.014c0,0,0,0-0.016,0 c-52.879-0.063-95.908-43.125-95.908-96s43.029-95.938,95.908-96c0.029,0,0.078,0,0.141,0h0.047 c52.877,0.063,95.906,43.125,95.906,96S308.971,351.95,256.094,352.012z"></path>
        </g>
      </svg>
      <!-- On State: Eye (green) -->
      <svg class="icon-on" viewBox="0 0 512.001 512.001" xmlns="http://www.w3.org/2000/svg">
        <g>
          <path fill="#1cba59" d="M256,192.012c-35.313,0-64.002,28.688-64.002,64s28.689,63.969,64.002,63.969s64-28.656,64-63.969 S291.313,192.012,256,192.012z"></path>
          <path fill="#1cba59" d="M505.381,236.512c-56.082-72.938-125.065-140.438-249.225-140.5h-0.016h-0.016c0-0.031-0.094-0.031-0.125,0 c0,0-0.078,0-0.109,0c-0.016,0-0.016,0-0.016,0h-0.016c-0.016,0-0.016,0-0.016,0C131.684,96.075,62.7,163.575,6.62,236.512 c-8.826,11.5-8.826,27.5,0,39c56.08,72.938,125.065,140.438,249.225,140.5c0,0,0,0,0.016,0h0.016c0,0,0,0,0.016,0h0.016 c0.016,0,0.094,0,0.094,0c0.016,0,0.031,0,0.064,0h0.029h0.016h0.016h0.016h0.016c0.109,0,0.219,0,0.344,0 c0.141-0.031,0.281-0.031,0.422,0c123.66-0.336,192.486-67.719,248.459-140.5C514.207,264.012,514.207,248.012,505.381,236.512z M256.094,352.012h-0.018h-0.012h-0.018h-0.031H256c-0.031,0-0.065,0-0.065,0h-0.014c0,0,0,0-0.016,0 c-52.879-0.063-95.908-43.125-95.908-96s43.029-95.938,95.908-96c0.029,0,0.078,0,0.141,0h0.047 c52.877,0.063,95.906,43.125,95.906,96S308.971,351.95,256.094,352.012z"></path>
        </g>
      </svg>
    </button>
    <span class="toggle-label">Highlight</span>
  </div>
  `;
}
