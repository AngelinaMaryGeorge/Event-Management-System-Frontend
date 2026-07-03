// src/routes/ProtectedRoutes.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const ProtectedRoutes = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading your session...</div>; 
  }

  // If there is no user, kick them back to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If they are logged in, render the child routes (Outlet)
  return <Outlet />;
};

export default ProtectedRoutes;