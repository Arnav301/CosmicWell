import React, { useState } from 'react';

function SteamLikeCard({ children }){
  return (
    <div className="w-[860px] h-[480px] rounded-xl border border-[#2a2a2e] bg-[#202024]/70 backdrop-blur-md text-gray-200 shadow-[0_20px_70px_rgba(0,0,0,0.55)] overflow-hidden">
      {children}
    </div>
  );
}

function BlueDot(){
  return <span className="inline-block w-2 h-2 rounded-full bg-purple-400 align-middle mr-2"/>;
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

export default function LoginPage(){
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginForm, setLoginForm] = useState({ username:'', password:'', remember:false });
  const [showPwd, setShowPwd] = useState(false);

  const submitLogin = async (e)=>{
    e?.preventDefault?.();
    setError(''); setLoading(true);
    try{
      const user = (loginForm.username||'').trim();
      if (!user || !loginForm.password){
        setError('Please enter both account name and password');
        return;
      }
      try { localStorage.setItem('cw_user_name', user); } catch {}
      const res = await window.electronAPI?.login?.({ ...loginForm, username: user });
      if (!res?.ok) setError(res?.message || 'Invalid credentials');
      // On success, the main process will close this window and open the main one.
    } catch { setError('Login failed'); }
    finally { setLoading(false); }
  };
  // Registration flow removed per request

  return (
    <div className="bg-[#0e1118] rounded-2xl shadow-xl flex items-center justify-center overflow-hidden">
      <SteamLikeCard>
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#2a2a2e]">
          <div className="flex items-center gap-3">
            <SteamMark/>
            <div className="leading-tight">
              <div className="text-white font-bold">CosmicWell</div>
              <div className="text-xs text-gray-400">Sign in to continue</div>
            </div>
          </div>
          {/* In login window we can allow closing via window controls; keep an inline X as well */}
          <button className="text-gray-400 hover:text-white" onClick={()=>window.close?.()}><CloseIcon/></button>
        </div>

        <div className="grid grid-cols-[1.4fr_1fr] gap-10 p-8">
          <div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="uppercase tracking-wide text-purple-400"><BlueDot/>Sign in with account name</span>
              </div>
              <div className="hidden md:block uppercase tracking-wide text-gray-400">&nbsp;</div>
            </div>

            <form onSubmit={submitLogin} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="login-username" className="block text-[11px] uppercase tracking-wide text-gray-400 mb-1">Account name</label>
                  <input id="login-username" placeholder="e.g. cosmic_user" value={loginForm.username} onChange={(e)=>setLoginForm(f=>({...f,username:e.target.value}))} className="w-full h-11 rounded-lg bg-[#27272a] text-sm placeholder:text-gray-400 ring-1 ring-gray-600 px-3 outline-none focus:ring-2 focus:ring-purple-600" />
                </div>
                <div>
                  <label htmlFor="login-password" className="block text-[11px] uppercase tracking-wide text-gray-400 mb-1">Password</label>
                  <div className="relative">
                    <input id="login-password" type={showPwd? 'text':'password'} placeholder="••••••••" value={loginForm.password} onChange={(e)=>setLoginForm(f=>({...f,password:e.target.value}))} className="w-full h-11 rounded-lg bg-[#27272a] text-sm placeholder:text-gray-400 ring-1 ring-gray-600 pl-3 pr-10 outline-none focus:ring-2 focus:ring-purple-600" />
                    <button type="button" onClick={()=>setShowPwd(v=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-xs">
                      {showPwd ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-gray-400 select-none">
                    <input type="checkbox" checked={loginForm.remember} onChange={(e)=>setLoginForm(f=>({...f,remember:e.target.checked}))} />
                    Remember me
                  </label>
                  <button type="button" className="text-xs text-gray-400 hover:text-gray-300 underline decoration-dotted">Forgot password?</button>
                </div>
                {error && <div className="text-xs text-red-400">{error}</div>}
                <button type="submit" disabled={loading} className="relative w-full h-11 rounded-lg bg-purple-600 hover:bg-purple-500 font-semibold shadow disabled:opacity-60">
                  <span className={loading? 'opacity-0':'opacity-100'}>Sign in</span>
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
            <div className="text-center text-xs text-gray-400 uppercase">Or sign in with QR</div>
            <div className="mt-3 rounded-xl bg-white p-3 shadow-inner border border-gray-200">
              <div className="w-48 h-48 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:10px_10px] rounded-lg" />
            </div>
            <div className="text-xs text-gray-400 mt-3 text-center">Scan with your mobile app to sign in securely.</div>
            <div className="text-xs text-gray-400 mt-4 text-center">Don’t have an account? <span className="underline text-purple-400 cursor-pointer" onClick={()=>{ window.location.hash = '#/register'; }}>Create a Free Account</span></div>
          </div>
        </div>
      </SteamLikeCard>
    </div>
  );
}

