import renderStoreInfo, {
  bindEventForHeaderToggleBtn,
  updateCacheIndicator,
} from "./store-info.js";
import renderThemeInfo from "./theme-info.js";
import renderBoostInfo, { renderDynamicLinkDropdown } from "./boost-info.js";
import renderJiraTab from "./jira.js";
import initSavedReplies from "./save-replies.js";
import renderSearchBar, { bindEventForSearchBar } from "./search-bar.js";
import bindEventForHighlightElmToggleBtn from "./highlight-toggle.js";

// Function to render the dashhboard content
export default function renderDashboardContent(data) {
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

  renderDynamicLinkDropdown();

  // Update cache indicator
  updateCacheIndicator(data.isCached);

  // Render Jira info
  renderJiraTab(data);
  // Bind eventsfor search bar
  bindEventForSearchBar();
  //Bind event for toggle button
  bindEventForHeaderToggleBtn();
  // Bind event for highlight toggle button
  bindEventForHighlightElmToggleBtn();

  console.log("Popup data rendered", data);

  // Init Saved Replies feature
  initSavedReplies(data.storeData);
}
