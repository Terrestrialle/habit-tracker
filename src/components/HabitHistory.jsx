function HabitHistory({ history = {} }) {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const today = new Date();
  const todayDay = today.getDay();

  const start = new Date(today);
  start.setDate(today.getDate() - todayDay);

  const days = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    const key = d.toLocaleDateString("sv-SE");

    days.push({
      label: labels[i],
      completed: history[key],
    });
  }

  return (
    <div className="habit-history">
      {days.map((day, index) => (
        <div key={index} className="history-day">
          <div className={`day-box ${day.completed ? "filled" : ""}`}>
            {day.completed ? "✓" : ""}
          </div>

          <div>{day.label}</div>
        </div>
      ))}
    </div>
  );
}

export default HabitHistory;
