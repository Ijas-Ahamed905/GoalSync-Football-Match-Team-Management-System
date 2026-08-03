import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate session on app launch
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Proactively confirm token is still valid with backend
          const freshUser = await api('/api/auth/me');
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch (error) {
          console.error('Session validation failed, logging out:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const data = await api('/api/auth/register', {
        method: 'POST',
        body: { name, email, password, role },
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const changeUserPassword = async (currentPassword, newPassword) => {
    return await api('/api/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    });
  };

  const requestPasswordReset = async (email) => {
    return await api('/api/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  };

  const verifyAndResetPassword = async (email, resetToken, newPassword) => {
    return await api('/api/auth/reset-password', {
      method: 'POST',
      body: { email, resetToken, newPassword },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        changePassword: changeUserPassword,
        forgotPassword: requestPasswordReset,
        resetPassword: verifyAndResetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
