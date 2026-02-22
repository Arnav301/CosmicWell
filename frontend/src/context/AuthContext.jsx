import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * Provides authentication state and methods throughout the app
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from stored data
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for stored user
        const storedUser = authAPI.getStoredUser();
        
        if (storedUser && authAPI.isAuthenticated()) {
          // Verify token is still valid
          try {
            const response = await authAPI.getMe();
            if (response.success && response.data) {
              setUser(response.data);
            } else {
              authAPI.clearSession();
            }
          } catch {
            // Token invalid, use stored user for offline mode
            setUser(storedUser);
          }
        }
      } catch (e) {
        console.error('Auth initialization error:', e);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async ({ username, password }) => {
    setError(null);
    try {
      const response = await authAPI.login({ username, password });
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return { ok: true, user: response.data.user };
      }
      return { ok: false, message: response.message || 'Login failed' };
    } catch (e) {
      const message = e.message || 'Login failed';
      setError(message);
      return { ok: false, message };
    }
  }, []);

  /**
   * Register new user
   */
  const register = useCallback(async ({ email, username, password }) => {
    setError(null);
    try {
      const response = await authAPI.register({ email, username, password });
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return { ok: true, user: response.data.user };
      }
      return { ok: false, message: response.message || 'Registration failed' };
    } catch (e) {
      const message = e.message || 'Registration failed';
      setError(message);
      return { ok: false, message };
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      console.warn('Logout error:', e);
    }
    setUser(null);
    setError(null);

    // Notify Electron if available
    if (window.electronAPI?.logout) {
      await window.electronAPI.logout();
    } else {
      // In web, redirect to login page
      window.location.hash = '#/login';
    }
  }, []);

  /**
   * Update user data
   */
  const updateUser = useCallback((updates) => {
    setUser(current => current ? { ...current, ...updates } : null);
  }, []);

  /**
   * Change password
   */
  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    try {
      const response = await authAPI.changePassword({ currentPassword, newPassword });
      return { ok: response.success, message: response.message };
    } catch (e) {
      return { ok: false, message: e.message || 'Password change failed' };
    }
  }, []);

  /**
   * Refresh user data from server
   */
  const refreshUser = useCallback(async () => {
    try {
      const response = await authAPI.getMe();
      if (response.success && response.data) {
        setUser(response.data);
        return true;
      }
    } catch (e) {
      console.warn('Failed to refresh user:', e);
    }
    return false;
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    refreshUser,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
