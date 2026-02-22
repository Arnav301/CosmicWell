/**
 * CosmicWell API Service
 * Handles all HTTP requests to the backend server
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Get stored auth tokens from localStorage
 */
const getTokens = () => {
  try {
    const accessToken = localStorage.getItem('cw_access_token');
    const refreshToken = localStorage.getItem('cw_refresh_token');
    return { accessToken, refreshToken };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
};

/**
 * Store auth tokens in localStorage
 */
const setTokens = (accessToken, refreshToken) => {
  try {
    if (accessToken) localStorage.setItem('cw_access_token', accessToken);
    if (refreshToken) localStorage.setItem('cw_refresh_token', refreshToken);
  } catch (e) {
    console.warn('Failed to store tokens:', e);
  }
};

/**
 * Clear auth tokens from localStorage
 */
const clearTokens = () => {
  try {
    localStorage.removeItem('cw_access_token');
    localStorage.removeItem('cw_refresh_token');
    localStorage.removeItem('cw_user');
  } catch (e) {
    console.warn('Failed to clear tokens:', e);
  }
};

/**
 * Store user data in localStorage
 */
const setUser = (user) => {
  try {
    if (user) localStorage.setItem('cw_user', JSON.stringify(user));
  } catch (e) {
    console.warn('Failed to store user:', e);
  }
};

/**
 * Get stored user from localStorage
 */
const getUser = () => {
  try {
    const user = localStorage.getItem('cw_user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async () => {
  const { refreshToken } = getTokens();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data?.accessToken) {
        setTokens(data.data.accessToken, data.data.refreshToken);
        return data.data.accessToken;
      }
    }
  } catch (e) {
    console.warn('Token refresh failed:', e);
  }

  clearTokens();
  return null;
};

/**
 * Make an authenticated API request
 */
const apiRequest = async (endpoint, options = {}) => {
  const { accessToken } = getTokens();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  // If unauthorized, try to refresh token
  if (response.status === 401 && accessToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });
    }
  }

  const data = await response.json();
  
  if (!response.ok) {
    // Include validation errors in the error message
    if (data.errors && Array.isArray(data.errors)) {
      const errorMsg = data.errors.map(e => e.message || e).join('. ');
      throw new Error(errorMsg || data.message || 'Request failed');
    }
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

// ============================================================================
// Auth API
// ============================================================================

export const authAPI = {
  /**
   * Register a new user
   */
  register: async ({ email, username, password }) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password })
    });

    if (data.success && data.data) {
      setTokens(data.data.accessToken, data.data.refreshToken);
      setUser(data.data.user);
    }

    return data;
  },

  /**
   * Login user
   */
  login: async ({ username, password }) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: username, password }) // Backend expects email
    });

    if (data.success && data.data) {
      setTokens(data.data.accessToken, data.data.refreshToken);
      setUser(data.data.user);
    }

    return data;
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout request failed:', e);
    }
    clearTokens();
  },

  /**
   * Get current user
   */
  getMe: async () => {
    return apiRequest('/auth/me');
  },

  /**
   * Change password
   */
  changePassword: async ({ currentPassword, newPassword }) => {
    return apiRequest('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const { accessToken } = getTokens();
    return !!accessToken;
  },

  /**
   * Get stored user
   */
  getStoredUser: getUser,

  /**
   * Clear session
   */
  clearSession: clearTokens
};

// ============================================================================
// Focus Sessions API
// ============================================================================

export const focusAPI = {
  /**
   * Get all focus sessions for current user
   */
  getSessions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/focus/sessions${query ? `?${query}` : ''}`);
  },

  /**
   * Start a new focus session
   */
  startSession: async ({ duration, sessionType = 'focus', blockedApps = [] }) => {
    return apiRequest('/focus/sessions', {
      method: 'POST',
      body: JSON.stringify({ duration, sessionType, blockedApps })
    });
  },

  /**
   * End a focus session
   */
  endSession: async (sessionId, { completed = true } = {}) => {
    return apiRequest(`/focus/sessions/${sessionId}/end`, {
      method: 'POST',
      body: JSON.stringify({ completed })
    });
  },

  /**
   * Get focus statistics
   */
  getStats: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/focus/stats${query ? `?${query}` : ''}`);
  },

  /**
   * Get daily focus totals
   */
  getDailyTotals: async (days = 7) => {
    return apiRequest(`/focus/daily?days=${days}`);
  }
};

// ============================================================================
// Daily Goals API
// ============================================================================

export const goalsAPI = {
  /**
   * Get all goals for current user
   */
  getGoals: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/goals${query ? `?${query}` : ''}`);
  },

  /**
   * Get today's goals
   */
  getTodayGoals: async () => {
    return apiRequest('/goals/today');
  },

  /**
   * Create a new goal
   */
  createGoal: async ({ title, description, category, targetValue, unit }) => {
    return apiRequest('/goals', {
      method: 'POST',
      body: JSON.stringify({ title, description, category, targetValue, unit })
    });
  },

  /**
   * Update a goal
   */
  updateGoal: async (goalId, updates) => {
    return apiRequest(`/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  /**
   * Mark goal as completed
   */
  completeGoal: async (goalId) => {
    return apiRequest(`/goals/${goalId}/complete`, {
      method: 'POST'
    });
  },

  /**
   * Delete a goal
   */
  deleteGoal: async (goalId) => {
    return apiRequest(`/goals/${goalId}`, {
      method: 'DELETE'
    });
  },

  /**
   * Get goal statistics
   */
  getStats: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/goals/stats${query ? `?${query}` : ''}`);
  }
};

// ============================================================================
// Sleep Tracking API
// ============================================================================

export const sleepAPI = {
  /**
   * Get sleep records
   */
  getRecords: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/sleep${query ? `?${query}` : ''}`);
  },

  /**
   * Log a sleep record
   */
  logSleep: async ({ sleepTime, wakeTime, quality, notes }) => {
    return apiRequest('/sleep', {
      method: 'POST',
      body: JSON.stringify({ sleepTime, wakeTime, quality, notes })
    });
  },

  /**
   * Update a sleep record
   */
  updateRecord: async (recordId, updates) => {
    return apiRequest(`/sleep/${recordId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  /**
   * Delete a sleep record
   */
  deleteRecord: async (recordId) => {
    return apiRequest(`/sleep/${recordId}`, {
      method: 'DELETE'
    });
  },

  /**
   * Get sleep statistics
   */
  getStats: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/sleep/stats${query ? `?${query}` : ''}`);
  },

  /**
   * Get weekly sleep data
   */
  getWeeklyData: async () => {
    return apiRequest('/sleep/weekly');
  }
};

// ============================================================================
// User API
// ============================================================================

export const userAPI = {
  /**
   * Get user profile
   */
  getProfile: async () => {
    return apiRequest('/users/profile');
  },

  /**
   * Update user profile
   */
  updateProfile: async (updates) => {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  /**
   * Get user settings
   */
  getSettings: async () => {
    return apiRequest('/users/settings');
  },

  /**
   * Update user settings
   */
  updateSettings: async (settings) => {
    return apiRequest('/users/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }
};

// ============================================================================
// Health Check
// ============================================================================

export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.ok;
  } catch {
    return false;
  }
};

// Default export with all APIs
export default {
  auth: authAPI,
  focus: focusAPI,
  goals: goalsAPI,
  sleep: sleepAPI,
  user: userAPI,
  healthCheck
};
