import {
  calculateWeeklyCompletion,
  calculateTotalCompletions,
  calculateLongestStreak,
} from "../utils/habitStats";

function HabitStats({ history = {} }) {
  const weekly = calculateWeeklyCompletion(history);
  const total = calculateTotalCompletions(history);
  const best = calculateLongestStreak(history);

  return (
    <div className="habit-stats">
      <div className="stat">
        <span className="stat-value">{weekly}%</span>
        <span className="stat-label">Weekly</span>
      </div>

      <div className="stat">
        <span className="stat-value">{total}</span>
        <span className="stat-label">Total</span>
      </div>

      <div className="stat">
        <span className="stat-value">{best}</span>
        <span className="stat-label">Best</span>
      </div>
    </div>
  );
}

export default HabitStats;
