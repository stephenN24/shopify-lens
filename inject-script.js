(function () {
  const popupData = {
    storeData: window.Shopify || null,
    jiraKey: null,
    windowLocation: window.location || null,
  };

  // Find Jira key
  let pageContent = document.body.innerText || document.body.textContent;
  let match = pageContent.match(/jira_issue_key to BC-\d+/);
  if (match) {
    popupData.jiraKey = match[0].split("BC-")[1];
  }

  // Send the data back to the content script
  window.postMessage(
    { type: "POPUP_DATA", popupData: JSON.parse(JSON.stringify(popupData)) },
    "*"
  );
})();
