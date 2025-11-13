class DynamicLinkDropdown {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }

    this.menuData = options.menuData || {};
    this.onSelect = options.onSelect || null;
    this.currentUrl = null;
    this.currentSelection = { parent: null, child: null };

    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
            <div class="dl-wrapper">
                <div class="dl-dropdown-container">
                    <button class="dl-dropdown-button" id="dl-dropdown-btn-${this.getUniqueId()}">
                        <span class="dl-selected-text">Select an option...</span>
                        <span class="dl-arrow">▼</span>
                    </button>
                    <div class="dl-dropdown-menu" id="dl-dropdown-menu-${this.getUniqueId()}"></div>
                </div>
                <a class="dl-link-button" id="dl-link-btn-${this.getUniqueId()}" href="#" target="_blank" disabled>
                    Open Page →
                </a>
            </div>
        `;

    this.dropdownBtn = this.container.querySelector(".dl-dropdown-button");
    this.dropdownMenu = this.container.querySelector(".dl-dropdown-menu");
    this.selectedText = this.container.querySelector(".dl-selected-text");
    this.arrow = this.container.querySelector(".dl-arrow");
    this.linkBtn = this.container.querySelector(".dl-link-button");

    this.renderMenu();
  }

  getUniqueId() {
    return Math.random().toString(36).substr(2, 9);
  }

  renderMenu() {
    this.dropdownMenu.innerHTML = "";

    for (const [parent, children] of Object.entries(this.menuData)) {
      const parentItem = document.createElement("div");
      parentItem.className = "dl-menu-item parent";

      const hasChildren = Object.keys(children).length > 0;
      if (hasChildren) {
        parentItem.classList.add("has-children");
      }

      parentItem.textContent = parent;
      parentItem.dataset.parent = parent;

      if (hasChildren) {
        const submenu = document.createElement("div");
        submenu.className = "dl-submenu";

        for (const [child, url] of Object.entries(children)) {
          const submenuItem = document.createElement("div");
          submenuItem.className = "dl-submenu-item";
          submenuItem.textContent = child;
          submenuItem.dataset.parent = parent;
          submenuItem.dataset.child = child;
          submenuItem.dataset.url = url;

          submenuItem.addEventListener("click", (e) => {
            e.stopPropagation();
            this.selectItem(parent, child, url);
          });

          submenu.appendChild(submenuItem);
        }

        parentItem.appendChild(submenu);
      }

      this.dropdownMenu.appendChild(parentItem);
    }
  }

  selectItem(parent, child, url) {
    this.currentSelection = { parent, child };
    this.currentUrl = url;

    this.selectedText.textContent = `${parent} > ${child}`;
    this.linkBtn.href = url;
    this.linkBtn.disabled = false;

    this.closeDropdown();

    if (this.onSelect) {
      this.onSelect({ parent, child, url });
    }
  }

  toggleDropdown() {
    const isOpen = this.dropdownMenu.classList.toggle("show");
    this.arrow.classList.toggle("open", isOpen);
    this.dropdownBtn.classList.toggle("active", isOpen);
  }

  closeDropdown() {
    this.dropdownMenu.classList.remove("show");
    this.arrow.classList.remove("open");
    this.dropdownBtn.classList.remove("active");
  }

  attachEventListeners() {
    this.dropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    document.addEventListener("click", (e) => {
      if (
        !this.dropdownBtn.contains(e.target) &&
        !this.dropdownMenu.contains(e.target)
      ) {
        this.closeDropdown();
      }
    });

    this.linkBtn.addEventListener("click", (e) => {
      if (this.linkBtn.disabled) {
        e.preventDefault();
      }
    });
  }

  // Public methods
  getCurrentSelection() {
    return this.currentSelection;
  }

  getCurrentUrl() {
    return this.currentUrl;
  }

  updateMenuData(newData) {
    this.menuData = newData;
    this.renderMenu();
  }

  reset() {
    this.currentSelection = { parent: null, child: null };
    this.currentUrl = null;
    this.selectedText.textContent = "Select an option...";
    this.linkBtn.href = "#";
    this.linkBtn.disabled = true;
    this.closeDropdown();
  }

  destroy() {
    this.container.innerHTML = "";
  }
}

export default DynamicLinkDropdown;
