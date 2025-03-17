// src/context/AuthContext.jsx
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const existingToken = localStorage.getItem('token');
  const [auth, setAuth] = useState(existingToken ? { token: existingToken } : null);

  const signIn = (token, user) => {
    localStorage.setItem('token', token);
    setAuth({ token, user });
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
