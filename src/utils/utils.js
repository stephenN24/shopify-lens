import svgLibrary from "../assets/svgs/svgLibrary.js";

function renderButtonLink(icon, text, url, classModifier, tooltip) {
  return `<a class="button-link styled-btn ${classModifier}" href="${url}" target="_blank" ${
    tooltip ? `title="${tooltip}"` : ""
  }>
    ${text ? `<span class="text">${text}</span>` : ""}
    ${icon ? `<div class="icon">${icon}</div>` : ""}
  </a>`;
}

function renderCopyableField(fieldName, title, value, classModifier = "") {
  if (!title && !value) return "";
  const dataValue = value || title;
  return `<div class="data-field ${classModifier}">
    <div class="title" data-value="${dataValue}">${
    fieldName ? `<div class="field-name">• ${fieldName} | </div>` : ""
  }<span class="title-text">${title}</span></div>
    <button class="copy-btn" data-value="${dataValue}" title="Copy">${
    svgLibrary.copyIcon
  }</button>
  </div>`;
}

function buildPreviewLink(windowLocation, themeId) {
  if (!windowLocation || !themeId) return "No preview link available";
  const separator = windowLocation.search.length > 0 ? "&" : "?";
  return `${windowLocation.href}${separator}preview_theme_id=${themeId}`;
}

function buildThemeEditorLink(windowLocation, shopURLWithoutDomain, themeId) {
  if (!windowLocation || !themeId) return "No edior link available";
  return `https://admin.shopify.com/store/${shopURLWithoutDomain}/themes/${themeId}/editor?previewPath=${encodeURIComponent(
    windowLocation.pathname.replace(/^\/[a-z]{2}(?:-[a-z]{2,})*(?=\/)/i, "")
  )}`; // Strip locale and regional codes
}

function bindEventsCopyToClipboard() {
  document.addEventListener("click", function (e) {
    const dataField = e.target.closest(".data-field");
    if (dataField) {
      const value =
        dataField.getAttribute("data-value") ||
        dataField.querySelector(".title")?.getAttribute("data-value");
      if (value) {
        navigator.clipboard.writeText(value);
        const svg = dataField.querySelector(".copy-btn svg");
        if (svg) {
          svg.classList.add("clicked"); // Add clicked class to animate
          setTimeout(() => svg.classList.remove("clicked"), 300);
        }
      }
    }
  });
}

// Show notification
function showNotification(message, type = "info") {
  const notification = document.getElementById("notification");
  notification.querySelector(".notification-text").textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 1000);
}

export {
  renderButtonLink,
  renderCopyableField,
  buildPreviewLink,
  buildThemeEditorLink,
  bindEventsCopyToClipboard,
  showNotification,
};
