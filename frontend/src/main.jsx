import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/electronDevShim.js'
import App from './App.jsx'
import React, { useEffect, useState } from 'react'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import LogoutRoute from './pages/LogoutRoute.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

function RootSwitcher(){
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const isLogin = hash.startsWith('#/login');
  const isRegister = hash.startsWith('#/register');
  const isLogout = hash.startsWith('#/logout');
  return isLogin ? <LoginPage/> : isRegister ? <RegisterPage/> : isLogout ? <LogoutRoute/> : <App/>;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RootSwitcher />
    </AuthProvider>
  </StrictMode>,
)
