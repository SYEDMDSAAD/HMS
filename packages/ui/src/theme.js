/**
 * Colour theme: reading it, setting it, keeping it.
 *
 * Three preferences — "light", "dark", "system" — resolving to exactly two
 * rendered themes. The resolved one is written to <html data-theme>, which is
 * what packages/theme/tokens.css keys off.
 *
 * Why the attribute is always explicit, rather than letting CSS handle "system"
 * with a prefers-color-scheme media query: with a media query, the token file
 * needs the dark palette written twice — once under `[data-theme="dark"]` and
 * once under `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])`
 * — and two copies of eighteen values is two copies to drift. Resolving the
 * preference here keeps one block of dark values. The cost is that the theme
 * needs JavaScript, which is already true of a React SPA.
 *
 * The matching part of this that is NOT here is the inline script in each app's
 * index.html. It has to run before first paint, or the page renders light and
 * then snaps to dark. Keep the storage key below in step with those scripts.
 */

export const THEME_STORAGE_KEY = "uc-theme";
export const THEME_PREFERENCES = ["light", "system", "dark"];

const prefersDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-color-scheme: dark)").matches;

/** The stored preference, or "system" when nothing has been chosen. */
export const getThemePreference = () => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return THEME_PREFERENCES.includes(stored) ? stored : "system";
  } catch {
    // Safari in private mode throws on localStorage rather than returning null.
    return "system";
  }
};

/** "light" | "dark" — what a preference actually renders as right now. */
export const resolveTheme = (preference) =>
  preference === "system" ? (prefersDark() ? "dark" : "light") : preference;

export const applyTheme = (preference) => {
  document.documentElement.dataset.theme = resolveTheme(preference);
};

export const setThemePreference = (preference) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Not being able to remember the choice is survivable; not applying it is
    // not, so this failure is swallowed and the theme still changes.
  }
  applyTheme(preference);
};
