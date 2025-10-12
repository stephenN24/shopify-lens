import svgLibrary from "../assets/svgs/svgLibrary.js";
import * as Utils from "./utils.js";

export default function renderStoreInfo({
  tenantId,
  shopURLWithoutDomain,
  resourceId,
  resourceType,
}) {
  const tenantIdHTML = Utils.renderCopyableField(
    "",
    tenantId,
    undefined,
    "tenant-id"
  );
  const dashboardLink = Utils.renderButtonLink(
    svgLibrary.react,
    "",
    `https://dashboard.bc-solutions.net/sync-hook-details/${tenantId}`,
    "system-dashboard"
  );

  const shopifyPartnersLink = Utils.renderButtonLink(
    svgLibrary.shopifyPartner,
    "",
    `https://partners.shopify.com/524425/stores?search_value=${tenantId}`,
    "shopify-partners"
  );

  const themesPageLink = Utils.renderButtonLink(
    svgLibrary.shopifyTheme,
    "",
    `https://admin.shopify.com/store/${shopURLWithoutDomain}/themes`,
    "themes-page"
  );

  const currentPageResourceType =
    resourceType == "product" || resourceType == "collection"
      ? resourceType
      : "";

  const currentPageDataHTML =
    currentPageResourceType && resourceId
      ? Utils.renderCopyableField(
          currentPageResourceType + " ID",
          resourceId,
          undefined,
          "extra-page-data"
        )
      : "";

  return `<div class="header-info-content store-info">
  ${tenantIdHTML}
  <div class="links-wrapper">
  ${themesPageLink}
  ${dashboardLink}
  ${shopifyPartnersLink}
  </div>
  <div class="current-page-data">
    ${currentPageDataHTML}
  </div>
  ${
    currentPageDataHTML
      ? `<button
        class="arrow-button"
        id="toggleBtn"
        aria-label="Toggle additional info"
      >
        ${svgLibrary.arrowDown}
      </button>`
      : ""
  }
  </div>`;
}

// Bind toggle button event
function bindToggleButton() {
  const card = document.querySelector(".header-info-content");
  const toggleBtn = document.getElementById("toggleBtn");
  if (!toggleBtn) return;
  toggleBtn.addEventListener("click", () => {
    card.classList.toggle("expanded");
  });
}

export { bindToggleButton };
