export default function bindEventsForTabs() {
  const buttons = document.querySelectorAll(".sidebar button");
  const tabs = document.querySelectorAll(".tab");

  if (!buttons.length || !tabs.length) return;

  const sidebar = document.querySelector(".sidebar");
  if (sidebar) {
    sidebar.addEventListener("click", (e) => {
      const button = e.target.closest("button");
      if (button?.dataset.tab) {
        switchTab(button.dataset.tab, tabs, buttons);
      }
    });
  }

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

      switchTab(visibleButtons[nextIndex].dataset.tab, tabs, buttons);
      visibleButtons[nextIndex].focus();
    }
  });
}

function switchTab(tabId, tabs, buttons) {
  if (!tabId) return;

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
