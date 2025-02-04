import React, { createContext, useContext, useState, useEffect } from "react";

const LayoutContext = createContext();

export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider = ({ children }) => {
  const [layout, setLayout] = useState("undefined");

  const isElectron = typeof window !== "undefined" && window.platform && window.platform.isElectron;

  useEffect(() => {

    if (isElectron) {
      setLayout("electron");
    } else {
      setLayout("web");
    }
  }, []);

  return (
    <LayoutContext.Provider value={{ layout, setLayout }}>
      {children}
    </LayoutContext.Provider>
  );
};
