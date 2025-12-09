import * as Utils from "../../../utils/utils.js";

export default function initTools() {
  const openRefinedUrlBtn = document.querySelector("#open-url-btn");
  const apiRequestInput = document.querySelector("#apiRequest");
  const searchHelpdocBtn = document.querySelector("#search-helpdoc-btn");
  const helpdocSearchInput = document.querySelector("#helpdocSearch");

  // Tools - Refine API request
  openRefinedUrlBtn.addEventListener("click", () =>
    handleOpenRefinedUrl(apiRequestInput)
  );
  apiRequestInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      handleOpenRefinedUrl(apiRequestInput);
    }
  });

  // Tools - Helpdoc Finder
  searchHelpdocBtn.addEventListener("click", () =>
    handleHelpdocSearch(helpdocSearchInput)
  );
  helpdocSearchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      handleHelpdocSearch(helpdocSearchInput);
    }
  });
}

function handleOpenRefinedUrl(apiRequestInput) {
  const originalApiRequest = apiRequestInput.value;
  const url = refineAPIRequest(originalApiRequest);
  if (url) {
    window.open(url, "_blank");
  } else {
    Utils.showNotification("Invalid URL", "error");
  }
}

function refineAPIRequest(url) {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.delete("widgetId");
    return urlObj.toString();
  } catch (e) {
    console.log("Invalid URL:", url);
    return null;
  }
}

function handleHelpdocSearch(helpdocSearchInput) {
  const keyword = helpdocSearchInput.value.trim();
  if (keyword) {
    const url = `https://support.boostcommerce.net/en/?q=${encodeURIComponent(
      keyword
    )}`;
    window.open(url, "_blank");
  } else {
    Utils.showNotification("Please enter a keyword", "error");
  }
}
