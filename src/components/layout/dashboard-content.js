import renderStoreInfo, {
  bindEventForHeaderToggleBtn,
  updateCacheIndicator,
} from "../features/info-cards/store-info.js";
import renderThemeInfo from "../features/info-cards/theme-info.js";
import renderBoostInfo from "../features/info-cards/boost-info.js";
import renderJiraTab from "../features/info-cards/card-features/jira/jira.js";
import initSavedReplies from "../features/tools/saved-replies/save-replies.js";
import renderSearchBar, {
  bindEventForSearchBar,
} from "../features/info-cards/card-features/search-bar/search-bar.js";
import bindEventForHighlightElmToggleBtn from "../features/info-cards/card-features/highlight/highlight-toggle.js";

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
