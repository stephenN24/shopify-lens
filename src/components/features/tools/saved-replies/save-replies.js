import * as Utils from "../../../../utils/utils.js";

export default async function initSavedReplies({
  themeId,
  themeName,
  windowLocation,
  isLive,
  tenantId,
}) {
  let templates = {};
  let currentTemplateId = null;

  // DOM elements
  const templateDropdown = document.getElementById("templateDropdown");
  const templateDropdownBtn = document.getElementById("templateDropdownBtn");
  const templateDropdownText = document.getElementById("templateDropdownText");
  const templateDropdownMenu = document.getElementById("templateDropdownMenu");

  const templateEditor = document.getElementById("templateEditor");
  const templateNameInput = document.getElementById("templateNameInput");
  const templateText = document.getElementById("templateText");
  const preview = document.getElementById("preview");
  const editSection = document.getElementById("editSection");
  const editBtn = document.getElementById("editBtn");
  const saveBtn = document.getElementById("saveBtn");
  const copyBtn = document.getElementById("copyBtn");

  // Default templates
  const defaultTemplates = {
    1: {
      name: "Template 1",
      text: "Could you please check the theme named {{themeName}} again?\n Here is the preview link: {{previewLink}}\n\nThank you!",
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
      text: "1/ Detailed description of the issue/request/idea? (Required)\n\n2/ What you have done? (Required)\n\n3/ Additional Information?\n\nWorking theme: {{themeName}}{{isLiveTheme}}\nPreview link: {{previewLink}}\nAccess granted.",
    },
    5: {
      name: "Demo",
      text: "Theme Name: {{themeName}}\nTheme ID: {{themeId}}\nTenant Id: {{tenantId}}\nPreview Link: {{previewLink}}\nIs Live: {{isLiveTheme}}",
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
      console.log("Error loading templates:", error);
      templates = { ...defaultTemplates };
      Utils.showNotification(
        "Error loading templates, using defaults",
        "error"
      );
    } finally {
      // Update dropdown options after loading
      updateDropdownOptions();
    }
  }

  function updateDropdownOptions() {
    templateDropdownMenu.innerHTML = "";
    Object.keys(templates).forEach((key) => {
      const option = document.createElement("div");
      option.className = "template-dropdown-option";
      if (key === currentTemplateId) option.classList.add("active");
      option.dataset.value = key;
      option.textContent = templates[key].name;
      option.addEventListener("click", () => selectTemplate(key));
      templateDropdownMenu.appendChild(option);
    });

    if (currentTemplateId && templates[currentTemplateId]) {
      templateDropdownText.textContent = templates[currentTemplateId].name;
    }
  }

  // Save templates to Chrome storage
  async function saveTemplatesToStorage() {
    try {
      await chrome.storage.sync.set({ templates: templates });
    } catch (error) {
      console.log("Error saving templates:", error);
      Utils.showNotification("Error saving templates", "error");
    }
  }

  // Setup event listeners
  function setupEventListeners() {
    // Dropdown toggle
    templateDropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      templateDropdown.classList.toggle("open");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!templateDropdown.contains(e.target)) {
        templateDropdown.classList.remove("open");
      }
    });

    templateText.addEventListener("input", updatePreview);
    editBtn.addEventListener("click", toggleEditMode);
    saveBtn.addEventListener("click", saveTemplate);
    copyBtn.addEventListener("click", copyToClipboard);
  }

  // Select template from dropdown
  function selectTemplate(templateId) {
    currentTemplateId = templateId;
    templateDropdown.classList.remove("open");

    // Update active state in menu
    const options = templateDropdownMenu.querySelectorAll(
      ".template-dropdown-option"
    );
    options.forEach((opt) => {
      if (opt.dataset.value === templateId) opt.classList.add("active");
      else opt.classList.remove("active");
    });

    if (currentTemplateId) {
      const template = templates[currentTemplateId];
      if (template) {
        templateDropdownText.textContent = template.name;
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
      .replace(/\{\{tenantId\}\}/g, tenantId)
      .replace(/\{\{isLiveTheme\}\}/g, isLiveTheme)
      .replace(/\{\{previewLink\}\}/g, previewLink);

    // Convert line breaks to HTML breaks for display
    const htmlRendered = rendered.replace(/\n/g, "<br>");
    preview.innerHTML = htmlRendered;
  }

  // Save template changes
  async function saveTemplate() {
    if (!currentTemplateId) {
      Utils.showNotification("Please select a template first", "info");
      return;
    }

    const text = templateText.value.trim();

    if (!text) {
      Utils.showNotification("Template cannot be empty", "error");
      return;
    }

    try {
      templates[currentTemplateId].text = text;

      const newName = templateNameInput.value.trim();
      if (newName) {
        templates[currentTemplateId].name = newName;
        // Update dropdown option text and button text
        templateDropdownText.textContent = newName;
        updateDropdownOptions(); // Re-render options to update name in list
      }

      await saveTemplatesToStorage();
      Utils.showNotification("Template saved successfully!", "success");
      exitEditMode();
      updatePreview();
    } catch (error) {
      console.log("Error saving template:", error);
      Utils.showNotification("Error saving template", "error");
    }
  }

  // Copy rendered text to clipboard
  async function copyToClipboard() {
    if (!currentTemplateId) {
      Utils.showNotification("Please select a template first", "info");
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
      Utils.showNotification("Nothing to copy", "info");
      return;
    }

    const textToCopy = text
      .replace(/\{\{themeName\}\}/g, themeName)
      .replace(/\{\{themeId\}\}/g, themeId)
      .replace(/\{\{tenantId\}\}/g, tenantId)
      .replace(/\{\{isLiveTheme\}\}/g, isLiveTheme)
      .replace(/\{\{previewLink\}\}/g, previewLink);

    try {
      await navigator.clipboard.writeText(textToCopy);
      Utils.showNotification("Copied to clipboard!", "success");
    } catch (error) {
      console.log("Error copying to clipboard:", error);

      // Fallback for older browsers
      try {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        Utils.showNotification("Copied to clipboard!", "success");
      } catch (fallbackError) {
        Utils.showNotification("Failed to copy to clipboard", "error");
      }
    }
  }

  // Toggle edit mode
  function toggleEditMode() {
    if (!currentTemplateId) {
      Utils.showNotification("Please select a template first", "info");
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
    copyBtn.style.display = "none";
    editBtn.textContent = "Cancel Edit";
    editBtn.style.background = "linear-gradient(135deg, #e74c3c, #c0392b)";
    saveBtn.style.display = "inline-block";
    templateNameInput.value = templates[currentTemplateId].name; // Set current name
    templateText.focus();
  }

  // Exit edit mode
  function exitEditMode() {
    editSection.style.display = "none";
    copyBtn.style.display = "block";
    editBtn.textContent = "Edit Template";
    editBtn.style.background = "linear-gradient(135deg, #f39c12, #e67e22)";
    saveBtn.style.display = "none";
  }

  await loadTemplates();
  setupEventListeners();
  // Auto-select Template 1
  selectTemplate("1");
}
