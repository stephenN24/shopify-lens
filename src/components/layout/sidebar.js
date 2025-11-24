// Add smooth interactions for sidebar
const sidebar = document.querySelector(".sidebar");
const sidebarButtons = sidebar.querySelectorAll(".tab-btn:not(.hidden)");

sidebarButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    // Add ripple effect
    createRipple(button, event);
  });
});

// Enhanced ripple effect function
function createRipple(button, event) {
  const ripple = document.createElement("span");
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                pointer-events: none;
                transform: scale(0);
                animation: rippleEffect 0.6s ease-out;
                z-index: 100;
            `;

  button.style.position = "relative";
  button.style.overflow = "hidden";
  button.appendChild(ripple);
}

export default function bindEventsForTabs() {
  const buttons = document.querySelectorAll(".sidebar button");
  const tabs = document.querySelectorAll(".tab");
  const sidebar = document.querySelector(".sidebar");
  sidebar.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (button?.dataset.tab) {
      switchTab(button.dataset.tab, tabs, buttons);
    }
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const visibleButtons = Array.from(buttons).filter(
        (btn) => !btn.classList.contains("hidden")
      );

      if (!visibleButtons.length) return;

      const activeIndex = visibleButtons.findIndex((btn) =>
        btn.classList.contains("active")
      );
      const nextIndex = (activeIndex + 1) % visibleButtons.length;

      switchTab(visibleButtons[nextIndex].dataset.tab);
      visibleButtons[nextIndex].focus();
    }
  });
}

export function switchTab(tabId) {
  const buttons = document.querySelectorAll(".sidebar button");
  const tabs = document.querySelectorAll(".tab");

  // Remove active classes
  buttons.forEach((btn) => btn.classList.remove("active"));
  tabs.forEach((tab) => tab.classList.remove("active"));

  // Activate button and tab
  const activeButton = Array.from(buttons).find(
    (btn) => btn.dataset.tab === tabId
  );
  const activeTab = document.getElementById(tabId);

  if (activeButton) activeButton.classList.add("active");
  if (activeTab) activeTab.classList.add("active");
}
