import React, { useEffect, useState, memo } from "react";
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
            const token = localStorage.getItem("jwtToken");
            if (!token) {
              console.log("No token found, redirecting to login page");
            }

            const response = await axios.get("/api/auth", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            console.log("Response:", response);
            if (/*response.statusText=== "OK"*/ response?.status === 200 && response.data?.user) {

              setIsAuthenticated(true);
              setUser(response.data.user)
            }
          } catch (error) {
            console.error(error);
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

export default memo(Auth);