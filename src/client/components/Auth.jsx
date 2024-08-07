import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";

const Auth = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
          try {
            const response = await axios.get("/api/auth");
            if (response.status === 200) {
              setIsAuthenticated(true);
              setUser(response.data.user)
            }
          } catch (error) {
            console.error("User is not authenticated");
          } finally {
            setIsLoading(false);
          }
        };
    
        checkAuth();
      }, []);

      useEffect(() => {
        if (!isLoading && !isAuthenticated) {
          navigate("/login");
        }
      }, [isLoading, isAuthenticated, navigate]);
    
      if (isLoading) {
        return (
          <svg viewBox="25 25 50 50" id="loading-state-svg">
            <circle r="20" cy="50" cx="50" id="loading-state"></circle>
          </svg>
        );
      }
    
      return (
        <Outlet context={{ isAuthenticated, user }} />
      );
};

export default Auth;