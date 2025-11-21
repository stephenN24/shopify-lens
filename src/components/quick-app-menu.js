import svgLibrary from "../assets/svgs/svgLibrary.js";

export default function renderQuickAppMenu(shopURLWithoutDomain) {
  const baseURL = `https://admin.shopify.com/store/${shopURLWithoutDomain}/apps/product-filter-search`;
  const menuItems = [
    {
      name: "Home",
      tooltip: "Home",
      svgPath: svgLibrary.appHomePage,
      urlPath: "",
    },
    {
      name: "Filter",
      tooltip: "Filter",
      svgPath: svgLibrary.appFilter,
      urlPath: "/filter-tree",
    },
    {
      name: "Search",
      tooltip: "Search",
      svgPath: svgLibrary.appSearch,
      urlPath: "/search/standard-search/relevance-settings",
    },
    {
      name: "Merchandising",
      tooltip: "Merchandising",
      svgPath: svgLibrary.appMerchandising,
      urlPath: "/merchandising",
    },
    {
      name: "Integrations",
      tooltip: "Integrations",
      svgPath: svgLibrary.appIntegrations,
      urlPath: "/shopify-integration",
    },
    {
      name: "Settings",
      tooltip: "Settings",
      svgPath: svgLibrary.appSettings,
      urlPath: "/settings",
    },
  ];

  const menuItemsHTML = menuItems
    .map((item) => createMenuItem(item, baseURL))
    .join("");

  return `
                <div class="menu-container">
                    <div class="icon-grid">
                        ${menuItemsHTML}
                    </div>
                </div>
            `;
}
function createMenuItem(item, baseURL) {
  return `
                <div class="icon-item" data-name="${item.name}">
                <a class="item-link" href="${
                  baseURL + item.urlPath
                }" target="_blank">
                        ${item.svgPath}
                    <span class="item-tooltip"><span>${
                      item.tooltip
                    }</span></span>
                </a>
                </div>
            `;
}
