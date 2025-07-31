// Simple in-memory store for demo
let timesheets = []; // { userId, date, hours }

module.exports = {
  getTimesheet: (userId, weekStart, weekEnd) =>
    timesheets.filter(ts => ts.userId === userId && ts.date >= weekStart && ts.date <= weekEnd),
  addTimesheet: (entry) => timesheets.push(entry),
  getMissingDates: (userId, weekStart, weekEnd) => {
    const allDates = [];
    let d = new Date(weekStart);
    while (d <= new Date(weekEnd)) {
      allDates.push(d.toISOString().slice(0,10));
      d.setDate(d.getDate() + 1);
    }
    const enteredDates = timesheets.filter(ts => ts.userId === userId && ts.date >= weekStart && ts.date <= weekEnd).map(ts => ts.date);
    return allDates.filter(date => !enteredDates.includes(date));
  }
};