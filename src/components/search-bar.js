// Render search bar HTML
export default function renderSearchBar({ shopURLWithoutDomain }) {
  return `
    <div class="search-container">
      <div class="search-wrapper">
        ${renderFilterDropdown(shopURLWithoutDomain)}
          <input 
            type="text"   
            class="search-input" 
            id="searchInput"
            placeholder="Search for products..."
            autocomplete="off"
          >
        <a href="https://admin.shopify.com/store/${shopURLWithoutDomain}/products" class="styled-btn small search-button" id="searchButton">Go</a>
      </div>
    </div>
  `;
}

function renderFilterDropdown(shopURLWithoutDomain) {
  const options = [
    {
      searchType: "product",
      href: `https://admin.shopify.com/store/${shopURLWithoutDomain}/products`,
      placeholder: "Search product...",
      label: "Product",
      active: true,
      icon: `
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      `,
    },
    {
      searchType: "collection",
      href: `https://admin.shopify.com/store/${shopURLWithoutDomain}/collections`,
      placeholder: "Search collection...",
      label: "Collection",
      icon: `
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
      `,
    },
    {
      searchType: "theme",
      href: `https://admin.shopify.com/store/${shopURLWithoutDomain}/themes/`,
      placeholder: "Go to theme...",
      label: "Theme",
      icon: `
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
      `,
    },
  ];

  return `
    <div class="filter-dropdown" id="filterDropdown">
      ${renderFilterButton()}
      <div class="dropdown-menu" id="dropdownMenu">
        ${options.map(renderDropdownOption).join("")}
      </div>
    </div>
  `;
}

function renderFilterButton() {
  return `
    <button class="filter-button" id="filterButton">
      <div>
        <svg class="filter-icon" viewBox="0 0 24 24">
          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
        </svg>
        <span id="filterText">Product</span>
      </div>
      <svg class="chevron" viewBox="0 0 24 24">
        <polyline points="6,9 12,15 18,9"/>
      </svg>
    </button>
  `;
}

function renderDropdownOption({
  searchType,
  href,
  placeholder,
  label,
  active,
  icon,
}) {
  return `
    <div 
      class="dropdown-option ${active ? "active" : ""}" 
      data-searchType="${searchType}" 
      data-href="${href}" 
      data-placeholder="${placeholder}">
      <svg class="filter-icon" viewBox="0 0 24 24">${icon}</svg>
      ${label}
    </div>
  `;
}

export function bindEventForSearchBar() {
  const filterDropdown = document.getElementById("filterDropdown");
  const filterButton = document.getElementById("filterButton");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const filterText = document.getElementById("filterText");
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const dropdownOptions = document.querySelectorAll(".dropdown-option");

  // Toggle dropdown
  filterButton.addEventListener("click", (e) => {
    e.stopPropagation();
    filterDropdown.classList.toggle("open");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!filterDropdown.contains(e.target)) {
      filterDropdown.classList.remove("open");
    }
  });

  // Handle option selection
  dropdownOptions.forEach((option) => {
    option.addEventListener("click", () => {
      // Remove active class from all options
      dropdownOptions.forEach((opt) => opt.classList.remove("active"));

      // Add active class to selected option
      option.classList.add("active");

      // Update filter text
      const value = option.dataset.searchtype;
      searchInput.dataset.searchtype = value;
      filterText.textContent = value.charAt(0).toUpperCase() + value.slice(1);

      // Update input placeholder
      searchInput.placeholder = option.dataset.placeholder;

      // Update button href
      searchButton.href = option.dataset.href;

      // Close dropdown
      filterDropdown.classList.remove("open");

      // Add a subtle animation effect
      searchInput.style.transform = "scale(1.02)";
      setTimeout(() => {
        searchInput.style.transform = "scale(1)";
      }, 150);
    });
  });

  // Handle search input
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      performSearch();
    }
  });

  // Add search functionality to the Go button
  searchButton.addEventListener("click", (e) => {
    e.preventDefault();
    performSearch();
  });

  // Add floating label effect
  searchInput.addEventListener("focus", () => {
    searchInput.parentElement.style.transform = "scale(1.02)";
  });

  searchInput.addEventListener("blur", () => {
    searchInput.parentElement.style.transform = "scale(1)";
  });

  // Prevent dropdown from closing when clicking inside
  dropdownMenu.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}

function performSearch() {
  const searchQuery = encodeURIComponent(searchInput.value);
  const currentHref = searchButton.href;
  const searchType = searchInput.dataset.searchtype;
  let searchURL = `${currentHref}?query=${searchQuery}`;
  if (searchType === "theme") {
    searchURL = `${currentHref}${searchQuery}`;
  }
  window.open(searchURL, "_blank");
}
