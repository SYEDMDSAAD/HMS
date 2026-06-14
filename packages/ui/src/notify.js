import { toast } from "react-toastify";

/**
 * Toasts, in one shape.
 *
 * `apiError` is the reason this file exists. Twelve call sites wrote
 *
 *     toast.error(error.response?.data?.message || "Could not …")
 *
 * by hand, and the optional chaining is load-bearing: a network failure has no
 * `response` at all, so the shorter `error.response.data.message` throws inside
 * the catch block and replaces a useful message with a blank screen.
 *
 * It also draws the line about what the server is allowed to say. A 500 often
 * carries a stack-shaped string that means nothing to a patient, so the caller
 * always supplies a fallback written for a human, and that is what shows when
 * the server has nothing better.
 */
export const notify = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  info: (message) => toast.info(message),
  warning: (message) => toast.warn(message),

  /** @param {unknown} error @param {string} fallback shown to the user */
  apiError: (error, fallback) =>
    toast.error(error?.response?.data?.message || fallback),
};
