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
