import { createContext } from "react";

// Lives in its own module rather than in main.jsx. Previously main.jsx imported
// App.jsx while every component imported Context back from main.jsx — a cycle
// that only worked because Context is never read at module scope. Reading it
// there (a default arg, a module-level helper) would have thrown at import time.
//
// Full default shape, so a consumer rendered outside the provider gets no-op
// setters instead of "setIsAuthenticated is not a function".
export const Context = createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  user: {},
  setUser: () => {},
});
