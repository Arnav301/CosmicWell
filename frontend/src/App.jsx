import Background from "./Background"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"
import Hero from "./Hero"
import { useEffect, useState } from "react"
import AppUsagePage from "./AppUsage.jsx"
import SleepTracker from "./SleepTracker.jsx"
import Mindfulness from "./Mindfulness.jsx"
import ScreenTime from "./ScreenTime.jsx"
import Reports from "./Reports.jsx"
import Auth from "./Auth.jsx"
import Settings from "./Settings.jsx"

function App() {
  const [currentPage, setCurrentPage] = useState("Dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [detoxUntil, setDetoxUntil] = useState(null) // timestamp ms
  const [now, setNow] = useState(Date.now())
  const [showDetoxPrompt, setShowDetoxPrompt] = useState(false)
  const [detoxMinutes, setDetoxMinutes] = useState(15)
  const [nightOverlay, setNightOverlay] = useState(false)
  const [user, setUser] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)

  // Detox countdown ticker
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // Load user from localStorage when main window opens after login
  useEffect(() => {
    try {
      const name = localStorage.getItem('cw_user_name')
      if (name) setUser({ name })
    } catch {}
  }, [])

  const remaining = detoxUntil ? Math.max(0, detoxUntil - now) : 0
  const detoxActive = detoxUntil && remaining > 0
  const endDetox = () => setDetoxUntil(null)
  const startDetox = (minutes) => {
    const ms = Math.max(1, Math.floor(Number(minutes) || 0)) * 60 * 1000
    setDetoxUntil(Date.now() + ms)
    setShowDetoxPrompt(false)
  }

  useEffect(() => {
    if (detoxUntil && remaining <= 0) setDetoxUntil(null)
  }, [remaining, detoxUntil])

  // Global quick actions events
  useEffect(() => {
    const onDetox = () => setShowDetoxPrompt(true)
    const onNight = () => setNightOverlay(v => !v)
    const onDetoxMinutes = (e) => {
      const m = Math.max(1, Number(e?.detail?.minutes || 0))
      startDetox(m)
    }
    const onNavigate = (e) => {
      const page = e?.detail?.page
      if (typeof page === 'string') setCurrentPage(page)
    }
    window.addEventListener('app:detox-start', onDetox)
    window.addEventListener('app:night-toggle', onNight)
    window.addEventListener('app:detox-start-minutes', onDetoxMinutes)
    window.addEventListener('app:navigate', onNavigate)
    return () => {
      window.removeEventListener('app:detox-start', onDetox)
      window.removeEventListener('app:night-toggle', onNight)
      window.removeEventListener('app:detox-start-minutes', onDetoxMinutes)
      window.removeEventListener('app:navigate', onNavigate)
    }
  }, [])

  return (
     <Background>
      <div className="flex h-screen">
        {/* --- Sidebar (Fixed on the left) --- */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onOpenChange={setSidebarOpen}
          onDetoxStart={() => setShowDetoxPrompt(true)}
          forceOpen={sidebarOpen}
        />

        {/* --- Main Content Area (Takes remaining space) --- */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* --- Navbar (Stays at the top) --- */}
          <Navbar
            user={user}
            onSignOut={async () => {
              try { localStorage.removeItem('cw_user_name') } catch {}
              setUser(null)
              // Ask main process to close this window and show compact login
              if (window.electronAPI?.logout) {
                await window.electronAPI.logout()
              } else {
                // Fallback in dev browser
                try { window.location.hash = '#/login' } catch {}
              }
            }}
          />

          {/* --- Page Content (Scrollable) --- */}
          <div className={`flex-1 overflow-y-auto p-8 transition ${sidebarOpen ? 'blur-[2px]' : ''} ${detoxActive ? 'pointer-events-none select-none blur-[1px]' : ''}`}>
            {/* This is where your actual page content, charts, 
              and other components will go.
            */}
            {/* Add more components here */}
            {currentPage === "Dashboard" && <Hero />}
            {currentPage === "App Usage" && <AppUsagePage />}
            {currentPage === "Screen Time" && <ScreenTime />}
            {currentPage === "Sleep Tracker" && <SleepTracker />}
            {currentPage === "Mindfulness" && <Mindfulness />}
            {currentPage === "Reports" && <Reports />}
            {currentPage === "Settings" && <Settings />}
            
          </div>

          {/* Digital Detox Time Prompt (Themed) */}
          {showDetoxPrompt && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-[#1f1f22] border border-[#2a2a2e] rounded-xl p-6 w-full max-w-md mx-auto text-white">
                <h3 className="text-xl font-bold mb-2">Start Digital Detox</h3>
                <p className="text-sm text-gray-400 mb-4">Enter duration in minutes or pick a preset.</p>
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="number"
                    min={1}
                    value={detoxMinutes}
                    onChange={(e)=> setDetoxMinutes(Math.max(1, Number(e.target.value || 0)))}
                    className="w-28 bg-[#18181b] border border-[#2a2a2e] rounded-md px-3 py-2"
                  />
                  <span className="text-sm text-gray-400">minutes</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {[5,10,15,25,45,60].map(m => (
                    <button key={m} className={`px-3 py-1.5 rounded-md text-sm ${detoxMinutes===m ? 'bg-purple-600' : 'bg-[#2a2a2e] hover:bg-[#3a3a3f]'}`} onClick={()=>setDetoxMinutes(m)}>
                      {m}m
                    </button>
                  ))}
                </div>
                <div className="flex justify-end gap-3">
                  <button className="px-4 py-2 rounded-md bg-[#2a2a2e] hover:bg-[#3a3a3f]" onClick={()=>setShowDetoxPrompt(false)}>Cancel</button>
                  <button className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-500" onClick={()=>startDetox(detoxMinutes)}>Start</button>
                </div>
              </div>
            </div>
          )}

          {/* Digital Detox Overlay */}
          {detoxActive && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
              <div className="bg-[#1f1f22] border border-[#2a2a2e] rounded-xl p-8 text-center max-w-md mx-auto pointer-events-auto">
                <h2 className="text-2xl font-bold mb-2 text-white">Digital Detox</h2>
                <p className="text-sm text-gray-400 mb-6">Stay away from distractions until the timer ends.</p>
                <div className="text-5xl font-bold text-yellow-400 mb-6">
                  {new Date(remaining).toISOString().substring(11, 19)}
                </div>
                <button className="px-4 py-2 rounded bg-[#2a2a2e] hover:bg-[#3a3a3f] cursor-pointer" onClick={endDetox}>End Now</button>
              </div>
            </div>
          )}

          {/* Auth Modal */}
          <Auth isOpen={authOpen} onClose={() => setAuthOpen(false)} onAuthed={setUser} />

        </main>
      </div>
    </Background>

  )
}

export default App
