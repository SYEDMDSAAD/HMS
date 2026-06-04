/* Public surface of @uc/client — the browser-side plumbing both apps share.
 *
 * Not UI, which is why it is not in @uc/ui: this is the configured HTTP client
 * and the auth context that every page reads from.
 */

export { api } from "./api.js";
export { Context } from "./AppContext.js";
