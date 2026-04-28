export const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString("sv-SE"));
  }
  return days;
};
export const calculateCurrentStreak = (history = {}) => {
  let streak = 0;

  const today = new Date();

  while (true) {
    const key = today.toLocaleDateString("sv-SE");

    if (history[key]) {
      streak++;
      today.setDate(today.getDate() - 1);
    } else {
      // skip today if belum dicentang
      if (streak === 0) {
        today.setDate(today.getDate() - 1);
        const yesterdayKey = today.toLocaleDateString("sv-SE");

        if (history[yesterdayKey]) {
          streak++;
          today.setDate(today.getDate() - 1);
          continue;
        }
      }
      break;
    }
  }

  return streak;
};
export const calculateWeeklyCompletion = (history = {}) => {
  const last7Days = getLast7Days();
  let completed = 0;
  last7Days.forEach((day) => {
    if (history[day]) completed++;
  });
  return Math.round((completed / 7) * 100);
};

export const calculateTotalCompletions = (history = {}) => {
  return Object.values(history).filter(Boolean).length;
};

export const calculateLongestStreak = (history = {}) => {
  const dates = Object.keys(history)
    .filter((date) => history[date])
    .sort();
  let longest = 0;
  let current = 0;
  for (let i = 0; i < dates.length; i++) {
    const today = new Date(dates[i]);
    const prev = new Date(dates[i - 1]);
    if (i === 0) {
      current = 1;
    } else {
      const diff = (today - prev) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        current++;
      } else {
        current = 1;
      }
    }
    if (current > longest) longest = current;
  }
  return longest;
};
export const calculateGlobalStats = (habits = []) => {
  let totalChecks = 0;
  let completedChecks = 0;
  let todayCompleted = 0;

  const today = new Date().toLocaleDateString("sv-SE");

  habits.forEach((habit) => {
    const history = habit.history || {};

    Object.values(history).forEach((done) => {
      totalChecks++;
      if (done) completedChecks++;
    });

    if (history[today]) todayCompleted++;
  });

  const completionRate =
    totalChecks === 0 ? 0 : Math.round((completedChecks / totalChecks) * 100);

  return {
    totalHabits: habits.length,
    todayCompleted,
    completionRate,
  };
};
export const calculateConsistencyScore = (habits = [], days = 30) => {
  const today = new Date();

  let completed = 0;
  let totalPossible = habits.length * days;

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const key = d.toLocaleDateString("sv-SE");

    habits.forEach((habit) => {
      if (habit.history?.[key]) completed++;
    });
  }

  if (totalPossible === 0) return 0;

  return Math.round((completed / totalPossible) * 100);
};
export const calculateGlobalCompletionRate = (habits = []) => {
  let totalDays = 0;
  let completedDays = 0;

  habits.forEach((habit) => {
    const history = habit.history || {};

    Object.values(history).forEach((v) => {
      totalDays++;
      if (v) completedDays++;
    });
  });

  if (totalDays === 0) return 0;

  return Math.round((completedDays / totalDays) * 100);
};
