import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Context } from "./context/AppContext.js";

const AppWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({});

  // Without useMemo this object is a new reference on every render, so every
  // consumer re-renders even when nothing it reads has changed.
  const value = useMemo(
    () => ({ isAuthenticated, setIsAuthenticated, user, setUser }),
    [isAuthenticated, user]
  );

  return (
    <Context.Provider value={value}>
      <App />
    </Context.Provider>
  );
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
