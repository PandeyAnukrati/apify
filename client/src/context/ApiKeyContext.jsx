import { createContext, useContext, useState, useEffect } from "react";

const ApiKeyContext = createContext();

export const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error("useApiKey must be used within an ApiKeyProvider");
  }
  return context;
};

export const ApiKeyProvider = ({ children }) => {
  const [apiKey, setApiKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Load API key from localStorage on mount
    const savedApiKey = localStorage.getItem("apify_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsAuthenticated(true);
    }
  }, []);

  const saveApiKey = (key) => {
    setApiKey(key);
    setIsAuthenticated(true);
    localStorage.setItem("apify_api_key", key);
  };

  const clearApiKey = () => {
    setApiKey("");
    setIsAuthenticated(false);
    localStorage.removeItem("apify_api_key");
  };

  const value = {
    apiKey,
    isAuthenticated,
    saveApiKey,
    clearApiKey,
  };

  return (
    <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>
  );
};
