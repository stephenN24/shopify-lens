export default function initTools() {
  const openRefinedUrl = document.querySelector("#open-url-btn");
  const apiRequestInput = document.querySelector("#apiRequest");

  openRefinedUrl.addEventListener("click", () =>
    handleOpenRefinedUrl(apiRequestInput)
  );
  apiRequestInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      handleOpenRefinedUrl(apiRequestInput);
    }
  });

  document
    .getElementById("search-helpdoc-btn")
    .addEventListener("click", handleHelpdocSearch);

  helpdocSearchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      handleHelpdocSearch();
    }
  });
}

function handleOpenRefinedUrl(apiRequestInput) {
  const originalApiRequest = apiRequestInput.value;
  const url = refineAPIRequest(originalApiRequest);
  const errorMsg = document.querySelector(".url-refactor .error-message");
  if (url) {
    window.open(url, "_blank");
    errorMsg.style.display = "none";
  } else {
    errorMsg.textContent = "Invalid URL";
    errorMsg.style.display = "inline";
  }
}

function refineAPIRequest(url) {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.delete("widgetId");
    return urlObj.toString();
  } catch (e) {
    console.warn("Invalid URL:", url);
    return null;
  }
}

// Tools - Helpdoc Finder
const helpdocSearchInput = document.getElementById("helpdocSearch");

function handleHelpdocSearch() {
  const keyword = helpdocSearchInput.value.trim();
  const errorMsg = document.querySelector(".helpdoc-finder .error-message");
  if (keyword) {
    const url = `https://support.boostcommerce.net/en/?q=${encodeURIComponent(
      keyword
    )}`;
    window.open(url, "_blank");
    errorMsg.style.display = "none";
  } else {
    errorMsg.textContent = "Please enter a keyword";
    errorMsg.style.display = "inline";
  }
}
