let leaves = []; // { userId, date }

module.exports = {
  getLeaves: (userId, weekStart, weekEnd) =>
    leaves.filter(lv => lv.userId === userId && lv.date >= weekStart && lv.date <= weekEnd),
  addLeave: (entry) => leaves.push(entry),
  hasLeave: (userId, date) =>
    leaves.some(lv => lv.userId === userId && lv.date === date)
};