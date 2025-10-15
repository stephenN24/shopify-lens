//Bind event toggle buttons
export default function bindEventForHighlightElmToggleBtn() {
  const toggleBtn = document.querySelector(".highlight-toggle-btn");

  toggleBtn.addEventListener("click", async function () {
    this.classList.toggle("active");
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: highlightElements,
    });
  });
}

function highlightElements() {
  const HIGHLIGHT_CLASS = "boost-highlight";
  const STYLE_ID = "boost-highlight-style";

  // Inject highlight style if not already present
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
        .${HIGHLIGHT_CLASS} {
          outline: 3px solid #ff2f01 !important;
          outline-offset: 2px !important;
          transition: outline 0.2s ease-in-out;
        }
      `;
    document.head.appendChild(style);
  }

  // Get all matching elements
  const matches = Array.from(
    document.querySelectorAll('[class*="boost-sd"], [class*="boost-pfs"]')
  ).filter(
    (el) =>
      el !== document.body &&
      Array.from(el.classList).some(
        (c) => c.startsWith("boost-sd") || c.startsWith("boost-pfs")
      )
  );

  // Determine toggle state
  const anyHighlighted = matches.some((el) =>
    el.classList.contains(HIGHLIGHT_CLASS)
  );

  // Apply or remove highlight class
  matches.forEach((el) => {
    if (anyHighlighted) {
      el.classList.remove(HIGHLIGHT_CLASS);
    } else {
      el.classList.add(HIGHLIGHT_CLASS);
    }
  });
}
