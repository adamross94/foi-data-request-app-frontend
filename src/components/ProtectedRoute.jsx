// src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { auth } = useContext(AuthContext);
  if (!auth) {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

export default ProtectedRoute;
