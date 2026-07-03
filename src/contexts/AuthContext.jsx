// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../api/authApi';
import axiosInstance from '../services/axiosInstance';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if the user is already logged in when they refresh the page
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Decode the token to make sure it hasn't expired
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            throw new Error('Token expired');
          }

          // Fetch the fresh user profile from your backend
          const response = await axiosInstance.get('/users/profile');
          
          // Using your backend's standardized sendSuccess response format
          setUser(response.data.data.profile); 
        } catch (error) {
          console.error('Authentication failed:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false); // Stop the loading spinner
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    const { token, user } = response.data; // Unpack from standard response
    
    localStorage.setItem('token', token);
    setUser(user);
    return response;
  };

  const register = async (userData) => {
    // Note: Based on our backend, register doesn't return a token, 
    // so they will need to log in right after registering.
    return await registerUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};