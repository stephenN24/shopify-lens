import svgLibrary from "../assets/svgs/svgLibrary.js";

const menuItems = [
  {
    name: "Home",
    tooltip: "Home",
    svgPath: svgLibrary.appHomePage,
  },
  {
    name: "Filter",
    tooltip: "Filter",
    svgPath: svgLibrary.appFilter,
  },
  {
    name: "Search",
    tooltip: "Search",
    svgPath: svgLibrary.appSearch,
  },
  {
    name: "Merchandising",
    tooltip: "Merchandising",
    svgPath: svgLibrary.appMerchandising,
  },
  {
    name: "Integrations",
    tooltip: "Integrations",
    svgPath: svgLibrary.appIntegrations,
  },
  {
    name: "Settings",
    tooltip: "Settings",
    svgPath: svgLibrary.appSettings,
  },
];

// Create a menu item component
function createMenuItem(item) {
  return `
                <div class="icon-item" data-name="${item.name}">
                    <svg viewBox="0 0 24 24">
                        ${item.svgPath}
                    </svg>
                    <span class="item-tooltip"><span>${item.tooltip}</span></span>
                </div>
            `;
}

// Create the complete menu with container
function createMenu(items) {
  const menuItemsHTML = items.map((item) => createMenuItem(item)).join("");

  return `
                <div class="menu-container">
                    <div class="icon-grid">
                        ${menuItemsHTML}
                    </div>
                </div>
            `;
}

export default function renderQuickAppMenu() {
  return createMenu(menuItems);
}
