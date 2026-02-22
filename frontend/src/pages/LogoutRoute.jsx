import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Logout Page/Route Component
 * Simple component that triggers logout and handles redirection
 */
export default function LogoutRoute() {
  const { logout } = useAuth();
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        // The logout function already handles the redirect to #/login for web,
        // but adding an extra check here just in case.
        if (!window.electronAPI?.logout) {
          window.location.hash = '#/login';
        }
      } catch (e) {
        console.error('Logout route error:', e);
        window.location.hash = '#/login';
      }
    };
    
    performLogout();
  }, [logout]);
  
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#1a1a1d] text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
        <p className="text-gray-400 font-medium tracking-wide">Logging you out...</p>
      </div>
    </div>
  );
}
