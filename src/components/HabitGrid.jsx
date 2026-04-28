import { useMemo } from "react";
import TodayBar from "./TodayBar";
import {
  calculateCurrentStreak,
  calculateLongestStreak,
} from "../utils/habitStats";
import Tooltip from "./Tooltip";

function HabitGrid({ habits, toggleHabit }) {
  const today = new Date().toISOString().split("T")[0];
  const days = useMemo(() => {
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const now = new Date();
    const start = new Date(now);

    start.setDate(now.getDate() - now.getDay());

    const list = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      list.push({
        date: d.toISOString().split("T")[0],
        label: weekDays[i],
      });
    }

    return list;
  }, []);

  function getWeeklyProgress(habit) {
    let total = 0;

    days.forEach((day) => {
      if (habit.history?.[day.date]) total++;
    });

    return total;
  }
  function getWeekLabel(days) {
    const start = new Date(days[0].date);
    const end = new Date(days[6].date);

    const options = { month: "short", day: "numeric" };

    const startLabel = start.toLocaleDateString("en-US", options);
    const endLabel = end.toLocaleDateString("en-US", options);

    return `${startLabel} — ${endLabel}`;
  }

  return (
    <div className="habit-grid">
      <div className="week-label">Week: {getWeekLabel(days)}</div>
      <TodayBar />

      <div className="grid-header">
        <div className="grid-habit-title">Habit</div>

        {days.map((day) => {
          const isToday = day.date === today;

          return (
            <div
              key={day.date}
              className={`grid-col ${isToday ? "today" : ""}`}
            >
              {day.label}
            </div>
          );
        })}

        <div className="grid-progress-title">Progress</div>
      </div>

      {/* HABIT ROW */}

      {habits.map((habit) => {
        const progress = getWeeklyProgress(habit);
        const percent = Math.round((progress / 7) * 100);
        const streak = calculateCurrentStreak(habit.history);
        const bestStreak = calculateLongestStreak(habit.history);
        const color = habit.color || "#22c55e";
        return (
          <div key={habit.id} className="grid-row">
            <div className="grid-habit-name">
              <span className="habit-title" style={{ color: color }}>
                {habit.name}
              </span>
              <div className="habit-stats">
                <span className="streak">🔥 {streak}</span>
                <span className="best-streak">🏆 {bestStreak}</span>
              </div>
            </div>

            {days.map((day) => {
              const checked = habit.history?.[day.date] || false;
              const isFuture = day.date > today;
              const isToday = day.date === today;

              return (
                <div
                  key={day.date}
                  className={`grid-cell 
                    ${checked ? "checked" : ""}
                    ${isFuture ? "future" : ""}
                    ${isToday ? "today" : ""}
                  `}
                  style={{ background: checked ? color : undefined }}
                  onClick={() => {
                    if (isFuture) return;

                    toggleHabit(day.date, habit.id);
                  }}
                />
              );
            })}

            {/* PROGRESS */}

            <div className="grid-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${percent}%`, background: color }}
                />
              </div>

              <span className="progress-text">{progress}/7</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default HabitGrid;
