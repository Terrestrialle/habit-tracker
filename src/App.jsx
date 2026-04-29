import { useState, useEffect } from "react";
import HabitList from "./components/HabitList";
import HabitGrid from "./components/HabitGrid";
import HabitHeatmap from "./components/HabitHeatmap";
import sanitizeInput from "./utils/sanitizeInput";
import {
  calculateConsistencyScore,
  calculateGlobalStats,
} from "./utils/habitStats";

function App() {
  const COLORS = [
    "#22c55e",
    "#3b82f6",
    "#a855f7",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
  ];

  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem("habits");
    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return parsed.map((habit) => ({
      ...habit,
      note: habit.note || "",
      color: habit.color || COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
  });

  const [lastDeleted, setLastDeleted] = useState(null);

  const stats = calculateGlobalStats(habits);
  const consistency = calculateConsistencyScore(habits); // calculateConsistencyScore(habits);

  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);

  const addHabit = (name, note="") => {
    if (habits.length >= 10) {
      alert("Maximum 10 habits");
      return;
    }

    const cleanName = sanitizeInput(name);
    const cleanNote = sanitizeInput(note).slice(0, 200);

    if (!cleanName) return;

    const newHabit = {
      id: Date.now(),
      name: cleanName,
      note: cleanNote,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      history: {},
    };

    setHabits((prev) => [...prev, newHabit]);
  };

  const reorderHabits = (oldIndex, newIndex) => {
    setHabits((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, moved);
      return updated;
    });
  };

  const renameHabit = (id, newName) => {
    const clean = sanitizeInput(newName);

    if (!clean) return;

    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === id ? { ...habit, name: clean } : habit,
      ),
    );
  };

  const updateHabitNote = (id, note) => {
    const clean = sanitizeInput(note).slice(0, 200);

    setHabits((prev) =>
      prev.map((habit) => (habit.id === id ? { ...habit, note: clean } : habit)),
    );
  };

  const updateHabitColor = (id, color) => {
    setHabits((prev) =>
      prev.map((habit) => (habit.id === id ? { ...habit, color } : habit)),
    );
  };

  const deleteHabit = (id) => {
    setHabits((prev) => {
      const habit = prev.find((h) => h.id === id);

      if (!window.confirm(`Delete habit "${habit.name}"?`)) return prev;

      setLastDeleted(habit);

      return prev.filter((h) => h.id !== id);
    });
  };

  const undoDelete = () => {
    if (!lastDeleted) return;

    setHabits((prev) => [...prev, lastDeleted]);
    setLastDeleted(null);
  };

  const toggleHabit = (date, habitId) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit;

        const history = { ...habit.history };

        history[date] = !history[date];

        return {
          ...habit,
          history,
        };
      }),
    );
  };

  return (
    <div className="container">
      <h1>Habit Tracker</h1>
      <h3>Track your daily habits and build better routines</h3>
      <hr />

      <div className="tracker-layout">
        <HabitList
          habits={habits}
          addHabit={addHabit}
          renameHabit={renameHabit}
          deleteHabit={deleteHabit}
          reorderHabits={reorderHabits}
          updateHabitColor={updateHabitColor}
          updateHabitNote={updateHabitNote}
        />

        <HabitGrid habits={habits} toggleHabit={toggleHabit} />
      </div>
      <div className="stats-panel">
        <div>Total Habits: <span className="stat-val">{stats.totalHabits}</span></div>
        <div>Completed Today: <span className="stat-val">{stats.todayCompleted}</span></div>
        <div>Completion Rate: <span className="stat-val">{stats.completionRate}%</span></div>
        <div>Consistency Score: <span className="stat-val">{consistency}%</span></div>
      </div>
      <HabitHeatmap habits={habits} />

      {lastDeleted && (
        <div className="undo-toast">
          Habit deleted
          <button onClick={undoDelete}>Undo</button>
        </div>
      )}
    </div>
  );
}

export default App;
