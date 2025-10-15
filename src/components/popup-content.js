import renderStoreInfo, {
  bindEventForHeaderToggleButton,
} from "./store-info.js";
import renderThemeInfo from "./theme-info.js";
import renderBoostInfo from "./boost-info.js";
import renderJiraInfo from "./jira.js";
import initSavedReplies from "./save-replies.js";
import renderSearchBar, { bindEventsForSearchBar } from "./search-bar.js";
import bindEventForHighlightToggleButton from "./highlight-toggle.js";

// Function to render the popup content
export default function renderPopupContent(data) {
  const dashboardContent = document.querySelector(".dashboard-content");
  const headerStoreInfo = document.querySelector(".header-store-info");

  // Render header info - store data
  const storeInfoHtml = renderStoreInfo(data.storeData);
  headerStoreInfo.innerHTML = storeInfoHtml;

  // Render dashboard sections
  const renderSections = [renderSearchBar, renderThemeInfo, renderBoostInfo];
  let html = "";
  renderSections.forEach((fn) => {
    html += `
        <section class="dashboard-section">
          ${fn(data.storeData)}
        </section>
      `;
  });

  dashboardContent.innerHTML = html;

  // Render Jira info
  renderJiraInfo(data);
  // Bind events for search bar
  bindEventsForSearchBar();
  //Bind events for toggle button
  bindEventForHeaderToggleButton();
  // Bind event for highlight toggle button
  bindEventForHighlightToggleButton();

  console.log("Popup data rendered", data);
  if (data.isCached) {
    const isCachedNotice = `<span>Cached</span>`;
    const cachedNotice = document.querySelector(".cache-indicator");
    cachedNotice.innerHTML = isCachedNotice;
  }

  // Init Saved Replies feature
  initSavedReplies(data.storeData);
}
