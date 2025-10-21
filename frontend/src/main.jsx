import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './electronDevShim.js'
import App from './App.jsx'
import React, { useEffect, useState } from 'react'
import LoginPage from './LoginPage.jsx'
import RegisterPage from './RegisterPage.jsx'

function RootSwitcher(){
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const isLogin = hash.startsWith('#/login');
  const isRegister = hash.startsWith('#/register');
  return isLogin ? <LoginPage/> : isRegister ? <RegisterPage/> : <App/>;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootSwitcher />
  </StrictMode>,
)
