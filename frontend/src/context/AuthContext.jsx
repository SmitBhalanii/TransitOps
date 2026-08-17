import React, { createContext, useState, useEffect } from 'react';
import { loginUser, logoutUser, getMeUser } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check auth session on startup
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getMeUser();
        if (response.status === 'success' && response.data.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        // No active session, user remains null (ignore console logs for 401 on startup)
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password, role) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginUser(email, password, role);
      if (response.status === 'success' && response.data.user) {
        setUser(response.data.user);
        setLoading(false);
        return true;
      }
      throw new Error('Unexpected response format');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } catch (err) {
      console.error('Logout error', err);
    } finally {
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
