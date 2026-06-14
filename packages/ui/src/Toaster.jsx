import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * The toast host, configured once.
 *
 * Both apps mounted their own <ToastContainer> and imported the stylesheet
 * separately; this puts the configuration and that import in one place.
 *
 * `theme` still defaults to "light" rather than following the design tokens.
 * react-toastify picks its palette from this prop at render, not from CSS, so
 * following the theme needs something that re-renders when the theme changes —
 * which is the toggle Part 7 introduces. Wiring it to a value nothing can
 * change yet would be a lie in the shape of a feature.
 */
export const Toaster = ({ theme = "light", ...rest }) => (
  <ToastContainer
    position="top-center"
    // Long enough to read a sentence without racing it, short enough not to
    // sit over the form the message is about.
    autoClose={4000}
    // Stacked toasts from a burst of failed requests bury the first one, which
    // is usually the informative one.
    limit={3}
    theme={theme}
    {...rest}
  />
);
