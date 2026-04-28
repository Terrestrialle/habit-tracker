import React, { useMemo, useState } from "react";

function getLocalDate(date = new Date()) {
  return date.toLocaleDateString("sv-SE");
}
function HabitHeatmap({ habits }) {
  const year = new Date().getFullYear();
  const today = getLocalDate();
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: "",
  });
  const [hoverCol, setHoverCol] = useState(null);
  const { cells, months } = useMemo(() => {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    const firstDayOffset = start.getDay();
    const cells = [];
    const months = [];
    for (let i = 0; i < firstDayOffset; i++) {
      cells.push(null);
    }
    let currentMonth = -1;
    for (
      let d = new Date(start);
      d <= end;
      d = new Date(d.getTime() + 86400000)
    ) {
      const date = new Date(d);
      const key = getLocalDate(date);
      if (date.getMonth() !== currentMonth) {
        currentMonth = date.getMonth();
        months.push({
          month: date.toLocaleString("default", { month: "short" }),
          column: Math.floor(cells.length / 7),
        });
      }
      let count = 0;
      for (const habit of habits) {
        if (habit.history[key]) {
          count++;
        }
      }
      cells.push({
        date: key,
        count,
      });
    }
    return { cells, months };
  }, [habits, year]);
  const maxHabits = habits.length || 1;
  const getLevel = (count) => {
    if (count === 0) return "";
    const ratio = count / maxHabits;
    if (ratio <= 0.25) return "level-1";
    if (ratio <= 0.5) return "level-2";
    if (ratio <= 0.75) return "level-3";
    return "level-4";
  };

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="heatmap-wrapper">
      <div className="heatmap-center">
        <h3>{year} Habit Activity</h3>

        {/* Month labels */}
        <div className="month-labels">
          {months.map((m, i) => (
            <div
              key={i}
              className="month-label"
              style={{ gridColumnStart: m.column + 1 }}
            >
              {m.month}
            </div>
          ))}
        </div>

        <div className="heatmap-body">
          {/* Weekday labels */}
          <div className="weekday-labels">
            {weekdays.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Heatmap */}
          <div className="heatmap">
            {cells.map((cell, index) => {
              const row = index % 7;
              const col = Math.floor(index / 7);

              if (!cell) {
                return (
                  <div
                    key={index}
                    className="heatmap-cell empty"
                    style={{
                      gridRow: row + 1,
                      gridColumn: col + 1,
                    }}
                  />
                );
              }

              const level = getLevel(cell.count);

              return (
                <div
                  key={index}
                  className={`heatmap-cell ${level} ${hoverCol === col ? "week-hover" : ""} ${cell.date === today ? "today" : ""}`}
                  style={{
                    gridRow: row + 1,
                    gridColumn: col + 1,
                  }}
                  onMouseEnter={() => {
                    setHoverCol(col);
                    const parts = cell.date.split("-");
                    const date = new Date(
                      parts[0],
                      parts[1] - 1,
                      parts[2],
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                    setTooltip({
                      visible: true,
                      x: 0,
                      y: 0,
                      text: `${date} • ${cell.count} habits`,
                    });
                  }}
                  onMouseMove={(e) => {
                    setTooltip((t) => ({
                      ...t,
                      x: e.clientX,
                      y: e.clientY,
                    }));
                  }}
                  onMouseLeave={() => {
                    setHoverCol(null);
                    setTooltip((t) => ({
                      ...t,
                      visible: false,
                    }));
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="heatmap-legend">
          <span>Less activity</span>
          <div className="heatmap-cell"></div>
          <div className="heatmap-cell level-1"></div>
          <div className="heatmap-cell level-2"></div>
          <div className="heatmap-cell level-3"></div>
          <div className="heatmap-cell level-4"></div>
          <span>More activity</span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="heatmap-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y - 12,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

export default HabitHeatmap;
