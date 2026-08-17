import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Mock authentication state for Phase 1
  const [user, setUser] = useState({
    name: 'Raven K.',
    email: 'raven.k@transitops.in',
    role: 'dispatcher', // Default mock role matching wireframe user profile
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password, role) => {
    setLoading(true);
    setError(null);
    try {
      // Mock login implementation
      setUser({
        name: role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        email: email,
        role: role,
      });
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      setUser(null);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
