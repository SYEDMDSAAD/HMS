import { createContext } from "react";

// Lives in its own module rather than in main.jsx. Previously main.jsx imported
// App.jsx while every component imported Context back from main.jsx — a cycle
// that only worked because Context is never read at module scope. Reading it
// there (a default arg, a module-level helper) would have thrown at import time.
//
// One context serves both apps. They previously kept separate copies that
// differed in a single word: the dashboard called the signed-in principal
// `admin` and the patient site called it `user`. It is the same shape from the
// same endpoint either way — an admin *is* a user record with a role — so the
// dashboard now reads `user` too, and there is one file instead of two that
// drift.
//
// Full default shape, so a consumer rendered outside the provider gets no-op
// setters instead of "setIsAuthenticated is not a function".
export const Context = createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  user: {},
  setUser: () => {},
});
