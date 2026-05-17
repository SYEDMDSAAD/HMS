import React, { createContext, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Full default shape, so a consumer rendered outside the provider gets no-op
// setters instead of "setIsAuthenticated is not a function".
export const Context = createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  user: {},
  setUser: () => {},
});

const AppWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({});

  // Without useMemo this object is a new reference on every render, so every
  // consumer re-renders even when nothing it reads has changed.
  const value = useMemo(
    () => ({ isAuthenticated, setIsAuthenticated, user, setUser }),
    [isAuthenticated, user]
  );

  return <Context.Provider value={value}>{<App />}</Context.Provider>;
};

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Could not find element with id "root" in index.html.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);
