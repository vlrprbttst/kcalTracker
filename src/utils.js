import { SEED_DIET_DATA, seedItemById } from './seed.js';

export const TODAY = () => new Date().toISOString().slice(0, 10);

export const ACTIVE_DAY = () => {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const m = now.getHours() * 60 + now.getMinutes();
  if (m < 330) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export const genId = () => Math.random().toString(36).slice(2, 8);

export function migrateCountKeys(counts, varGrams) {
  const isOld = key => /^\d+_\d+$/.test(key);
  const hasOld = Object.keys(counts).some(isOld) || Object.keys(varGrams).some(isOld);
  if (!hasOld) return { counts, varGrams, migrated: false };
  const newCounts = {};
  Object.entries(counts).forEach(([key, qty]) => {
    if (isOld(key)) {
      const [ci, ii] = key.split("_").map(Number);
      const item = SEED_DIET_DATA[ci]?.items[ii];
      if (item) newCounts[item.id] = qty;
    } else {
      newCounts[key] = qty;
    }
  });
  const newVarGrams = {};
  Object.entries(varGrams).forEach(([key, g]) => {
    if (isOld(key)) {
      const [ci, ii] = key.split("_").map(Number);
      const item = SEED_DIET_DATA[ci]?.items[ii];
      if (item) newVarGrams[item.id] = g;
    } else {
      newVarGrams[key] = g;
    }
  });
  return { counts: newCounts, varGrams: newVarGrams, migrated: true };
}

export function loadLocalData() {
  try {
    const raw = localStorage.getItem("kcal_data");
    if (!raw) return { counts: {}, extras: [], varGrams: {} };
    const data = JSON.parse(raw);
    if (data.date !== ACTIVE_DAY()) return { counts: {}, extras: [], varGrams: {} };
    const { counts: mc, varGrams, migrated } = migrateCountKeys(data.counts || {}, data.varGrams || {});
    const counts = { ...mc };
    Object.keys(counts).forEach(id => {
      const it = seedItemById[id];
      if (it?.variable && !varGrams[id]) delete counts[id];
    });
    if (migrated) {
      localStorage.setItem("kcal_data", JSON.stringify({ date: ACTIVE_DAY(), counts, extras: data.extras || [], varGrams }));
    }
    return { counts, extras: data.extras || [], varGrams };
  } catch { return { counts: {}, extras: [], varGrams: {} }; }
}

export function loadTarget() {
  return parseInt(localStorage.getItem("kcal_target") || "2000", 10);
}

export function computeTotal(counts, extras, varGrams = {}, itemById = seedItemById) {
  return Object.entries(counts).reduce((sum, [id, qty]) => {
    const item = itemById[id];
    if (!item) return sum;
    if (item.variable) return sum + Math.round((varGrams[id] || 0) * item.kcalPerG) * qty;
    return sum + item.kcal * qty;
  }, 0) + extras.reduce((s, e) => s + e.kcal, 0);
}

export function buildItemsList(counts, extras, varGrams = {}, itemById = seedItemById) {
  const items = [];
  Object.entries(counts).forEach(([id, qty]) => {
    const item = itemById[id];
    if (item && qty > 0) {
      if (item.variable) {
        const g = varGrams[id] || 0;
        const portionKcal = Math.round(g * item.kcalPerG);
        items.push(qty > 1 ? `${item.name} ${g}g ×${qty} (${portionKcal * qty} kcal)` : `${item.name} ${g}g (${portionKcal} kcal)`);
      } else {
        items.push(qty > 1 ? `${item.name} ×${qty}` : item.name);
      }
    }
  });
  extras.forEach(e => items.push(`${e.name} (extra, ${e.kcal} kcal)`));
  return items;
}
