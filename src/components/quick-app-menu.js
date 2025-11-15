const menuItems = [
  {
    name: "Home",
    tooltip: "Home",
    svgPath: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                          <polyline points="9 22 9 12 15 12 15 22"></polyline>`,
    onClick: () => handleClick("Home"),
  },
  {
    name: "Filter",
    tooltip: "Filter",
    svgPath: `<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>`,
    onClick: () => handleClick("Filter"),
  },
  {
    name: "Search",
    tooltip: "Search",
    svgPath: `<circle cx="11" cy="11" r="8"></circle>
                          <path d="m21 21-4.35-4.35"></path>`,
    onClick: () => handleClick("Search"),
  },
  {
    name: "Shopping",
    tooltip: "Shopping",
    svgPath: `<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                          <line x1="3" y1="6" x2="21" y2="6"></line>
                          <path d="M16 10a4 4 0 0 1-8 0"></path>`,
    onClick: () => handleClick("Shopping"),
  },
  {
    name: "Profile",
    tooltip: "Profile",
    svgPath: `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>`,
    onClick: () => handleClick("Profile"),
  },
  {
    name: "Settings",
    tooltip: "Settings",
    svgPath: `<circle cx="12" cy="12" r="3"></circle>
                          <path d="M12 1v6m0 6v6m-9-9h6m6 0h6m-4.95 4.95-4.24-4.24m0 8.48L15.05 19M4.95 4.95l4.24 4.24m0 0L4.95 19"></path>`,
    onClick: () => handleClick("Settings"),
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

// Handle click events
function handleClick(iconName) {
  console.log(iconName + " clicked!");
  alert(iconName + " clicked!");
}

export default function renderQuickAppMenu() {
  return createMenu(menuItems);
}
