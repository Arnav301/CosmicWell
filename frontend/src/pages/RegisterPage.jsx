import React, { useState } from 'react';
import { authAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';

function SteamLikeCard({ children }){
  return (
    <div className="w-[860px] h-[480px] rounded-xl border border-[#2a2a2e] bg-[#202024]/70 backdrop-blur-md text-gray-200 shadow-[0_20px_70px_rgba(0,0,0,0.55)] overflow-hidden">
      {children}
    </div>
  );
}

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

export default function RegisterPage(){
  const { register: authRegisterAction } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [regForm, setRegForm] = useState({ email:'', username:'', password:'' });
  const [showPwd, setShowPwd] = useState(false);

  const submitRegister = async (e)=>{
    e?.preventDefault?.();
    setError(''); setLoading(true);
    try{
      const username = (regForm.username||'').trim();
      const email = (regForm.email||'').trim();
      if (!email || !username || !regForm.password){
        setError('Please fill email, account name and password');
        setLoading(false);
        return;
      }
      
      // Try backend API first
      try {
        const response = await authRegisterAction({ 
          email, 
          username, 
          password: regForm.password 
        });
        
        if (response.ok && response.user) {
          localStorage.setItem('cw_user_name', response);
          localStorage.setItem('cw_user_name', response.user.username || username);
          
          // If running in Electron, notify the main process
          if (window.electronAPI?.register) {
            await window.electronAPI.register({ ...regForm, email, username });
          }
          
          // Redirect to main app
          window.location.hash = '';
          return;
        }
        setError(response.message || 'Registration failed');
      } catch (apiErr) {
        // Fallback to Electron API only
        if (window.electronAPI?.register) {
          localStorage.setItem('cw_user_name', username);
          const res = await window.electronAPI.register({ ...regForm, email, username });
          if (res?.ok) {
            window.location.hash = '';
            return;
          }
          setError(res?.message || 'Registration failed');
        } else {
          setError(apiErr.message || 'Registration failed');
        }
      }
    } catch { setError('Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full bg-[#0e1118] flex items-center justify-center overflow-hidden">
      <SteamLikeCard>
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#2a2a2e]">
          <div className="flex items-center gap-3">
            <SteamMark/>
            <div className="leading-tight">
              <div className="text-white font-bold">CosmicWell</div>
              <div className="text-xs text-gray-400">Create your account</div>
            </div>
          </div>
          <button className="text-gray-400 hover:text-white" onClick={()=>window.close?.()}><CloseIcon/></button>
        </div>

        <div className="grid grid-cols-[1.4fr_1fr] gap-10 p-8">
          <div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="uppercase tracking-wide text-purple-400">Create account</span>
              </div>
              <div className="hidden md:block uppercase tracking-wide text-gray-400">&nbsp;</div>
            </div>

            <form onSubmit={submitRegister} className="mt-4 space-y-4">
              <div>
                <label htmlFor="reg-email" className="block text-[11px] uppercase tracking-wide text-gray-400 mb-1">Email</label>
                <input id="reg-email" placeholder="you@example.com" value={regForm.email} onChange={(e)=>setRegForm(f=>({...f,email:e.target.value}))} className="w-full h-11 rounded-lg bg-[#27272a] text-sm placeholder:text-gray-400 ring-1 ring-gray-600 px-3 outline-none focus:ring-2 focus:ring-purple-600" />
              </div>
              <div>
                <label htmlFor="reg-username" className="block text-[11px] uppercase tracking-wide text-gray-400 mb-1">Account name</label>
                <input id="reg-username" placeholder="Choose a username" value={regForm.username} onChange={(e)=>setRegForm(f=>({...f,username:e.target.value}))} className="w-full h-11 rounded-lg bg-[#27272a] text-sm placeholder:text-gray-400 ring-1 ring-gray-600 px-3 outline-none focus:ring-2 focus:ring-purple-600" />
                <div className="mt-1 text-[10px] text-gray-500">3-30 characters, letters, numbers, underscores only</div>
              </div>
              <div>
                <label htmlFor="reg-password" className="block text-[11px] uppercase tracking-wide text-gray-400 mb-1">Password</label>
                <div className="relative">
                  <input id="reg-password" type={showPwd? 'text':'password'} placeholder="Create a password" value={regForm.password} onChange={(e)=>setRegForm(f=>({...f,password:e.target.value}))} className="w-full h-11 rounded-lg bg-[#27272a] text-sm placeholder:text-gray-400 ring-1 ring-gray-600 pl-3 pr-10 outline-none focus:ring-2 focus:ring-purple-600" />
                  <button type="button" onClick={()=>setShowPwd(v=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-xs">
                    {showPwd ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="mt-2 text-[10px] text-gray-500 space-y-0.5">
                  <div className={regForm.password.length >= 8 ? 'text-green-400' : ''}></div>
                  <div className={/[A-Z]/.test(regForm.password) ? 'text-green-400' : ''}></div>
                  <div className={/[a-z]/.test(regForm.password) ? 'text-green-400' : ''}>• One lowercase letter</div>
                  <div className={/[0-9]/.test(regForm.password) ? 'text-green-400' : ''}>• One number</div>
                </div>
              </div>
              {error && <div className="text-xs text-red-400">{error}</div>}
              <button type="submit" disabled={loading} className="relative w-full h-11 rounded-lg bg-purple-600 hover:bg-purple-500 font-semibold shadow disabled:opacity-60">
                <span className={loading? 'opacity-0':'opacity-100'}>Create account</span>
                {loading && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Right / QR */}
          <div className="flex flex-col items-center md:border-l md:border-[#2a2a2e] md:pl-6">
            <div className="text-center text-xs text-gray-400 uppercase">Or sign up with QR</div>
            <div className="mt-3 rounded-xl bg-white p-3 shadow-inner border border-gray-200">
              <div className="w-48 h-48 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:10px_10px] rounded-lg" />
            </div>
            <div className="text-xs text-gray-400 mt-3 text-center">Scan with your mobile app to continue.</div>
            <div className="text-xs text-gray-400 mt-4 text-center">Already have an account? <span className="underline text-purple-400 cursor-pointer" onClick={()=>{ window.location.hash = '#/login'; }}>Sign in</span></div>
          </div>
        </div>
      </SteamLikeCard>
    </div>
  );
}
