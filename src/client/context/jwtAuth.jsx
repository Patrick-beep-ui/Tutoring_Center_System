import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadToken = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (token) {
        setUserToken(token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Failed to load token", e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (token) => {
    setUserToken(token);
    await AsyncStorage.setItem("jwtToken", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const logout = async () => {
    setUserToken(null);
    await AsyncStorage.removeItem("jwtToken");
    delete axios.defaults.headers.common["Authorization"];
  };

  useEffect(() => {
    loadToken();
  }, []);

  return (
    <AuthContext.Provider value={{ userToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
