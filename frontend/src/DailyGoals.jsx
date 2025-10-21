import React, { useEffect, useMemo, useState } from 'react';

const emptyGoal = { id: '', title: '', type: 'count', target: 1, progress: 0, archived: false };

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const GoalRow = ({ goal, onUpdate, onDelete }) => {
  const percent = useMemo(() => {
    const t = Math.max(1, Number(goal.target || 1));
    const p = Math.max(0, Number(goal.progress || 0));
    return Math.min(100, Math.round((p / t) * 100));
  }, [goal.target, goal.progress]);

  return (
    <div className="bg-[#27272a] p-4 rounded-lg flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-white truncate">{goal.title || 'Untitled Goal'}</p>
          <p className="text-xs text-gray-400">{goal.type === 'minutes' ? 'Minutes' : 'Count'} • Target: {goal.target}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 rounded bg-[#3f3f46] text-sm hover:bg-[#52525b]"
            onClick={() => onUpdate({ ...goal, progress: Math.max(0, (goal.progress || 0) - 1) })}
            aria-label="decrement"
          >-</button>
          <span className="w-10 text-center font-semibold">{goal.progress || 0}</span>
          <button
            className="px-3 py-1.5 rounded bg-purple-600 text-white text-sm hover:bg-purple-500"
            onClick={() => onUpdate({ ...goal, progress: (goal.progress || 0) + 1 })}
            aria-label="increment"
          >+</button>
          <button
            className="ml-2 px-3 py-1.5 rounded bg-red-600/80 text-white text-sm hover:bg-red-500"
            onClick={() => onDelete(goal.id)}
          >Delete</button>
        </div>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5">
        <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
};

export default function DailyGoals() {
  const [goals, setGoals] = useState([]);
  const [draft, setDraft] = useState(emptyGoal);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (window.electronAPI?.getGoals) {
      const data = await window.electronAPI.getGoals();
      setGoals(Array.isArray(data) ? data : []);
    }
  };

  const persist = async (next) => {
    if (!window.electronAPI?.saveGoals) return;
    setSaving(true);
    try {
      await window.electronAPI.saveGoals(next);
      setGoals(next);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addGoal = async (e) => {
    e.preventDefault();
    const trimmed = (draft.title || '').trim();
    if (!trimmed) return;
    const newGoal = { ...draft, id: uid(), title: trimmed, target: Math.max(1, Number(draft.target || 1)), progress: 0 };
    const next = [newGoal, ...goals];
    setDraft(emptyGoal);
    await persist(next);
  };

  const updateGoal = async (g) => {
    const next = goals.map((x) => (x.id === g.id ? g : x));
    await persist(next);
  };

  const deleteGoal = async (id) => {
    const next = goals.filter((x) => x.id !== id);
    await persist(next);
  };

  const resetToday = async () => {
    const next = goals.map((g) => ({ ...g, progress: 0 }));
    await persist(next);
  };

  const completedCount = goals.filter((g) => (g.progress || 0) >= Math.max(1, Number(g.target || 1))).length;

  return (
    <div className="max-w-5xl mx-auto px-8 py-12 text-white">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-yellow-400">Daily Goals</h2>
          <p className="text-sm text-gray-400">Set your targets and track progress through the day.</p>
        </div>
        <button
          className="px-4 py-2 rounded bg-[#3f3f46] hover:bg-[#52525b] disabled:opacity-60"
          onClick={resetToday}
          disabled={saving || goals.length === 0}
        >Reset Today</button>
      </header>

      <form onSubmit={addGoal} className="bg-[#27272a] p-5 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <input
          className="md:col-span-2 bg-[#18181b] rounded px-3 py-2 outline-none focus:ring-2 focus:ring-purple-600"
          placeholder="Goal title (e.g., Pomodoros, Reading)"
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
        />
        <select
          className="bg-[#18181b] rounded px-3 py-2"
          value={draft.type}
          onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
        >
          <option value="count">Count</option>
          <option value="minutes">Minutes</option>
        </select>
        <input
          type="number"
          min={1}
          className="bg-[#18181b] rounded px-3 py-2"
          placeholder="Target"
          value={draft.target}
          onChange={(e) => setDraft((d) => ({ ...d, target: e.target.value }))}
        />
        <div className="md:col-span-4 flex justify-end">
          <button type="submit" className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 disabled:opacity-60" disabled={saving}>
            Add Goal
          </button>
        </div>
      </form>

      <section className="mb-6">
        <p className="text-sm text-gray-400">Completed today: {completedCount} / {goals.length}</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.length === 0 ? (
          <div className="bg-[#27272a]/50 p-8 rounded-lg text-center text-gray-500 border-2 border-dashed border-gray-700">
            <p className="font-semibold">No goals yet.</p>
            <p className="text-sm mt-1">Create your first goal above to get started.</p>
          </div>
        ) : (
          goals.map((g) => (
            <GoalRow key={g.id} goal={g} onUpdate={updateGoal} onDelete={deleteGoal} />
          ))
        )}
      </section>
    </div>
  );
}
