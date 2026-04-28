function HabitRow({ date, habits }) {
  return (
    <div className="grid-row">
      <div className="grid-date">{date}</div>

      {habits.map((habit) => {
        const checked = habit.history?.[date] || false;

        return <input key={habit.id} type="checkbox" checked={checked} />;
      })}
    </div>
  );
}

export default HabitRow;
