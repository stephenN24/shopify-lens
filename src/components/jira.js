import { switchTab } from "./sidebar.js";
import * as Utils from "./utils.js";

export default function renderJiraInfo(data) {
  const jiraDataTab = document.querySelector(".jira-content");
  const jiraKey = data.jiraKey;
  if (jiraKey) {
    document.querySelector("[data-tab=tab2]").classList.remove("hidden"); // Show the Jira tab if jiraKey exists
    const jiraLink = Utils.renderButtonLink(
      "",
      jiraKey,
      `https://oneapphub.atlassian.net/browse/${jiraKey}`,
      "jira-link"
    );
    jiraDataTab.innerHTML = `<div class="section-content jira-info">${jiraLink}</div>`;
    switchTab("tab2");
  } else {
    document.querySelector("[data-tab=tab2]").classList.add("hidden"); // Hide the Jira tab if jiraKey does not exist
  }
}
