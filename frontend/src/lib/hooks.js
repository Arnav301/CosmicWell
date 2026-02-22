import { useState, useEffect, useCallback } from 'react';
import { focusAPI, goalsAPI, sleepAPI, authAPI } from './api';

/**
 * Hook for syncing focus sessions with backend
 */
export function useFocusSync() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Sync a focus session to the backend
   */
  const syncSession = useCallback(async (sessionData) => {
    if (!authAPI.isAuthenticated()) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await focusAPI.startSession({
        duration: sessionData.duration,
        sessionType: sessionData.type || 'focus',
        blockedApps: sessionData.blockedApps || []
      });
      
      return response.success ? response.data : null;
    } catch (err) {
      setError(err.message);
      console.warn('Failed to sync focus session:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * End a synced session
   */
  const endSyncedSession = useCallback(async (sessionId, completed = true) => {
    if (!authAPI.isAuthenticated() || !sessionId) return null;
    
    try {
      const response = await focusAPI.endSession(sessionId, { completed });
      return response.success ? response.data : null;
    } catch (err) {
      console.warn('Failed to end synced session:', err);
      return null;
    }
  }, []);

  /**
   * Get focus stats from backend
   */
  const getStats = useCallback(async () => {
    if (!authAPI.isAuthenticated()) return null;
    
    try {
      const response = await focusAPI.getStats();
      return response.success ? response.data : null;
    } catch (err) {
      console.warn('Failed to get focus stats:', err);
      return null;
    }
  }, []);

  return { syncSession, endSyncedSession, getStats, loading, error };
}

/**
 * Hook for syncing sleep records with backend
 */
export function useSleepSync() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Log a sleep record to the backend
   */
  const logSleep = useCallback(async ({ sleepTime, wakeTime, quality, notes }) => {
    if (!authAPI.isAuthenticated()) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await sleepAPI.logSleep({
        sleepTime,
        wakeTime,
        quality,
        notes
      });
      
      return response.success ? response.data : null;
    } catch (err) {
      setError(err.message);
      console.warn('Failed to log sleep:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get sleep records from backend
   */
  const getRecords = useCallback(async (params = {}) => {
    if (!authAPI.isAuthenticated()) return null;
    
    try {
      const response = await sleepAPI.getRecords(params);
      return response.success ? response.data : null;
    } catch (err) {
      console.warn('Failed to get sleep records:', err);
      return null;
    }
  }, []);

  /**
   * Get sleep stats from backend
   */
  const getStats = useCallback(async () => {
    if (!authAPI.isAuthenticated()) return null;
    
    try {
      const response = await sleepAPI.getStats();
      return response.success ? response.data : null;
    } catch (err) {
      console.warn('Failed to get sleep stats:', err);
      return null;
    }
  }, []);

  return { logSleep, getRecords, getStats, loading, error };
}

/**
 * Hook for syncing daily goals with backend
 */
export function useGoalsSync() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch today's goals from backend
   */
  const fetchTodayGoals = useCallback(async () => {
    if (!authAPI.isAuthenticated()) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await goalsAPI.getTodayGoals();
      if (response.success && response.data) {
        setGoals(response.data);
        return response.data;
      }
      return [];
    } catch (err) {
      setError(err.message);
      console.warn('Failed to fetch goals:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new goal
   */
  const createGoal = useCallback(async (goalData) => {
    if (!authAPI.isAuthenticated()) return null;
    
    try {
      const response = await goalsAPI.createGoal(goalData);
      if (response.success && response.data) {
        setGoals(prev => [...prev, response.data]);
        return response.data;
      }
      return null;
    } catch (err) {
      console.warn('Failed to create goal:', err);
      return null;
    }
  }, []);

  /**
   * Mark a goal as completed
   */
  const completeGoal = useCallback(async (goalId) => {
    if (!authAPI.isAuthenticated()) return false;
    
    try {
      const response = await goalsAPI.completeGoal(goalId);
      if (response.success) {
        setGoals(prev => prev.map(g => 
          g.id === goalId ? { ...g, completed: true } : g
        ));
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Failed to complete goal:', err);
      return false;
    }
  }, []);

  /**
   * Delete a goal
   */
  const deleteGoal = useCallback(async (goalId) => {
    if (!authAPI.isAuthenticated()) return false;
    
    try {
      const response = await goalsAPI.deleteGoal(goalId);
      if (response.success) {
        setGoals(prev => prev.filter(g => g.id !== goalId));
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Failed to delete goal:', err);
      return false;
    }
  }, []);

  // Fetch goals on mount
  useEffect(() => {
    fetchTodayGoals();
  }, [fetchTodayGoals]);

  return { 
    goals, 
    fetchTodayGoals, 
    createGoal, 
    completeGoal, 
    deleteGoal, 
    loading, 
    error 
  };
}

/**
 * Hook for backend connection status
 */
export function useBackendStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/health');
        setIsConnected(response.ok);
      } catch {
        setIsConnected(false);
      } finally {
        setChecking(false);
      }
    };

    checkConnection();
    
    // Re-check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return { isConnected, checking };
}

export default {
  useFocusSync,
  useSleepSync,
  useGoalsSync,
  useBackendStatus
};
