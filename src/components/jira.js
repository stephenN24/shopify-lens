import { switchTab } from "./sidebar.js";
import * as Utils from "./utils.js";

export default function renderJiraTab(data) {
  const jiraDataTab = document.querySelector(".jira-content");
  const jiraKey = data.jiraKey;
  if (jiraKey) {
    document.querySelector("[data-tab=tab-jira]").classList.remove("hidden"); // Show the Jira tab if jiraKey exists
    const jiraLink = Utils.renderButtonLink(
      "",
      jiraKey,
      `https://oneapphub.atlassian.net/browse/${jiraKey}`,
      "jira-link"
    );
    jiraDataTab.innerHTML = `<div class="section-content jira-info">${jiraLink}</div>`;
    switchTab("tab-jira"); // Activate the Jira tab
  } else {
    document.querySelector("[data-tab=tab-jira]").classList.add("hidden"); // Hide the Jira tab if jiraKey does not exist
  }
}
