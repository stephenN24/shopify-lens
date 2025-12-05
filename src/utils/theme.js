const STORAGE_KEY = "theme_preference";
const DARK_THEME_CLASS = "dark-theme";

export function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
}

export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem(STORAGE_KEY, newTheme);

  return newTheme;
}

export function getCurrentTheme() {
  return document.documentElement.getAttribute("data-theme");
}
