import * as Utils from "../../../../utils/utils.js";

export default async function initSavedReplies({
  themeId,
  themeName,
  windowLocation,
  isLive,
}) {
  let templates = {};
  let currentTemplateId = null;

  // DOM elements
  const templateSelect = document.getElementById("templateSelect");
  const templateEditor = document.getElementById("templateEditor");
  const templateText = document.getElementById("templateText");
  const preview = document.getElementById("preview");
  const editSection = document.getElementById("editSection");
  const editBtn = document.getElementById("editBtn");
  const saveBtn = document.getElementById("saveBtn");
  const copyBtn = document.getElementById("copyBtn");
  const notification = document.getElementById("notification");

  // Fixed date values
  const dateValues = {
    day: 11,
    month: 12,
    year: 2025,
  };

  // Default templates
  const defaultTemplates = {
    1: {
      name: "Template 1",
      text: "Could you please check it again? Here is the preview link: {{previewLink}}\n\nThank you!",
    },
    2: {
      name: "Template 2",
      text: "Working theme: {{themeName}}{{isLiveTheme}} - ID: {{themeId}}",
    },
    3: {
      name: "Template 3",
      text: "I have updated the template settings for {{themeName}} (ID: {{themeId}}).",
    },
    4: {
      name: "Template 4",
      text: "1/ Detailed description of the issue/request/idea\n\nWorking theme: {{themeName}}{{isLiveTheme}} - ID: {{themeId}}\nPreview link: {{previewLink}}\nAccess granted.",
    },
  };

  // Variables - need improvement
  const isLiveTheme = isLive ? " [Live]" : "";
  const previewLink =
    Utils.buildPreviewLink(windowLocation, themeId) ||
    "No preview link available";

  // Load templates from Chrome storage
  async function loadTemplates() {
    try {
      const result = await chrome.storage.sync.get("templates");

      if (result.templates && Object.keys(result.templates).length > 0) {
        templates = result.templates;
      } else {
        // First time setup - use default templates
        templates = { ...defaultTemplates };
        await saveTemplatesToStorage();
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      templates = { ...defaultTemplates };
      showNotification("Error loading templates, using defaults", "error");
    }
  }

  // Save templates to Chrome storage
  async function saveTemplatesToStorage() {
    try {
      await chrome.storage.sync.set({ templates: templates });
    } catch (error) {
      console.error("Error saving templates:", error);
      showNotification("Error saving templates", "error");
    }
  }

  // Setup event listeners
  function setupEventListeners() {
    templateSelect.addEventListener("change", selectTemplate);
    templateText.addEventListener("input", updatePreview);
    editBtn.addEventListener("click", toggleEditMode);
    saveBtn.addEventListener("click", saveTemplate);
    copyBtn.addEventListener("click", copyToClipboard);
  }

  // Select template from dropdown
  function selectTemplate() {
    currentTemplateId = templateSelect.value;

    if (currentTemplateId) {
      const template = templates[currentTemplateId];
      if (template) {
        templateEditor.classList.add("active");
        templateText.value = template.text;

        // Reset to view mode when selecting a new template
        exitEditMode();
        updatePreview();
      }
    } else {
      templateEditor.classList.remove("active");
      currentTemplateId = null;
      exitEditMode();
    }
  }

  // Update preview with rendered template
  function updatePreview() {
    let text = templateText.value;
    if (editSection.style.display !== "none") {
      text = templateText.value;
    } else if (currentTemplateId && templates[currentTemplateId]) {
      text = templates[currentTemplateId].text;
    } else {
      text = "";
    }

    if (!text.trim()) {
      preview.textContent = "Enter some text to see the preview";
      return;
    }

    const rendered = text
      .replace(/\{\{themeName\}\}/g, themeName)
      .replace(/\{\{themeId\}\}/g, themeId)
      .replace(/\{\{isLiveTheme\}\}/g, isLiveTheme)
      .replace(/\{\{previewLink\}\}/g, previewLink);

    // Convert line breaks to HTML breaks for display
    const htmlRendered = rendered.replace(/\n/g, "<br>");
    preview.innerHTML = htmlRendered;
  }

  // Save template changes
  async function saveTemplate() {
    if (!currentTemplateId) {
      showNotification("Please select a template first", "info");
      return;
    }

    const text = templateText.value.trim();

    if (!text) {
      showNotification("Template cannot be empty", "error");
      return;
    }

    try {
      templates[currentTemplateId].text = text;
      await saveTemplatesToStorage();
      showNotification("Template saved successfully!", "success");
      exitEditMode();
      updatePreview();
    } catch (error) {
      console.error("Error saving template:", error);
      showNotification("Error saving template", "error");
    }
  }

  // Copy rendered text to clipboard
  async function copyToClipboard() {
    if (!currentTemplateId) {
      showNotification("Please select a template first", "info");
      return;
    }

    // Get the original text with line breaks preserved
    let text;
    if (editSection.style.display !== "none") {
      text = templateText.value;
    } else {
      text = templates[currentTemplateId].text;
    }

    if (!text.trim()) {
      showNotification("Nothing to copy", "info");
      return;
    }

    const textToCopy = text
      .replace(/\{\{themeName\}\}/g, themeName)
      .replace(/\{\{themeId\}\}/g, themeId)
      .replace(/\{\{isLiveTheme\}\}/g, isLiveTheme)
      .replace(/\{\{previewLink\}\}/g, previewLink);

    try {
      await navigator.clipboard.writeText(textToCopy);
      showNotification("Copied to clipboard!", "success");
    } catch (error) {
      console.error("Error copying to clipboard:", error);

      // Fallback for older browsers
      try {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        showNotification("Copied to clipboard!", "success");
      } catch (fallbackError) {
        showNotification("Failed to copy to clipboard", "error");
      }
    }
  }

  // Toggle edit mode
  function toggleEditMode() {
    if (!currentTemplateId) {
      showNotification("Please select a template first", "info");
      return;
    }

    const isEditing = editSection.style.display !== "none";

    if (isEditing) {
      exitEditMode();
    } else {
      enterEditMode();
    }
  }

  // Enter edit mode
  function enterEditMode() {
    editSection.style.display = "block";
    editBtn.textContent = "Cancel Edit";
    editBtn.style.background = "linear-gradient(135deg, #e74c3c, #c0392b)";
    saveBtn.style.display = "inline-block";
    templateText.focus();
  }

  // Exit edit mode
  function exitEditMode() {
    editSection.style.display = "none";
    editBtn.textContent = "Edit Template";
    editBtn.style.background = "linear-gradient(135deg, #f39c12, #e67e22)";
    saveBtn.style.display = "none";
  }

  // Show notification
  function showNotification(message, type = "info") {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add("show");

    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  }

  await loadTemplates();
  setupEventListeners();
  // Auto-select Template 1
  templateSelect.value = "1";
  selectTemplate();
}
