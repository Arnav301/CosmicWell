import React, { useEffect, useMemo, useRef, useState } from 'react';
import tune from '../assets/tune.mp3';

function formatHMS(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}:${pad(sec)}`;
}

const Breathing = ({ isActive }) => {
  const seq = [
    { p: 'Inhale', n: 4 },
    { p: 'Hold', n: 4 },
    { p: 'Exhale', n: 6 },
    { p: 'Hold', n: 2 },
  ];
  const [idx, setIdx] = useState(0);
  const [remaining, setRemaining] = useState(seq[0].n);
  const step = seq[idx % seq.length];

  useEffect(() => {
    if (!isActive) return; // paused
    const t = setTimeout(() => {
      if (remaining > 1) {
        setRemaining((r) => r - 1);
      } else {
        setIdx((i) => (i + 1) % seq.length);
        setRemaining(seq[(idx + 1) % seq.length].n);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [remaining, idx, isActive]);

  // Reset to start when session stops
  useEffect(() => {
    if (!isActive) {
      setIdx(0);
      setRemaining(seq[0].n);
    }
  }, [isActive]);

  return (
    <div className="p-10 rounded-2xl bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e] flex flex-col items-center justify-center text-center">
      <div className={`w-32 h-32 rounded-full mb-4 grid place-items-center transition-transform duration-700 ${isActive ? (step.p==='Inhale' ? 'scale-110' : step.p==='Exhale' ? 'scale-90' : 'scale-100') : 'scale-100'}`} style={{
        background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.25), rgba(59,130,246,0.15))',
        border: '1px solid rgba(167,139,250,0.35)'
      }}>
        <span className="text-2xl font-bold text-white">{isActive ? remaining : seq[0].n}</span>
      </div>
      <div className="text-sm text-gray-400">Breathing</div>
      <div className="text-2xl font-bold text-white">{isActive ? step.p : 'Inhale'}</div>
      <div className="text-xs text-gray-500 mt-1">{isActive ? 'Follow the rhythm' : 'Start a session to begin'}</div>
    </div>
  );
};

export default function Mindfulness() {
  const [isActive, setIsActive] = useState(false);
  const [startTs, setStartTs] = useState(null);
  const [now, setNow] = useState(Date.now());

  // Built-in relaxing tune
  // Local relaxing tune bundled with the app
  const RELAX_URL = tune;
  const audioRef = useRef(null);
  const [soundOn, setSoundOn] = useState(true);
  const [volume, setVolume] = useState(0.5);

  // Timer
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const elapsed = useMemo(() => {
    if (!isActive || !startTs) return 0;
    return Math.floor((now - startTs) / 1000);
  }, [isActive, startTs, now]);

  // Apply audio settings
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Number(volume ?? 0.5);
      audioRef.current.loop = true;
    }
  }, [volume]);

  const startSession = () => {
    setIsActive(true);
    setStartTs(Date.now());
    // start audio if enabled
    if (audioRef.current && soundOn) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };
  const stopSession = () => {
    setIsActive(false);
    setStartTs(null);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  // Toggle sound while session active
  useEffect(() => {
    if (!audioRef.current) return;
    if (isActive && soundOn) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isActive, soundOn]);

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 text-white">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-yellow-400">Mindfulness</h1>
          <p className="text-sm text-gray-400">Start a calming session with breathing and a built-in relaxing tune.</p>
        </div>
        <div className="flex items-center gap-3">
          {!isActive ? (
            <button className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500" onClick={startSession}>Start Session</button>
          ) : (
            <button className="px-4 py-2 rounded bg-green-600 hover:bg-green-500" onClick={stopSession}>End Session</button>
          )}
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="p-10 rounded-2xl bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e] flex flex-col items-center justify-center">
          <div className="text-gray-400 text-sm mb-2">Session</div>
          <div className="text-4xl font-bold tracking-wider mb-2">{formatHMS(elapsed)}</div>
          <div className="text-xs text-gray-500">{isActive ? 'Running...' : 'Not active'}</div>
        </div>
        <Breathing isActive={isActive} />
        <div className="p-10 rounded-2xl bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e]">
          <div className="text-sm text-gray-400 mb-2">Sound</div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={soundOn} onChange={(e)=>setSoundOn(e.target.checked)} />
              Play relaxing tune during session
            </label>
            <div>
              <label className="text-xs text-gray-400">Volume: {Math.round((volume) * 100)}%</label>
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e)=>setVolume(Number(e.target.value))} className="w-full" />
            </div>
          </div>
          {/* Hidden audio tag */}
          <audio ref={audioRef} src={RELAX_URL} />
        </div>
      </section>

    </div>
  );
}
