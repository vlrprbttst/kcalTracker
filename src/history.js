export function getWeekStart(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  const daysSinceFriday = (d.getDay() + 2) % 7;
  const friday = new Date(d);
  friday.setDate(d.getDate() - daysSinceFriday);
  return friday.toISOString().slice(0, 10);
}

export function formatShortDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

export function groupByWeek(history) {
  const weeks = {};
  history.forEach(day => {
    const ws = getWeekStart(day.date);
    if (!weeks[ws]) weeks[ws] = [];
    weeks[ws].push(day);
  });
  return Object.entries(weeks)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([weekStart, days]) => {
      const weekEnd = new Date(weekStart + "T12:00:00");
      weekEnd.setDate(weekEnd.getDate() + 6);
      const weekEndStr = weekEnd.toISOString().slice(0, 10);
      const totalConsumed = days.reduce((s, d) => s + (d.totalKcal || 0), 0);
      const weeklyTarget = days.reduce((s, d) => s + (d.target || 2000), 0);
      const balance = totalConsumed - weeklyTarget;
      return { weekStart, weekEndStr, days: days.sort((a, b) => b.date.localeCompare(a.date)), totalConsumed, weeklyTarget, balance };
    });
}

export function getBimesterOf(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return { year: d.getFullYear(), bim: Math.floor(d.getMonth() / 2) };
}

export function bimesterLabel(year, bim) {
  const months = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
  return `${months[bim * 2]} – ${months[bim * 2 + 1]} ${year}`;
}

export function addBimesters(year, bim, delta) {
  let b = bim + delta, y = year;
  while (b < 0) { b += 6; y--; }
  while (b >= 6) { b -= 6; y++; }
  return { year: y, bim: b };
}

export function getMonthName(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
}
