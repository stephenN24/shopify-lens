const API_BASE = "https://www.shopscan.app";
const API_ENDPOINT = `${API_BASE}/app-api`;

async function fetchAppsData(storeUrl) {
  try {
    const response = await fetch(
      `${API_ENDPOINT}?url=${encodeURIComponent(storeUrl)}`
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Filter to only include non-recommended apps
    const apps =
      data.matched_apps?.filter((app) => app.recommended === false) || [];

    return apps;
  } catch (error) {
    console.error("Error fetching apps data:", error);
    throw error;
  }
}

function renderAppItem(app) {
  const imageUrl = `${API_BASE}${app.image}`;
  const appStoreUrl = app.app_store_url || "#";

  return `
    <div class="app-item" data-app-url="${appStoreUrl}">
      <div class="app-image-wrapper">
        <img src="${imageUrl}" alt="${app.name}" class="app-image" />
      </div>
      <div class="app-info">
        <h3 class="app-name">${app.name}</h3>
        ${
          app.short_description
            ? `<p class="app-description">${app.short_description}</p>`
            : ""
        }
      </div>
    </div>
  `;
}

function renderLoadingState() {
  return `
    <div class="apps-loading">
      <div class="loading-spinner"></div>
      <p>Loading apps...</p>
    </div>
  `;
}

function renderErrorState(message = "Failed to load apps. Please try again.") {
  return `
    <div class="apps-error">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p>${message}</p>
    </div>
  `;
}

function renderEmptyState() {
  return `
    <div class="apps-empty">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
      <p>No apps detected on this store</p>
    </div>
  `;
}

function renderAppsList(apps) {
  if (!apps || apps.length === 0) {
    return renderEmptyState();
  }

  const appsHtml = apps.map((app) => renderAppItem(app)).join("");

  return `
    <div class="apps-grid">
      ${appsHtml}
    </div>
  `;
}

//Bind click events to app items

function bindAppItemEvents() {
  const appItems = document.querySelectorAll(".app-item");

  appItems.forEach((item) => {
    item.addEventListener("click", () => {
      const appUrl = item.dataset.appUrl;
      if (appUrl && appUrl !== "#") {
        chrome.tabs.create({ url: appUrl });
      }
    });
  });
}

// Initialize apps tab

export default async function initApps(storeData) {
  const appsListContainer = document.querySelector(".apps-list");

  if (!appsListContainer) {
    console.error("Apps list container not found");
    return;
  }

  // Get current URL from store data
  const currentUrl = storeData?.windowLocation?.href || window.location.href;

  if (!currentUrl) {
    appsListContainer.innerHTML = renderErrorState("No store URL available");
    return;
  }

  // Show loading state
  appsListContainer.innerHTML = renderLoadingState();

  try {
    // Fetch apps data
    const apps = await fetchAppsData(currentUrl);

    // Render apps list
    appsListContainer.innerHTML = renderAppsList(apps);

    // Bind click events
    bindAppItemEvents();

    console.log(`Loaded ${apps.length} apps for ${currentUrl}`);
  } catch (error) {
    // Show error state
    appsListContainer.innerHTML = renderErrorState();
    console.error("Failed to initialize apps tab:", error);
  }
}
