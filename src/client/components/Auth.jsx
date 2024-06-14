import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";

const Auth = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
          try {
            const response = await axios.get("/api/auth");
            if (response.status === 200) {
              setIsAuthenticated(true);
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
        return <div>Loading...</div>; // This can be replaced with a loading spinner or a different loading animation
      }
    
      return isAuthenticated ? <Outlet /> : null;
};

export default Auth;