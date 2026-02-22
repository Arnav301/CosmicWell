import React, { useState } from 'react';
import { authAPI } from '../lib/api';

function CloseIcon(){
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  );
}

function SteamMark(){
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-gray-100"><path d="M21.9 7.7a9.9 9.9 0 1 0-9.9 9.9l3.9-2a3.9 3.9 0 1 0-3.2-7.1l-2.6 5.1a3 3 0 0 0-2.4 3L5 17.2a2.5 2.5 0 1 0 2.2-4l2.1-4.1a4.9 4.9 0 1 1 6 7.4l-2.6 1.3a9.9 9.9 0 0 0 9.2-10.1Z"/></svg>
  );
}

export default function Auth({ isOpen, onClose, onAuthed }){
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({ username:'', password:'', remember:false });
  const [regForm, setRegForm] = useState({ email:'', username:'', password:'' });

  if (!isOpen) return null;

  const submitLogin = async (e)=>{
    e?.preventDefault?.();
    setError(''); setLoading(true);
    try{
      // Try backend API first, fall back to Electron API
      const response = await authAPI.login({ 
        username: loginForm.username, 
        password: loginForm.password 
      });
      
      if (response.success && response.data?.user) {
        onAuthed?.(response.data.user);
        onClose?.();
      } else {
        setError(response.message || 'Invalid credentials');
      }
    } catch(err) {
      // Fallback to Electron API if backend fails
      if (window.electronAPI?.login) {
        try {
          const res = await window.electronAPI.login(loginForm);
          if (res?.ok) { onAuthed?.(res.user); onClose?.(); }
          else setError(res?.message || 'Invalid credentials');
        } catch {
          setError('Login failed');
        }
      } else {
        setError(err.message || 'Login failed');
      }
    }
    finally{ setLoading(false); }
  };
  
  const submitRegister = async (e)=>{
    e?.preventDefault?.();
    setError(''); setLoading(true);
    try{
      // Try backend API first
      const response = await authAPI.register({
        email: regForm.email,
        username: regForm.username,
        password: regForm.password
      });
      
      if (response.success && response.data?.user) {
        onAuthed?.(response.data.user);
        onClose?.();
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch(err) {
      // Fallback to Electron API if backend fails
      if (window.electronAPI?.register) {
        try {
          const res = await window.electronAPI.register(regForm);
          if (res?.ok) { onAuthed?.(res.user); onClose?.(); }
          else setError(res?.message || 'Registration failed');
        } catch {
          setError('Registration failed');
        }
      } else {
        setError(err.message || 'Registration failed');
      }
    }
    finally{ setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#2c2d31] bg-[#1b1c20] text-gray-200 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2c2d31]">
          <div className="flex items-center gap-3">
            <SteamMark/>
            <div className="leading-tight">
              <div className="text-white font-bold">CosmicWell</div>
              <div className="text-xs text-gray-400">Sign in to your account</div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon/></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Left form */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <button className={`uppercase tracking-wide ${tab==='login'?'text-blue-400':'text-gray-400 hover:text-gray-300'}`} onClick={()=>setTab('login')}>Sign in with account name</button>
              <button className={`uppercase tracking-wide ${tab==='register'?'text-blue-400':'text-gray-400 hover:text-gray-300'}`} onClick={()=>setTab('register')}>Create account</button>
            </div>

            {tab==='login' ? (
              <form onSubmit={submitLogin} className="mt-4 space-y-3">
                <input placeholder="Account name" value={loginForm.username} onChange={(e)=>setLoginForm(f=>({...f,username:e.target.value}))} className="w-full rounded-md bg-[#2a2c30] border border-[#34363b] px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="password" placeholder="Password" value={loginForm.password} onChange={(e)=>setLoginForm(f=>({...f,password:e.target.value}))} className="w-full rounded-md bg-[#2a2c30] border border-[#34363b] px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                <label className="flex items-center gap-2 text-xs text-gray-400 select-none">
                  <input type="checkbox" checked={loginForm.remember} onChange={(e)=>setLoginForm(f=>({...f,remember:e.target.checked}))} />
                  Remember me
                </label>
                {error && <div className="text-xs text-red-400">{error}</div>}
                <button type="submit" disabled={loading} className="w-full rounded-md bg-blue-600 hover:bg-blue-500 py-2 font-semibold disabled:opacity-60">Sign in</button>
                <div className="text-xs text-gray-400 underline decoration-dotted cursor-pointer w-fit">Help, I can't sign in</div>
              </form>
            ) : (
              <form onSubmit={submitRegister} className="mt-4 space-y-3">
                <input placeholder="Email" value={regForm.email} onChange={(e)=>setRegForm(f=>({...f,email:e.target.value}))} className="w-full rounded-md bg-[#2a2c30] border border-[#34363b] px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Account name" value={regForm.username} onChange={(e)=>setRegForm(f=>({...f,username:e.target.value}))} className="w-full rounded-md bg-[#2a2c30] border border-[#34363b] px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="password" placeholder="Password" value={regForm.password} onChange={(e)=>setRegForm(f=>({...f,password:e.target.value}))} className="w-full rounded-md bg-[#2a2c30] border border-[#34363b] px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                {error && <div className="text-xs text-red-400">{error}</div>}
                <button type="submit" disabled={loading} className="w-full rounded-md bg-blue-600 hover:bg-blue-500 py-2 font-semibold disabled:opacity-60">Create account</button>
              </form>
            )}
          </div>

          {/* Right side: QR placeholder and text */}
          <div className="flex flex-col items-center">
            <div className="self-stretch text-right text-xs text-gray-400 uppercase">Or sign in with QR</div>
            <div className="mt-3 rounded-xl bg-white p-3 shadow-inner">
              {/* QR placeholder box */}
              <div className="w-48 h-48 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:10px_10px] rounded-md" />
            </div>
            <div className="text-xs text-gray-400 mt-3 text-center">Scan with your mobile app to sign in securely.</div>
            {tab==='login' && (
              <div className="text-xs text-gray-400 mt-auto pt-6">Don't have an account? <span className="underline cursor-pointer" onClick={()=>setTab('register')}>Create a Free Account</span></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
