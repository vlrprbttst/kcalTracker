export const DEFAULT_SCHEDULE = [
  { key: "colazione",   label: "Colazione",            end: 630  },
  { key: "merenda-mat", label: "Merenda metà mattina", end: 720  },
  { key: "pranzo",      label: "Pranzo",               end: 900  },
  { key: "merenda-pom", label: "Merenda pomeriggio",   end: 1140 },
  { key: "cena",        label: "Cena",                 end: 1320 },
];

export const minutesToTime = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export const timeToMinutes = t => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };

export function getMealSlot(ts, schedule) {
  const d = new Date(ts);
  const m = d.getHours() * 60 + d.getMinutes();
  if (m < 330) return { key: "fuori-orario", label: "Fuori Orario" };
  for (const slot of schedule) {
    if (m <= slot.end) return { key: slot.key, label: slot.label };
  }
  return { key: "fuori-orario", label: "Fuori Orario" };
}

export function groupLogByMeal(log, schedule) {
  const groups = {}, order = [];
  log.forEach(entry => {
    const { key, label } = getMealSlot(entry.ts, schedule);
    if (!groups[key]) { groups[key] = { key, label, items: [] }; order.push(key); }
    groups[key].items.push(entry);
  });
  return order.map(k => groups[k]);
}

export function groupEntries(entries) {
  const map = new Map();
  for (const e of entries) {
    const key = e.name + (e.grams > 0 ? `-${e.grams}` : '');
    if (map.has(key)) {
      const g = map.get(key);
      g.count++;
      g.totalKcal += e.kcal;
    } else {
      map.set(key, { ...e, count: 1, totalKcal: e.kcal });
    }
  }
  return Array.from(map.values());
}
