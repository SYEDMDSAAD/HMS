import { useCallback, useEffect, useState } from "react";

import {
  applyTheme,
  getThemePreference,
  resolveTheme,
  setThemePreference,
} from "./theme.js";

/**
 * The current theme preference, and a setter that persists it.
 *
 * The media-query listener is the part worth keeping: on "system", the theme
 * has to follow the OS while the tab is open. Someone whose machine switches to
 * dark at sunset should not have to reload the hospital's booking form to stop
 * being blinded by it.
 */
export const useTheme = () => {
  const [preference, setPreference] = useState(getThemePreference);

  useEffect(() => {
    applyTheme(preference);
    if (preference !== "system") return undefined;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [preference]);

  const setTheme = useCallback((next) => {
    setThemePreference(next);
    setPreference(next);
  }, []);

  return { preference, resolved: resolveTheme(preference), setTheme };
};
