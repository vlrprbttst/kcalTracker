(() => {
  // src/firebase.js
  var firebaseConfig = {
    apiKey: "AIzaSyBCY1ONerEeZ6Ysa34222hZ-JzJ_rIjcZI",
    authDomain: "kcaltracker-5dd56.firebaseapp.com",
    projectId: "kcaltracker-5dd56",
    storageBucket: "kcaltracker-5dd56.firebasestorage.app",
    messagingSenderId: "857152386346",
    appId: "1:857152386346:web:d28c844e6291c315471a53"
  };
  firebase.initializeApp(firebaseConfig);
  var auth = firebase.auth();
  var db = firebase.firestore();
  var ALLOWED_UID = "f1rMJWrezfORvihvxM5EspY3FsA3";

  // src/seed.js
  var SEED_DIET_DATA = [
    {
      category: "Carboidrati",
      icon: "\u{1F35E}",
      items: [
        { id: "r7m2k9", name: "Rosetta", portion: "120g", kcal: 340 },
        { id: "b4x8q3", name: "Basmati cotto", portion: "g", kcal: 0, variable: true, kcalPerG: 4 / 3 },
        { id: "t6n5p1", name: "Taralli", portion: "1 pacchetto", kcal: 280 },
        { id: "g9j3w7", name: "Gnocchi", portion: "g", kcal: 0, variable: true, kcalPerG: 1.5 },
        { id: "p2c8f6", name: "Pasta", portion: "g", kcal: 0, variable: true, kcalPerG: 3.6 }
      ]
    },
    {
      category: "Carne",
      icon: "\u{1F357}",
      items: [
        { id: "h5v4r2", name: "Pollo", portion: "150g", kcal: 165 }
      ]
    },
    {
      category: "Pesce",
      icon: "\u{1F41F}",
      items: [
        { id: "e8k7n4", name: "Gratinato alle erbe", portion: "\xBD vaschetta", kcal: 400 },
        { id: "c3p9m6", name: "Gratinato ai ceci", portion: "\xBD vaschetta", kcal: 350 },
        { id: "d7q2b5", name: "Gratinato patate/rosmarino", portion: "\xBD vaschetta", kcal: 240 },
        { id: "s4w6j8", name: "Tonno non sgocciolato", portion: "1 scatola", kcal: 200 },
        { id: "f1t9x3", name: "Tonno filo d'olio", portion: "1 scatola", kcal: 150 }
      ]
    },
    {
      category: "Uova",
      icon: "\u{1F95A}",
      items: [{ id: "u6r3k8", name: "Uova strapazzate", portion: "2 uova", kcal: 230 }]
    },
    {
      category: "Secondi vegetali",
      icon: "\u{1F96C}",
      items: [
        { id: "m7h4v9", name: "Miniburger broccoli zucchine e carote", portion: "1 pezzo", kcal: 89 },
        { id: "n2f6p1", name: "Miniburger spinaci", portion: "1 pezzo", kcal: 95 },
        { id: "v5q8k3", name: "Cotoletta vegetale", portion: "1 pezzo", kcal: 220 },
        { id: "w9j2r6", name: "Straccetti di soia al sugo", portion: "1 porzione", kcal: 390 },
        { id: "a4b7x5", name: "Tofu al naturale", portion: "1 porzione", kcal: 190 },
        { id: "c6p1w9", name: "Nuggets croccanti", portion: "\xBD porzione", kcal: 233 }
      ]
    },
    {
      category: "Legumi",
      icon: "\u{1F372}",
      items: [
        { id: "j3x9k2", name: "Borlotti", portion: "1 lattina", kcal: 120 },
        { id: "o8m5t7", name: "Fagioli cannellini", portion: "1 lattina", kcal: 109 }
      ]
    },
    {
      category: "Zuppe",
      icon: "\u{1F35C}",
      items: [
        { id: "t2v8r4", name: "Antichi sapori", portion: "1 porzione", kcal: 350 },
        { id: "m3k6p9", name: "Verdur\xEC Minestrone", portion: "1 porzione", kcal: 230 },
        { id: "s9f2j6", name: "Verdur\xEC Zucca e carota", portion: "1 porzione", kcal: 220 }
      ]
    },
    {
      category: "Contorni",
      icon: "\u{1F966}",
      items: [
        { id: "l6v2n9", name: "Contorno leggerezza", portion: "225g", kcal: 60 },
        { id: "y4p8q1", name: "Contorno tricolore", portion: "225g", kcal: 55 },
        { id: "k7r3n5", name: "Patate al rosmarino", portion: "225g", kcal: 304 }
      ]
    },
    {
      category: "Formaggi",
      icon: "\u{1F9C0}",
      items: [
        { id: "z7j5w4", name: "Mozzarella", portion: "1 pezzo", kcal: 300 },
        { id: "i2n8b6", name: "Parmigiano", portion: "10g", kcal: 40 }
      ]
    },
    {
      category: "Condimenti",
      icon: "\u{1F345}",
      items: [
        { id: "q9r4k3", name: "Passata", portion: "g", kcal: 0, variable: true, kcalPerG: 0.3 },
        { id: "k5t7m2", name: "Curry sauce", portion: "1 porzione", kcal: 300 },
        { id: "x8j3c9", name: "Tikka masala sauce", portion: "g", kcal: 0, variable: true, kcalPerG: 1.32 },
        { id: "c1v6p4", name: "Olio", portion: "g", kcal: 0, variable: true, kcalPerG: 9 },
        { id: "n4k8r2", name: "Zucchero", portion: "1 cucchiaino", kcal: 18 }
      ]
    },
    {
      category: "Merende",
      icon: "\u{1F944}",
      items: [
        { id: "r3q9f7", name: "Yogurt bianco", portion: "1 vasetto", kcal: 50 },
        { id: "m6k2w8", name: "Mela gialla", portion: "1 medio-piccola", kcal: 67 },
        { id: "g4h7r5", name: "Cono gelato medio", portion: "3 gusti cremosi + panna", kcal: 450 },
        { id: "d5n1q8", name: "Latte parz. scremato UHT", portion: "1 tazza (200ml)", kcal: 96 }
      ]
    },
    {
      category: "Altro",
      icon: "\u{1F95F}",
      items: [
        { id: "b9j4n3", name: "Bao", portion: "1 pezzo", kcal: 375 },
        { id: "v2b8m6", name: "Ravioli vapore arancioni", portion: "1 pezzo", kcal: 36 },
        { id: "p5x1k9", name: "Pizza margherita grande", portion: "1 pizza", kcal: 1e3 },
        { id: "e7w4t2", name: "Kebab", portion: "1 panino/piadina farcita", kcal: 1e3 }
      ]
    },
    {
      category: "Fritti",
      icon: "\u{1F35F}",
      items: [
        { id: "a3f9v6", name: "Cotoletta pollo Aia", portion: "1 pezzo", kcal: 200 },
        { id: "f8n2j4", name: "Patatine fritte", portion: "g", kcal: 0, variable: true, kcalPerG: 1.4 },
        { id: "s1r7b5", name: "Sofficino alla pizzaiola", portion: "1 pezzo", kcal: 144 },
        { id: "w6q4x8", name: "Suppl\xEC romano", portion: "1 pezzo", kcal: 250 },
        { id: "h2m5n8", name: "Gran fritto pastellato", portion: "225g", kcal: 315 }
      ]
    },
    {
      category: "Alcol",
      icon: "\u{1F37A}",
      items: [
        { id: "t3m9k2", name: "Tennent's Super grande", portion: "44cl", kcal: 320 },
        { id: "p7h5w6", name: "Tennent's Super piccola", portion: "35.5cl", kcal: 260 },
        { id: "c4j2n8", name: "Ceres Strong Ale piccola", portion: "33cl", kcal: 198 },
        { id: "r9p6k3", name: "Ceres Strong Ale grande", portion: "50cl", kcal: 300 },
        { id: "b5v2m7", name: "Carlsberg Special Brew", portion: "40cl", kcal: 260 }
      ]
    }
  ];
  var seedItemById = {};
  var seedItemCategory = {};
  SEED_DIET_DATA.forEach((cat) => cat.items.forEach((item) => {
    seedItemById[item.id] = item;
    seedItemCategory[item.id] = cat.category;
  }));

  // src/utils.js
  var ACTIVE_DAY = () => {
    const now = /* @__PURE__ */ new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const m = now.getHours() * 60 + now.getMinutes();
    if (m < 330) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  };
  var genId = () => Math.random().toString(36).slice(2, 8);
  function migrateCountKeys(counts, varGrams) {
    const isOld = (key) => /^\d+_\d+$/.test(key);
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
  function loadLocalData() {
    try {
      const raw = localStorage.getItem("kcal_data");
      if (!raw) return { counts: {}, extras: [], varGrams: {} };
      const data = JSON.parse(raw);
      if (data.date !== ACTIVE_DAY()) return { counts: {}, extras: [], varGrams: {} };
      const { counts: mc, varGrams, migrated } = migrateCountKeys(data.counts || {}, data.varGrams || {});
      const counts = { ...mc };
      Object.keys(counts).forEach((id) => {
        const it = seedItemById[id];
        if (it?.variable && !varGrams[id]) delete counts[id];
      });
      if (migrated) {
        localStorage.setItem("kcal_data", JSON.stringify({ date: ACTIVE_DAY(), counts, extras: data.extras || [], varGrams }));
      }
      return { counts, extras: data.extras || [], varGrams };
    } catch {
      return { counts: {}, extras: [], varGrams: {} };
    }
  }
  function loadTarget() {
    return parseInt(localStorage.getItem("kcal_target") || "2000", 10);
  }
  function computeTotal(counts, extras, varGrams = {}, itemById = seedItemById) {
    return Object.entries(counts).reduce((sum, [id, qty]) => {
      const item = itemById[id];
      if (!item) return sum;
      if (item.variable) return sum + Math.round((varGrams[id] || 0) * item.kcalPerG) * qty;
      return sum + item.kcal * qty;
    }, 0) + extras.reduce((s, e) => s + e.kcal, 0);
  }
  function buildItemsList(counts, extras, varGrams = {}, itemById = seedItemById) {
    const items = [];
    Object.entries(counts).forEach(([id, qty]) => {
      const item = itemById[id];
      if (item && qty > 0) {
        if (item.variable) {
          const g = varGrams[id] || 0;
          const portionKcal = Math.round(g * item.kcalPerG);
          items.push(qty > 1 ? `${item.name} ${g}g \xD7${qty} (${portionKcal * qty} kcal)` : `${item.name} ${g}g (${portionKcal} kcal)`);
        } else {
          items.push(qty > 1 ? `${item.name} \xD7${qty}` : item.name);
        }
      }
    });
    extras.forEach((e) => items.push(`${e.name} (extra, ${e.kcal} kcal)`));
    return items;
  }

  // src/schedule.js
  var DEFAULT_SCHEDULE = [
    { key: "colazione", label: "Colazione", end: 630 },
    { key: "merenda-mat", label: "Merenda met\xE0 mattina", end: 720 },
    { key: "pranzo", label: "Pranzo", end: 900 },
    { key: "merenda-pom", label: "Merenda pomeriggio", end: 1140 },
    { key: "cena", label: "Cena", end: 1320 }
  ];
  var minutesToTime = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  var timeToMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + (m || 0);
  };
  function getMealSlot(ts, schedule) {
    const d = new Date(ts);
    const m = d.getHours() * 60 + d.getMinutes();
    if (m < 330) return { key: "fuori-orario", label: "Fuori Orario" };
    for (const slot of schedule) {
      if (m <= slot.end) return { key: slot.key, label: slot.label };
    }
    return { key: "fuori-orario", label: "Fuori Orario" };
  }
  function groupLogByMeal(log, schedule) {
    const groups = {}, order = [];
    log.forEach((entry) => {
      const { key, label } = getMealSlot(entry.ts, schedule);
      if (!groups[key]) {
        groups[key] = { key, label, items: [] };
        order.push(key);
      }
      groups[key].items.push(entry);
    });
    return order.map((k) => groups[k]);
  }
  function groupEntries(entries) {
    const map = /* @__PURE__ */ new Map();
    for (const e of entries) {
      const key = e.name + (e.grams > 0 ? `-${e.grams}` : "");
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

  // src/history.js
  function getWeekStart(dateStr) {
    const d = /* @__PURE__ */ new Date(dateStr + "T12:00:00");
    const daysSinceFriday = (d.getDay() + 2) % 7;
    const friday = new Date(d);
    friday.setDate(d.getDate() - daysSinceFriday);
    return friday.toISOString().slice(0, 10);
  }
  function formatShortDate(dateStr) {
    const d = /* @__PURE__ */ new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  }
  function groupByWeek(history) {
    const weeks = {};
    history.forEach((day) => {
      const ws = getWeekStart(day.date);
      if (!weeks[ws]) weeks[ws] = [];
      weeks[ws].push(day);
    });
    return Object.entries(weeks).sort(([a], [b]) => b.localeCompare(a)).map(([weekStart, days]) => {
      const weekEnd = /* @__PURE__ */ new Date(weekStart + "T12:00:00");
      weekEnd.setDate(weekEnd.getDate() + 6);
      const weekEndStr = weekEnd.toISOString().slice(0, 10);
      const totalConsumed = days.reduce((s, d) => s + (d.totalKcal || 0), 0);
      const weeklyTarget = days.reduce((s, d) => s + (d.target || 2e3), 0);
      const balance = totalConsumed - weeklyTarget;
      return { weekStart, weekEndStr, days: days.sort((a, b) => b.date.localeCompare(a.date)), totalConsumed, weeklyTarget, balance };
    });
  }
  function getBimesterOf(dateStr) {
    const d = /* @__PURE__ */ new Date(dateStr + "T12:00:00");
    return { year: d.getFullYear(), bim: Math.floor(d.getMonth() / 2) };
  }
  function bimesterLabel(year, bim) {
    const months = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
    return `${months[bim * 2]} \u2013 ${months[bim * 2 + 1]} ${year}`;
  }
  function addBimesters(year, bim, delta) {
    let b = bim + delta, y = year;
    while (b < 0) {
      b += 6;
      y--;
    }
    while (b >= 6) {
      b -= 6;
      y++;
    }
    return { year: y, bim: b };
  }
  function getMonthName(dateStr) {
    const d = /* @__PURE__ */ new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
  }
  function formatDate(dateStr) {
    const d = /* @__PURE__ */ new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
  }

  // src/components/ConfirmModal.jsx
  function ConfirmModal({ modal, onClose }) {
    if (!modal) return null;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "modal-overlay",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "confirm-title",
        onKeyDown: (e) => {
          if (e.key === "Escape") onClose();
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: "modal" }, /* @__PURE__ */ React.createElement("div", { id: "confirm-title", className: "modal-title" }, modal.title), /* @__PURE__ */ React.createElement("div", { className: "modal-text" }, modal.message), /* @__PURE__ */ React.createElement("div", { className: "modal-actions" }, /* @__PURE__ */ React.createElement("button", { className: "modal-btn-ghost", onClick: onClose }, "Annulla"), /* @__PURE__ */ React.createElement(
        "button",
        {
          className: modal.danger ? "modal-btn-danger" : "modal-btn",
          onClick: () => {
            modal.onConfirm();
            onClose();
          }
        },
        "Conferma"
      )))
    );
  }

  // src/components/SettingsOverlay.jsx
  function SettingsOverlay({ open, setOpen, wizardOpen, draft, setDraft, onSave }) {
    if (!open) return null;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "settings-overlay",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": "Impostazioni",
        onKeyDown: (e) => {
          if (e.key === "Escape" && !wizardOpen) setOpen(false);
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: "settings-header" }, /* @__PURE__ */ React.createElement("div", { className: "settings-header-inner" }, /* @__PURE__ */ React.createElement("button", { className: "settings-close", onClick: () => setOpen(false), "aria-label": "Chiudi impostazioni", autoFocus: true }, "\xD7"), /* @__PURE__ */ React.createElement("span", { className: "settings-title" }, "Impostazioni"))),
      /* @__PURE__ */ React.createElement("div", { className: "settings-body" }, /* @__PURE__ */ React.createElement("section", { className: "settings-section" }, /* @__PURE__ */ React.createElement("h2", { className: "settings-section-title" }, "Calorie giornaliere"), /* @__PURE__ */ React.createElement("p", { className: "settings-section-desc" }, "Quante calorie bruci in media ogni giorno (TDEE). Sar\xE0 il tuo obiettivo di default per i nuovi giorni. Puoi sempre modificarlo per un giorno specifico dallo Storico."), /* @__PURE__ */ React.createElement("div", { className: "settings-field" }, /* @__PURE__ */ React.createElement("label", { className: "settings-label", htmlFor: "settings-default-kcal" }, "Calorie al giorno"), /* @__PURE__ */ React.createElement(
        "input",
        {
          id: "settings-default-kcal",
          className: "settings-input",
          type: "number",
          min: "500",
          max: "9999",
          value: draft.defaultKcal,
          onChange: (e) => setDraft((d) => ({ ...d, defaultKcal: e.target.value }))
        }
      ))), /* @__PURE__ */ React.createElement("section", { className: "settings-section" }, /* @__PURE__ */ React.createElement("h2", { className: "settings-section-title" }, "Fasce orarie"), /* @__PURE__ */ React.createElement("p", { className: "settings-section-desc" }, "Orari di fine di ogni fascia pasto. Si applicano a tutto lo storico, anche ai giorni passati."), /* @__PURE__ */ React.createElement("div", { className: "orari-tab settings-orari" }, /* @__PURE__ */ React.createElement("div", { className: "orari-slot orari-slot-fixed" }, /* @__PURE__ */ React.createElement("span", { className: "orari-label-text" }, "Fuori Orario"), /* @__PURE__ */ React.createElement("span", { className: "orari-range-text" }, "00:00 \u2014 05:29")), draft.schedule.map((slot, i) => {
        const startMin = i === 0 ? 330 : draft.schedule[i - 1].end + 1;
        const prevEnd = i === 0 ? 329 : draft.schedule[i - 1].end;
        const nextEnd = i === draft.schedule.length - 1 ? 1440 : draft.schedule[i + 1].end;
        return /* @__PURE__ */ React.createElement("div", { key: slot.key, className: "orari-slot" }, /* @__PURE__ */ React.createElement(
          "input",
          {
            className: "orari-label-input",
            "aria-label": `Nome fascia ${slot.label}`,
            value: slot.label,
            onChange: (e) => {
              const newSchedule = draft.schedule.map((s, j) => j === i ? { ...s, label: e.target.value } : s);
              setDraft((d) => ({ ...d, schedule: newSchedule }));
            }
          }
        ), /* @__PURE__ */ React.createElement("div", { className: "orari-times" }, /* @__PURE__ */ React.createElement("span", { className: "orari-start" }, minutesToTime(startMin)), /* @__PURE__ */ React.createElement("span", { className: "orari-sep" }, "\u2014"), /* @__PURE__ */ React.createElement(
          "input",
          {
            key: `time-${slot.key}-${slot.end}`,
            type: "text",
            inputMode: "numeric",
            placeholder: "HH:MM",
            className: "orari-time-input",
            "aria-label": `Fine fascia ${slot.label}`,
            defaultValue: minutesToTime(slot.end),
            onBlur: (e) => {
              const raw = e.target.value.trim();
              if (!raw.match(/^\d{1,2}:\d{2}$/)) {
                e.target.value = minutesToTime(slot.end);
                return;
              }
              const newEnd = timeToMinutes(raw);
              if (isNaN(newEnd) || newEnd <= prevEnd || newEnd >= nextEnd) {
                e.target.value = minutesToTime(slot.end);
                return;
              }
              const newSchedule = draft.schedule.map((s, j) => j === i ? { ...s, end: newEnd } : s);
              setDraft((d) => ({ ...d, schedule: newSchedule }));
            }
          }
        )));
      }), /* @__PURE__ */ React.createElement("div", { className: "orari-slot orari-slot-fixed" }, /* @__PURE__ */ React.createElement("span", { className: "orari-label-text" }, "Fuori Orario"), /* @__PURE__ */ React.createElement("span", { className: "orari-range-text" }, minutesToTime(draft.schedule[draft.schedule.length - 1].end + 1), " \u2014 23:59"))))),
      /* @__PURE__ */ React.createElement("div", { className: "settings-footer" }, /* @__PURE__ */ React.createElement("div", { className: "settings-footer-inner" }, /* @__PURE__ */ React.createElement("button", { className: "settings-save-btn", onClick: onSave }, "Salva")))
    );
  }

  // src/components/Wizard.jsx
  var { useState, useEffect } = React;
  var WIZARD_STEPS = [
    {
      tab: null,
      selector: null,
      title: "Benvenuto in kcalTracker",
      text: "Questa guida ti mostra le funzionalit\xE0 principali. Puoi riaprirla in qualsiasi momento dal pulsante \u{1F9D9} nell'header."
    },
    {
      tab: null,
      selector: ".header-top-right",
      title: "I controlli dell'app",
      text: "Da sinistra: \u274C azzera le calorie del giorno, {themeIcon} cambia tema, \u{1F9D9} riapri questa guida, e il tuo avatar per aprire il menu profilo."
    },
    {
      tab: null,
      selector: ".kcal-row",
      selectorEnd: ".progress-track",
      title: "Il contatore calorie",
      text: "Il numero grande sono le kcal assunte oggi. A destra il tuo obiettivo; la differenza ti dice quante kcal ti rimangono (o di quanto hai sforato). La barra sotto si riempie man mano che mangi: diventa gialla avvicinandoti all'obiettivo e rossa se lo superi."
    },
    {
      tab: "oggi",
      selector: ".category-card",
      title: "Tracker calorie",
      text: "Gli alimenti sono divisi per categoria. Apri un accordion e usa + e \u2212 per registrare le porzioni. Il totale si aggiorna in tempo reale."
    },
    {
      tab: "oggi",
      selector: ".category-card",
      last: true,
      title: "Alimenti extra",
      text: "Hai mangiato qualcosa fuori dalla lista? Aggiungilo con nome e calorie. Viene sommato al totale della giornata."
    },
    {
      tab: "alimenti",
      selector: "[data-wizard='alimenti-tab']",
      title: "Gestisci i tuoi alimenti",
      text: "Dal tab Alimenti puoi costruire la tua lista personalizzata: categorie, porzioni e calorie tutte configurabili."
    },
    {
      tab: "alimenti",
      selector: ".admin-add-cat-btn",
      title: "Aggiungi categorie e alimenti",
      text: "Crea le tue categorie e aggiungi alimenti con porzioni e calorie. Puoi trascinare le righe per riordinare."
    },
    {
      tab: "storico",
      selector: "[data-wizard='storico-tab']",
      title: "Storico settimanale",
      text: "Qui trovi il riepilogo di ogni settimana: calorie consumate, deficit o surplus e una proiezione di fine settimana. Si popola automaticamente giorno dopo giorno."
    },
    {
      tab: null,
      openProfileMenu: true,
      selector: ".profile-menu-wrap",
      selectorEnd: ".profile-dropdown",
      title: "Menu profilo",
      text: "Clicca sull'avatar in alto a destra per aprire questo menu: trovi le impostazioni dell'app e il pulsante per uscire dall'account."
    },
    {
      tab: null,
      openSettings: true,
      selector: ".settings-section",
      title: "Calorie giornaliere",
      text: "Qui imposti quante calorie bruci mediamente ogni giorno (il tuo TDEE). Sar\xE0 l'obiettivo di default per ogni nuovo giorno \u2014 puoi sempre modificarlo per un giorno specifico dallo Storico."
    },
    {
      tab: null,
      openSettings: true,
      selector: ".settings-section",
      last: true,
      title: "Fasce orarie",
      text: "Personalizza gli orari di fine di ogni fascia pasto. L'app li usa per raggruppare gli alimenti nel tab Menu e nello Storico. Le modifiche si applicano a tutto lo storico."
    }
  ];
  function Wizard({ open, step, setStep, setOpen, lightTheme, setActiveTab, activeTab }) {
    const [spotlightRect, setSpotlightRect] = useState(null);
    useEffect(() => {
      if (!open) {
        setSpotlightRect(null);
        return;
      }
      const s = WIZARD_STEPS[step];
      if (!s.selector) {
        setSpotlightRect(null);
        return;
      }
      const t = setTimeout(() => {
        const els = document.querySelectorAll(s.selector);
        const el = s.last ? els[els.length - 1] : els[0];
        if (el) {
          el.scrollIntoView({ block: "center", behavior: "instant" });
          requestAnimationFrame(() => requestAnimationFrame(() => {
            const r = el.getBoundingClientRect();
            const el2 = s.selectorEnd ? document.querySelector(s.selectorEnd) : null;
            if (el2) {
              const r2 = el2.getBoundingClientRect();
              const top = Math.min(r.top, r2.top) - 8;
              const left = Math.min(r.left, r2.left) - 8;
              const right = Math.max(r.right, r2.right) + 8;
              const bottom = Math.max(r.bottom, r2.bottom) + 8;
              setSpotlightRect({ top, left, width: right - left, height: bottom - top });
            } else {
              setSpotlightRect({ top: r.top - 8, left: r.left - 8, width: r.width + 16, height: r.height + 16 });
            }
          }));
        }
      }, 400);
      return () => clearTimeout(t);
    }, [open, step, activeTab]);
    if (!open) return null;
    const tooltipStyle = (() => {
      const TOOLTIP_H = 240, MARGIN = 12;
      const H2 = window.innerHeight;
      if (!spotlightRect) return { top: H2 / 2 - TOOLTIP_H / 2, left: "50%", transform: "translateX(-50%)" };
      const belowTop = spotlightRect.top + spotlightRect.height + MARGIN;
      const aboveTop = spotlightRect.top - TOOLTIP_H - MARGIN;
      const fitsBelow = belowTop + TOOLTIP_H + MARGIN <= H2;
      const fitsAbove = aboveTop >= MARGIN;
      let topPx;
      if (fitsBelow) topPx = belowTop;
      else if (fitsAbove) topPx = aboveTop;
      else topPx = Math.min(Math.max(belowTop, MARGIN), H2 - TOOLTIP_H - MARGIN);
      return { top: topPx, left: "50%", transform: "translateX(-50%)" };
    })();
    const W = window.innerWidth, H = window.innerHeight;
    const eff = spotlightRect ?? { top: H / 2, left: W / 2, width: 0, height: 0 };
    const { top: sT, left: sL, width: sW, height: sH } = eff;
    const sR = sL + sW, sB = sT + sH;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "wiz-mask", style: { top: 0, left: 0, width: W, height: sT } }), /* @__PURE__ */ React.createElement("div", { className: "wiz-mask", style: { top: sT, left: 0, width: sL, height: sH } }), /* @__PURE__ */ React.createElement("div", { className: "wiz-mask", style: { top: sT, left: sR, width: Math.max(0, W - sR), height: sH } }), /* @__PURE__ */ React.createElement("div", { className: "wiz-mask", style: { top: sB, left: 0, width: W, height: Math.max(0, H - sB) } }), spotlightRect && /* @__PURE__ */ React.createElement("div", { className: "wizard-spotlight-border", style: { top: sT, left: sL, width: sW, height: sH } }), /* @__PURE__ */ React.createElement("div", { className: "wizard-tooltip", style: tooltipStyle, role: "dialog", "aria-modal": "true", "aria-labelledby": "wizard-title" }, /* @__PURE__ */ React.createElement("button", { className: "wizard-close", onClick: () => setOpen(false), "aria-label": "Chiudi guida" }, "\xD7"), /* @__PURE__ */ React.createElement("div", { className: "wizard-step-body" }, /* @__PURE__ */ React.createElement("div", { className: "wizard-step-indicator" }, step + 1, " / ", WIZARD_STEPS.length), /* @__PURE__ */ React.createElement("div", { id: "wizard-title", className: "wizard-title" }, WIZARD_STEPS[step].title), /* @__PURE__ */ React.createElement("div", { className: "wizard-text" }, WIZARD_STEPS[step].text.replace("{themeIcon}", lightTheme ? "\u{1F319}" : "\u2600\uFE0F")), /* @__PURE__ */ React.createElement("div", { className: "wizard-actions" }, /* @__PURE__ */ React.createElement("div", { className: "wizard-actions-left" }, step > 0 && /* @__PURE__ */ React.createElement("button", { className: "wizard-btn-back", onClick: () => setStep((s) => s - 1) }, "\u2190 Indietro")), /* @__PURE__ */ React.createElement("div", { className: "wizard-actions-right" }, step < WIZARD_STEPS.length - 1 ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { className: "wizard-btn-skip", onClick: () => setOpen(false) }, "Salta"), /* @__PURE__ */ React.createElement("button", { className: "wizard-btn-next", onClick: () => setStep((s) => s + 1) }, "Avanti \u2192")) : /* @__PURE__ */ React.createElement("button", { className: "wizard-btn-next", onClick: () => {
      setOpen(false);
      setActiveTab("oggi");
    } }, "Fatto!"))))));
  }

  // src/tabs/MenuTab.jsx
  function MenuTab({ log, schedule }) {
    const alcolLog = log.filter((e) => e.category === "Alcol");
    const foodLog = log.filter((e) => e.category !== "Alcol");
    return /* @__PURE__ */ React.createElement("div", { className: "menu-tab" }, groupLogByMeal(foodLog, schedule).map(({ key, label, items }) => {
      const slotTotal = items.reduce((s, e) => s + e.kcal, 0);
      return /* @__PURE__ */ React.createElement("div", { key, className: "meal-group" }, /* @__PURE__ */ React.createElement("div", { className: "meal-group-header" }, /* @__PURE__ */ React.createElement("span", { className: "meal-group-label" }, label), /* @__PURE__ */ React.createElement("span", { className: "meal-group-total" }, slotTotal, " kcal")), groupEntries(items).map((entry, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "meal-entry" }, /* @__PURE__ */ React.createElement("span", { className: "meal-entry-name" }, entry.name, entry.grams > 0 ? ` ${entry.grams}g` : "", entry.count > 1 ? ` \xD7${entry.count}` : ""), /* @__PURE__ */ React.createElement("span", { className: "meal-entry-kcal" }, entry.totalKcal > 0 ? `${entry.totalKcal} kcal` : "\u2013"))));
    }), alcolLog.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "meal-group meal-group-extra" }, /* @__PURE__ */ React.createElement("div", { className: "meal-group-header" }, /* @__PURE__ */ React.createElement("span", { className: "meal-group-label" }, "\u{1F37A} Extra"), /* @__PURE__ */ React.createElement("span", { className: "meal-group-total" }, alcolLog.reduce((s, e) => s + e.kcal, 0), " kcal")), groupEntries(alcolLog).map((entry, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "meal-entry" }, /* @__PURE__ */ React.createElement("span", { className: "meal-entry-name" }, entry.name, entry.count > 1 ? ` \xD7${entry.count}` : ""), /* @__PURE__ */ React.createElement("span", { className: "meal-entry-kcal" }, entry.totalKcal, " kcal")))), /* @__PURE__ */ React.createElement("div", { className: "menu-legend" }, /* @__PURE__ */ React.createElement("div", { className: "menu-legend-title" }, "Fasce orarie"), /* @__PURE__ */ React.createElement("div", { className: "menu-legend-row" }, /* @__PURE__ */ React.createElement("span", null, "Fuori Orario"), /* @__PURE__ */ React.createElement("span", null, "00:00 \u2013 05:29")), schedule.map((slot, i) => {
      const startMin = i === 0 ? 330 : schedule[i - 1].end + 1;
      return /* @__PURE__ */ React.createElement("div", { key: slot.key, className: "menu-legend-row" }, /* @__PURE__ */ React.createElement("span", null, slot.label), /* @__PURE__ */ React.createElement("span", null, minutesToTime(startMin), " \u2013 ", minutesToTime(slot.end)));
    }), /* @__PURE__ */ React.createElement("div", { className: "menu-legend-row" }, /* @__PURE__ */ React.createElement("span", null, "Fuori Orario"), /* @__PURE__ */ React.createElement("span", null, minutesToTime(schedule[schedule.length - 1].end + 1), " \u2013 23:59"))));
  }

  // src/tabs/StoricoTab.jsx
  function StoricoTab({
    historyLoading,
    history,
    currentPage,
    setCurrentPage,
    openWeeks,
    toggleWeek,
    editingDayTarget,
    setEditingDayTarget,
    saveDayTarget,
    target,
    totalKcal,
    schedule
  }) {
    if (historyLoading) return /* @__PURE__ */ React.createElement("div", { className: "history-empty" }, "Caricamento...");
    const { year: curYear, bim: curBim } = getBimesterOf(ACTIVE_DAY());
    const currentWeekStart = getWeekStart(ACTIVE_DAY());
    const pageHistory = history.filter((d) => {
      const { year, bim } = getBimesterOf(d.date);
      return year === currentPage.year && bim === currentPage.bim;
    });
    const weeks = groupByWeek(pageHistory);
    const hasPrev = history.some((d) => {
      const { year, bim } = getBimesterOf(d.date);
      return year < currentPage.year || year === currentPage.year && bim < currentPage.bim;
    });
    const isCurrentPage = currentPage.year === curYear && currentPage.bim === curBim;
    let lastMonth = null;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "bimester-nav" }, /* @__PURE__ */ React.createElement("button", { className: "bimester-btn", onClick: () => setCurrentPage((p) => addBimesters(p.year, p.bim, -1)), disabled: !hasPrev }, "\u2190 prec"), /* @__PURE__ */ React.createElement("span", { className: "bimester-label" }, bimesterLabel(currentPage.year, currentPage.bim)), /* @__PURE__ */ React.createElement("button", { className: "bimester-btn", onClick: () => setCurrentPage((p) => addBimesters(p.year, p.bim, 1)), disabled: isCurrentPage }, "succ \u2192")), weeks.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "history-empty" }, "Nessun dato in questo periodo.") : weeks.map((week, i) => {
      const isCurrentWeek = week.weekStart === currentWeekStart;
      const isOpen = isCurrentWeek || openWeeks.has(week.weekStart);
      const weekMonth = getMonthName(week.weekStart);
      const showMonthHeader = weekMonth !== lastMonth;
      lastMonth = weekMonth;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, showMonthHeader && /* @__PURE__ */ React.createElement("div", { className: "month-label" }, weekMonth), /* @__PURE__ */ React.createElement("div", { className: "week-card" }, isCurrentWeek ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "week-current-header" }, "Settimana in corso \xB7 ", formatShortDate(week.weekStart), " \u2192 ", formatShortDate(week.weekEndStr)), (() => {
        const activeDay = ACTIVE_DAY();
        const d = /* @__PURE__ */ new Date(activeDay + "T12:00:00");
        const daysFromFriday = (d.getDay() + 2) % 7;
        if (daysFromFriday < 3) return null;
        const weekKcal = week.days.reduce((s, day) => s + (day.totalKcal || 0), 0);
        const daysAfterToday = 6 - daysFromFriday;
        const projectedTotal = weekKcal + Math.max(totalKcal, target) + target * daysAfterToday;
        const pastDaysTarget = week.days.reduce((s, day) => s + (day.target || 2e3), 0);
        const weeklyProjectedTarget = pastDaysTarget + target + target * daysAfterToday;
        const projectedSurplus = projectedTotal - weeklyProjectedTarget;
        const weightDelta = (Math.abs(projectedSurplus) / 7700).toFixed(2);
        if (projectedSurplus > 0) return /* @__PURE__ */ React.createElement("div", { className: "surplus-snackbar" }, /* @__PURE__ */ React.createElement("span", { className: "surplus-snackbar-icon" }, "\u26A0\uFE0F"), /* @__PURE__ */ React.createElement("div", { className: "surplus-snackbar-text" }, /* @__PURE__ */ React.createElement("strong", null, "Surplus ad oggi: +", projectedSurplus.toLocaleString("it-IT"), " kcal"), /* @__PURE__ */ React.createElement("span", null, "A fine settimana potresti aumentare di circa ", weightDelta, " kg")));
        return /* @__PURE__ */ React.createElement("div", { className: "deficit-snackbar" }, /* @__PURE__ */ React.createElement("span", { className: "surplus-snackbar-icon" }, "\u2705"), /* @__PURE__ */ React.createElement("div", { className: "surplus-snackbar-text" }, /* @__PURE__ */ React.createElement("strong", null, "Deficit ad oggi: ", projectedSurplus.toLocaleString("it-IT"), " kcal"), /* @__PURE__ */ React.createElement("span", null, "A fine settimana potresti perdere circa ", weightDelta, " kg")));
      })()) : (() => {
        const incomplete = week.days.length < 7;
        return /* @__PURE__ */ React.createElement("div", { className: `week-accordion-header${incomplete ? " incomplete" : ""}`, onClick: () => toggleWeek(week.weekStart) }, /* @__PURE__ */ React.createElement("div", { className: "week-acc-left" }, /* @__PURE__ */ React.createElement("span", { className: "week-acc-dates" }, incomplete && "\u26A0\uFE0F ", formatShortDate(week.weekStart), " \u2192 ", formatShortDate(week.weekEndStr), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 400, color: "var(--text-dimmer)", marginLeft: 6 } }, week.days.length, "/7 giorni"))), !incomplete && /* @__PURE__ */ React.createElement("span", { className: `week-acc-balance ${week.balance <= 0 ? "deficit" : "surplus"}` }, week.balance <= 0 ? `\u2705 Deficit ${Math.abs(week.balance).toLocaleString("it-IT")} kcal` : `\u26A0\uFE0F Surplus ${week.balance.toLocaleString("it-IT")} kcal`), /* @__PURE__ */ React.createElement("span", { className: `week-acc-arrow${isOpen ? " open" : ""}` }, "\u25BC"));
      })(), isOpen && /* @__PURE__ */ React.createElement(React.Fragment, null, week.days.map((day, j) => /* @__PURE__ */ React.createElement("div", { key: j, className: "history-day", style: { borderRadius: 0, border: "none", borderTop: j > 0 ? "1px solid var(--border)" : "none" } }, /* @__PURE__ */ React.createElement("div", { className: "history-day-header" }, /* @__PURE__ */ React.createElement("span", { className: "history-day-date" }, formatDate(day.date)), /* @__PURE__ */ React.createElement("span", { className: "history-day-kcal", style: { color: day.totalKcal > day.target ? "var(--color-negative)" : "var(--color-positive)" } }, day.totalKcal, " kcal", isCurrentWeek || week.days.length === 7 ? editingDayTarget?.date === day.date ? /* @__PURE__ */ React.createElement(
        "input",
        {
          className: "history-day-target-input",
          type: "number",
          value: editingDayTarget.draft,
          onChange: (e) => setEditingDayTarget((prev) => ({ ...prev, draft: e.target.value })),
          onBlur: () => saveDayTarget(day.date),
          onKeyDown: (e) => {
            if (e.key === "Enter") saveDayTarget(day.date);
            if (e.key === "Escape") setEditingDayTarget(null);
          },
          autoFocus: true,
          "aria-label": `Obiettivo calorico per ${day.date}`
        }
      ) : /* @__PURE__ */ React.createElement("span", { className: "history-day-target", onClick: () => setEditingDayTarget({ date: day.date, draft: String(day.target || 2e3) }), role: "button", tabIndex: 0, onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") setEditingDayTarget({ date: day.date, draft: String(day.target || 2e3) });
      }, "aria-label": `Obiettivo ${day.date}: ${day.target || 2e3} kcal. Premi per modificare` }, "di ", day.target || 2e3) : /* @__PURE__ */ React.createElement("span", { className: "history-day-target", style: { cursor: "default", borderBottom: "none" } }, "di ", day.target || 2e3))), day.log && day.log.length > 0 ? (() => {
        const alcolLog = day.log.filter((e) => e.category === "Alcol");
        const foodLog = day.log.filter((e) => e.category !== "Alcol");
        return /* @__PURE__ */ React.createElement("div", { className: "history-log-groups" }, groupLogByMeal(foodLog, schedule).map(({ key, label, items }) => /* @__PURE__ */ React.createElement("div", { key, className: "history-log-group" }, /* @__PURE__ */ React.createElement("span", { className: "history-log-label" }, label, ": "), /* @__PURE__ */ React.createElement("span", { className: "history-log-items" }, groupEntries(items).map((e) => e.name + (e.grams > 0 ? ` ${e.grams}g` : "") + (e.count > 1 ? ` \xD7${e.count}` : "")).join(", ")))), alcolLog.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "history-log-group" }, /* @__PURE__ */ React.createElement("span", { className: "history-log-label" }, "\u{1F37A} Extra: "), /* @__PURE__ */ React.createElement("span", { className: "history-log-items" }, groupEntries(alcolLog).map((e) => e.name + (e.count > 1 ? ` \xD7${e.count}` : "")).join(", "))));
      })() : day.items && day.items.length > 0 ? /* @__PURE__ */ React.createElement("div", { className: "history-items" }, day.items.join(" \xB7 ")) : null)), /* @__PURE__ */ React.createElement("div", { className: "week-summary" }, /* @__PURE__ */ React.createElement("div", { className: "week-summary-row" }, /* @__PURE__ */ React.createElement("span", null, "Media settimanale"), /* @__PURE__ */ React.createElement("span", null, (isCurrentWeek ? week.days.reduce((s, d) => s + (d.target || 2e3), 0) + target * (7 - week.days.length) : week.days.length < 7 ? 14e3 : week.weeklyTarget).toLocaleString("it-IT"), " kcal")), /* @__PURE__ */ React.createElement("div", { className: "week-summary-row" }, /* @__PURE__ */ React.createElement("span", null, "Calorie assunte"), /* @__PURE__ */ React.createElement("span", null, week.totalConsumed.toLocaleString("it-IT"), " kcal")), !isCurrentWeek && week.days.length < 7 && /* @__PURE__ */ React.createElement("div", { className: "week-incomplete-note" }, "\u26A0\uFE0F Dati parziali \u2014 ", 7 - week.days.length, " ", 7 - week.days.length === 1 ? "giorno non tracciato" : "giorni non tracciati", ". Il balance potrebbe non essere accurato."), (!isCurrentWeek || ACTIVE_DAY() === week.weekEndStr) && week.days.length === 7 && /* @__PURE__ */ React.createElement("div", { className: "week-balance" }, week.balance <= 0 ? /* @__PURE__ */ React.createElement("span", { className: "week-weight-delta deficit" }, "\u{1F389} potresti aver perso circa ", (Math.abs(week.balance) / 7700).toFixed(2), " kg") : /* @__PURE__ */ React.createElement("span", { className: "week-weight-delta surplus" }, "\u26A0\uFE0F potresti aver preso circa ", (Math.abs(week.balance) / 7700).toFixed(2), " kg"))))));
    }));
  }

  // src/tabs/AlimentiAdminTab.jsx
  var { useState: useState2, useEffect: useEffect2, useRef } = React;
  function AlimentiAdminTab({
    user,
    dietData,
    setDietData,
    counts,
    itemById,
    setConfirmModal,
    adminSearchQuery,
    setAdminSearchQuery
  }) {
    const [adminEditId, setAdminEditId2] = useState2(null);
    const [adminEditDraft, setAdminEditDraft] = useState2({});
    const [adminNewItem, setAdminNewItem2] = useState2(null);
    const [adminNewCat, setAdminNewCat] = useState2(false);
    const [adminNewCatDraft, setAdminNewCatDraft] = useState2({ name: "", icon: "" });
    const [adminEditCat, setAdminEditCat] = useState2(null);
    const [adminEditCatDraft, setAdminEditCatDraft] = useState2({ name: "", icon: "" });
    const [adminOpenCats, setAdminOpenCats] = useState2(/* @__PURE__ */ new Set());
    const sortableCatsRef = useRef(null);
    const sortableItemRefs = useRef({});
    const sortableItemInstances = useRef({});
    const isDraggingRef = useRef(false);
    const hoverOpenTimerRef = useRef(null);
    const hoverOpenCatRef = useRef(null);
    const handleTouchMoveRef = useRef(null);
    const adminOpenCatsRef = useRef(adminOpenCats);
    const dietDataRef = useRef(dietData);
    const userRef = useRef(user);
    useEffect2(() => {
      userRef.current = user;
    }, [user]);
    useEffect2(() => {
      adminOpenCatsRef.current = adminOpenCats;
    }, [adminOpenCats]);
    useEffect2(() => {
      dietDataRef.current = dietData;
    }, [dietData]);
    useEffect2(() => {
      if (typeof Sortable === "undefined") return;
      adminOpenCats.forEach((catName) => {
        const el = sortableItemRefs.current[catName];
        if (!el) return;
        if (sortableItemInstances.current[catName] && sortableItemInstances.current[catName].el !== el) {
          try {
            sortableItemInstances.current[catName].destroy();
          } catch {
          }
          delete sortableItemInstances.current[catName];
        }
        if (sortableItemInstances.current[catName]) return;
        sortableItemInstances.current[catName] = Sortable.create(el, {
          animation: 150,
          handle: ".admin-drag-handle",
          ghostClass: "admin-drag-ghost",
          group: "items",
          onStart: () => {
            isDraggingRef.current = true;
            handleTouchMoveRef.current = (e) => {
              const touch = e.touches[0];
              if (!touch) return;
              const els = document.elementsFromPoint(touch.clientX, touch.clientY);
              const catRow = els.find((el2) => el2.dataset && el2.dataset.hoverCat);
              const catName2 = catRow ? catRow.dataset.hoverCat : null;
              if (catName2 === hoverOpenCatRef.current) return;
              clearTimeout(hoverOpenTimerRef.current);
              hoverOpenCatRef.current = catName2;
              if (catName2 && !adminOpenCatsRef.current.has(catName2)) {
                hoverOpenTimerRef.current = setTimeout(() => {
                  setAdminOpenCats((prev) => {
                    const next = new Set(prev);
                    next.add(catName2);
                    return next;
                  });
                }, 600);
              }
            };
            document.addEventListener("touchmove", handleTouchMoveRef.current, { passive: true });
          },
          onEnd: (evt) => {
            isDraggingRef.current = false;
            clearTimeout(hoverOpenTimerRef.current);
            hoverOpenCatRef.current = null;
            if (handleTouchMoveRef.current) {
              document.removeEventListener("touchmove", handleTouchMoveRef.current);
              handleTouchMoveRef.current = null;
            }
            const { oldIndex, newIndex, from, to } = evt;
            if (from !== el) return;
            const fromCat = from.dataset.category;
            const toCat = to.dataset.category;
            if (fromCat === toCat && oldIndex === newIndex) return;
            if (from !== to) {
              from.insertBefore(evt.item, from.children[oldIndex] || null);
            }
            const u = userRef.current;
            const newData = dietDataRef.current.map((cat) => ({ ...cat, items: [...cat.items] }));
            const srcCat = newData.find((c) => c.category === fromCat);
            const dstCat = newData.find((c) => c.category === toCat);
            if (!srcCat || !dstCat) return;
            const [moved] = srcCat.items.splice(oldIndex, 1);
            dstCat.items.splice(newIndex, 0, moved);
            setDietData(newData);
            if (u) {
              db.collection("users").doc(u.uid).collection("config").doc("foods").set({ dietData: newData }).catch((e) => console.error("Diet save error:", e));
            }
          }
        });
      });
      Object.keys(sortableItemInstances.current).forEach((catName) => {
        if (!adminOpenCats.has(catName)) {
          try {
            sortableItemInstances.current[catName].destroy();
          } catch {
          }
          delete sortableItemInstances.current[catName];
        }
      });
    }, [adminOpenCats, adminSearchQuery]);
    useEffect2(() => {
      return () => {
        Object.values(sortableItemInstances.current).forEach((s) => {
          try {
            s.destroy();
          } catch {
          }
        });
        sortableItemInstances.current = {};
      };
    }, []);
    useEffect2(() => {
      if (typeof Sortable === "undefined" || !sortableCatsRef.current) return;
      const sortable = Sortable.create(sortableCatsRef.current, {
        animation: 150,
        handle: ".admin-cat-drag-handle",
        ghostClass: "admin-drag-ghost",
        onEnd: (evt) => {
          const { oldIndex, newIndex } = evt;
          if (oldIndex === newIndex) return;
          const u = userRef.current;
          const newData = [...dietDataRef.current];
          const [moved] = newData.splice(oldIndex, 1);
          newData.splice(newIndex, 0, moved);
          setDietData(newData);
          if (u) {
            db.collection("users").doc(u.uid).collection("config").doc("foods").set({ dietData: newData }).catch((e) => console.error("Diet save error:", e));
          }
        }
      });
      return () => {
        try {
          sortable.destroy();
        } catch {
        }
      };
    }, [adminSearchQuery]);
    const saveDietToFirestore = (newDietData) => {
      if (!user) return;
      db.collection("users").doc(user.uid).collection("config").doc("foods").set({ dietData: newDietData }).catch((e) => console.error("Diet save error:", e));
    };
    const startEditItem = (item) => {
      setAdminNewItem2(null);
      setAdminEditId2(item.id);
      setAdminEditDraft({
        name: item.name,
        kcal: item.variable ? "" : String(item.kcal),
        portion: item.portion || "",
        variable: !!item.variable,
        kcalPerG: item.variable ? String(item.kcalPerG) : "",
        refGrams: "100",
        refKcal: item.variable ? String(Math.round(item.kcalPerG * 100)) : ""
      });
    };
    const saveEditedItem = (itemId) => {
      const d = adminEditDraft;
      if (!d.name.trim()) return;
      let computedKcalPerG = null;
      if (d.variable) {
        const g = parseFloat(d.refGrams);
        const k = parseFloat(d.refKcal);
        if (isNaN(g) || g <= 0 || isNaN(k) || k < 0) return;
        computedKcalPerG = k / g;
      } else {
        const k = parseInt(d.kcal, 10);
        if (isNaN(k) || k < 0) return;
      }
      const newDietData = dietData.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => {
          if (item.id !== itemId) return item;
          if (d.variable) {
            return { id: item.id, name: d.name.trim(), portion: d.portion.trim() || "g", kcal: 0, variable: true, kcalPerG: computedKcalPerG };
          }
          return { id: item.id, name: d.name.trim(), portion: d.portion.trim(), kcal: parseInt(d.kcal, 10) };
        })
      }));
      setDietData(newDietData);
      saveDietToFirestore(newDietData);
      setAdminEditId2(null);
    };
    const deleteItem = (itemId) => {
      const item = itemById[itemId];
      const hasCount = (counts[itemId] || 0) > 0;
      const message = hasCount ? `"${item?.name}" ha ${counts[itemId]} porzioni registrate oggi. Il conteggio di oggi non verr\xE0 modificato.` : `Eliminare "${item?.name}" dalla lista?`;
      setConfirmModal({
        title: "Elimina alimento",
        message,
        danger: true,
        onConfirm: () => {
          const newDietData = dietData.map((cat) => ({
            ...cat,
            items: cat.items.filter((i) => i.id !== itemId)
          }));
          setDietData(newDietData);
          saveDietToFirestore(newDietData);
          if (adminEditId === itemId) setAdminEditId2(null);
        }
      });
    };
    const addNewItem = (catIdx) => {
      const form = adminNewItem;
      if (!form || !form.name.trim()) return;
      let computedKcalPerG = null;
      if (form.variable) {
        const g = parseFloat(form.refGrams);
        const k = parseFloat(form.refKcal);
        if (isNaN(g) || g <= 0 || isNaN(k) || k < 0) return;
        computedKcalPerG = k / g;
      } else {
        const k = parseInt(form.kcal, 10);
        if (isNaN(k) || k < 0) return;
      }
      const newId = genId();
      const newItem = form.variable ? { id: newId, name: form.name.trim(), portion: form.portion.trim() || "g", kcal: 0, variable: true, kcalPerG: computedKcalPerG } : { id: newId, name: form.name.trim(), portion: form.portion.trim(), kcal: parseInt(form.kcal, 10) };
      const newDietData = dietData.map(
        (cat, ci) => ci !== catIdx ? cat : { ...cat, items: [...cat.items, newItem] }
      );
      setDietData(newDietData);
      saveDietToFirestore(newDietData);
      setAdminNewItem2(null);
    };
    const addNewCategory = () => {
      const name = adminNewCatDraft.name.trim();
      if (!name) return;
      const icon = adminNewCatDraft.icon.trim() || "\u{1F37D}\uFE0F";
      const newDietData = [...dietData, { category: name, icon, items: [] }];
      setDietData(newDietData);
      saveDietToFirestore(newDietData);
      setAdminNewCat(false);
      setAdminNewCatDraft({ name: "", icon: "" });
    };
    const startEditCategory = (cat) => {
      setAdminEditCat(cat.category);
      setAdminEditCatDraft({ name: cat.category, icon: cat.icon });
    };
    const saveEditedCategory = () => {
      const name = adminEditCatDraft.name.trim();
      if (!name) return;
      const icon = adminEditCatDraft.icon.trim() || "\u{1F37D}\uFE0F";
      const oldName = adminEditCat;
      const newDietData = dietData.map(
        (cat) => cat.category !== oldName ? cat : { ...cat, category: name, icon }
      );
      if (oldName !== name) {
        setAdminOpenCats((prev) => {
          if (!prev.has(oldName)) return prev;
          const next = new Set(prev);
          next.delete(oldName);
          next.add(name);
          return next;
        });
      }
      setDietData(newDietData);
      saveDietToFirestore(newDietData);
      setAdminEditCat(null);
    };
    const deleteCategory = (catIdx) => {
      const cat = dietData[catIdx];
      const message = cat.items.length > 0 ? `La categoria "${cat.category}" contiene ${cat.items.length} aliment${cat.items.length === 1 ? "o" : "i"}. Eliminare tutto?` : `Eliminare la categoria "${cat.category}"?`;
      setConfirmModal({
        title: "Elimina categoria",
        message,
        danger: true,
        onConfirm: () => {
          const newDietData = dietData.filter((_, i) => i !== catIdx);
          setDietData(newDietData);
          saveDietToFirestore(newDietData);
          setAdminOpenCats((prev) => {
            const next = new Set(prev);
            next.delete(cat.category);
            return next;
          });
          if (adminEditCat === cat.category) setAdminEditCat(null);
        }
      });
    };
    return /* @__PURE__ */ React.createElement("div", { className: "admin-tab" }, adminSearchQuery.trim() ? (() => {
      const q = adminSearchQuery.trim().toLowerCase();
      const highlight = (name) => {
        const idx = name.toLowerCase().indexOf(q);
        if (idx === -1) return name;
        return /* @__PURE__ */ React.createElement(React.Fragment, null, name.slice(0, idx), /* @__PURE__ */ React.createElement("span", { className: "search-highlight" }, name.slice(idx, idx + q.length)), name.slice(idx + q.length));
      };
      const results = dietData.flatMap((cat, catIdx) => {
        const items = cat.items.filter((item) => item.name.toLowerCase().includes(q));
        return items.length ? [{ cat, catIdx, items }] : [];
      });
      if (!results.length) return /* @__PURE__ */ React.createElement("div", { style: { padding: "24px 0", textAlign: "center", color: "var(--text-dim)", fontSize: 14 } }, "Nessun alimento trovato");
      return results.map(({ cat, items }) => /* @__PURE__ */ React.createElement("div", { key: cat.category, className: "category-card" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "category-btn", "aria-expanded": "true", style: { cursor: "default" } }, /* @__PURE__ */ React.createElement("span", { className: "cat-icon", "aria-hidden": "true" }, cat.icon), /* @__PURE__ */ React.createElement("span", { className: "cat-name" }, cat.category), /* @__PURE__ */ React.createElement("span", { className: "cat-meta" }, items.length, " ", items.length === 1 ? "alimento" : "alimenti")), /* @__PURE__ */ React.createElement("div", { className: "admin-items-list" }, items.map((item) => /* @__PURE__ */ React.createElement("div", { key: item.id, className: "admin-item-row" }, /* @__PURE__ */ React.createElement("div", { className: "admin-item-info", style: { paddingLeft: 10 } }, /* @__PURE__ */ React.createElement("span", { className: "admin-item-name" }, highlight(item.name)), /* @__PURE__ */ React.createElement("span", { className: "admin-item-meta" }, item.variable ? `${Math.round(item.kcalPerG * 100)} kcal/100g` : `${item.kcal} kcal`, item.portion ? ` \xB7 ${item.portion}` : "")), /* @__PURE__ */ React.createElement("div", { className: "admin-item-actions" }, /* @__PURE__ */ React.createElement("button", { className: "admin-icon-btn", onClick: () => {
        setAdminSearchQuery("");
        setAdminOpenCats((prev) => {
          const next = new Set(prev);
          next.add(cat.category);
          return next;
        });
        startEditItem(item);
      }, "aria-label": `Modifica ${item.name}` }, "\u270F\uFE0F"), /* @__PURE__ */ React.createElement("button", { className: "admin-icon-btn admin-icon-btn-delete", onClick: () => deleteItem(item.id), "aria-label": `Elimina ${item.name}` }, "\u{1F5D1}\uFE0F")))))));
    })() : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { ref: sortableCatsRef }, dietData.map((cat, catIdx) => {
      const isOpen = adminOpenCats.has(cat.category);
      return /* @__PURE__ */ React.createElement("div", { key: cat.category, className: "category-card" }, adminEditCat === cat.category ? /* @__PURE__ */ React.createElement("div", { className: "admin-form", style: { margin: "6px 10px" } }, /* @__PURE__ */ React.createElement(
        "input",
        {
          className: "admin-input admin-input-name",
          "aria-label": "Nome categoria",
          placeholder: "Nome categoria",
          value: adminEditCatDraft.name,
          onChange: (e) => setAdminEditCatDraft((d) => ({ ...d, name: e.target.value })),
          onKeyDown: (e) => {
            if (e.key === "Enter") saveEditedCategory();
            if (e.key === "Escape") setAdminEditCat(null);
          },
          autoFocus: true
        }
      ), /* @__PURE__ */ React.createElement(
        "input",
        {
          className: "admin-input admin-input-icon",
          "aria-label": "Emoji icona categoria",
          placeholder: "Emoji",
          value: adminEditCatDraft.icon,
          onChange: (e) => setAdminEditCatDraft((d) => ({ ...d, icon: e.target.value })),
          maxLength: 2
        }
      ), /* @__PURE__ */ React.createElement("div", { className: "admin-form-actions" }, /* @__PURE__ */ React.createElement("button", { className: "admin-btn admin-btn-primary", onClick: saveEditedCategory }, "Salva"), /* @__PURE__ */ React.createElement("button", { className: "admin-btn admin-btn-ghost", onClick: () => setAdminEditCat(null) }, "Annulla"))) : /* @__PURE__ */ React.createElement(
        "div",
        {
          className: "admin-cat-row",
          "data-hover-cat": cat.category,
          onPointerEnter: () => {
            if (!isDraggingRef.current || isOpen) return;
            clearTimeout(hoverOpenTimerRef.current);
            hoverOpenTimerRef.current = setTimeout(() => {
              setAdminOpenCats((prev) => {
                const next = new Set(prev);
                next.add(cat.category);
                return next;
              });
            }, 600);
          },
          onPointerLeave: () => clearTimeout(hoverOpenTimerRef.current),
          onDragEnter: () => {
            if (isOpen) return;
            clearTimeout(hoverOpenTimerRef.current);
            hoverOpenTimerRef.current = setTimeout(() => {
              setAdminOpenCats((prev) => {
                const next = new Set(prev);
                next.add(cat.category);
                return next;
              });
            }, 600);
          },
          onDragLeave: (e) => {
            if (e.currentTarget.contains(e.relatedTarget)) return;
            clearTimeout(hoverOpenTimerRef.current);
          }
        },
        /* @__PURE__ */ React.createElement("span", { className: "admin-cat-drag-handle", "aria-hidden": "true" }, "\u283F"),
        /* @__PURE__ */ React.createElement(
          "button",
          {
            className: "category-btn",
            onClick: () => setAdminOpenCats((prev) => {
              const next = new Set(prev);
              next.has(cat.category) ? next.delete(cat.category) : next.add(cat.category);
              return next;
            }),
            "aria-expanded": isOpen,
            "aria-controls": `admin-cat-${catIdx}`
          },
          /* @__PURE__ */ React.createElement("span", { className: "cat-icon", "aria-hidden": "true" }, cat.icon),
          /* @__PURE__ */ React.createElement("span", { className: "cat-name" }, cat.category),
          /* @__PURE__ */ React.createElement("span", { className: "cat-meta" }, cat.items.length, " ", cat.items.length === 1 ? "alimento" : "alimenti"),
          /* @__PURE__ */ React.createElement("span", { className: `cat-arrow${isOpen ? " open" : ""}` }, "\u25BC")
        ),
        /* @__PURE__ */ React.createElement("button", { className: "admin-icon-btn", onClick: (e) => {
          e.stopPropagation();
          startEditCategory(cat);
        }, "aria-label": `Modifica categoria ${cat.category}` }, "\u270F\uFE0F"),
        /* @__PURE__ */ React.createElement("button", { className: "admin-icon-btn admin-icon-btn-delete", onClick: (e) => {
          e.stopPropagation();
          deleteCategory(catIdx);
        }, "aria-label": `Elimina categoria ${cat.category}` }, "\u{1F5D1}\uFE0F")
      ), isOpen && /* @__PURE__ */ React.createElement("div", { id: `admin-cat-${catIdx}`, className: "admin-items-list" }, /* @__PURE__ */ React.createElement(
        "div",
        {
          ref: (el) => {
            if (el) sortableItemRefs.current[cat.category] = el;
            else delete sortableItemRefs.current[cat.category];
          },
          "data-category": cat.category
        },
        cat.items.map((item) => /* @__PURE__ */ React.createElement("div", { key: item.id }, adminEditId === item.id ? /* @__PURE__ */ React.createElement("div", { className: "admin-form" }, /* @__PURE__ */ React.createElement(
          "input",
          {
            className: "admin-input admin-input-name",
            "aria-label": "Nome alimento",
            placeholder: "Nome",
            value: adminEditDraft.name,
            onChange: (e) => setAdminEditDraft((d) => ({ ...d, name: e.target.value })),
            onKeyDown: (e) => {
              if (e.key === "Enter") saveEditedItem(item.id);
              if (e.key === "Escape") setAdminEditId2(null);
            },
            autoFocus: true
          }
        ), !adminEditDraft.variable && /* @__PURE__ */ React.createElement(
          "input",
          {
            className: "admin-input admin-input-portion",
            "aria-label": "Porzione",
            placeholder: "Porzione",
            value: adminEditDraft.portion,
            onChange: (e) => setAdminEditDraft((d) => ({ ...d, portion: e.target.value }))
          }
        ), /* @__PURE__ */ React.createElement("label", { className: "admin-variable-label" }, /* @__PURE__ */ React.createElement(
          "input",
          {
            type: "checkbox",
            checked: adminEditDraft.variable,
            onChange: (e) => setAdminEditDraft((d) => ({ ...d, variable: e.target.checked, ...e.target.checked ? { portion: "" } : {} }))
          }
        ), "Variabile"), adminEditDraft.variable ? /* @__PURE__ */ React.createElement("div", { className: "admin-ref-wrap" }, /* @__PURE__ */ React.createElement(
          "input",
          {
            className: "admin-input admin-input-ref-g",
            type: "number",
            "aria-label": "Grammi di riferimento",
            placeholder: "g",
            value: adminEditDraft.refGrams,
            onChange: (e) => setAdminEditDraft((d) => ({ ...d, refGrams: e.target.value })),
            min: "1"
          }
        ), /* @__PURE__ */ React.createElement("span", { className: "admin-ref-sep" }, "g ="), /* @__PURE__ */ React.createElement(
          "input",
          {
            className: "admin-input admin-input-ref-kcal",
            type: "number",
            "aria-label": "Calorie per i grammi di riferimento",
            placeholder: "kcal",
            value: adminEditDraft.refKcal,
            onChange: (e) => setAdminEditDraft((d) => ({ ...d, refKcal: e.target.value })),
            min: "0"
          }
        ), /* @__PURE__ */ React.createElement("span", { className: "admin-ref-sep" }, "kcal")) : /* @__PURE__ */ React.createElement(
          "input",
          {
            className: "admin-input admin-input-kcal",
            type: "number",
            "aria-label": "Calorie",
            placeholder: "kcal",
            value: adminEditDraft.kcal,
            onChange: (e) => setAdminEditDraft((d) => ({ ...d, kcal: e.target.value })),
            min: "0"
          }
        ), /* @__PURE__ */ React.createElement("div", { className: "admin-form-actions" }, /* @__PURE__ */ React.createElement("button", { className: "admin-btn admin-btn-primary", onClick: () => saveEditedItem(item.id), "aria-label": "Salva modifiche" }, "Salva"), /* @__PURE__ */ React.createElement("button", { className: "admin-btn admin-btn-ghost", onClick: () => setAdminEditId2(null), "aria-label": "Annulla modifica" }, "Annulla"))) : /* @__PURE__ */ React.createElement("div", { className: "admin-item-row" }, /* @__PURE__ */ React.createElement("span", { className: "admin-drag-handle", "aria-hidden": "true" }, "\u283F"), /* @__PURE__ */ React.createElement("div", { className: "admin-item-info" }, /* @__PURE__ */ React.createElement("span", { className: "admin-item-name" }, item.name), /* @__PURE__ */ React.createElement("span", { className: "admin-item-meta" }, item.variable ? `${Math.round(item.kcalPerG * 100)} kcal/100g` : `${item.kcal} kcal`, item.portion ? ` \xB7 ${item.portion}` : "")), /* @__PURE__ */ React.createElement("div", { className: "admin-item-actions" }, /* @__PURE__ */ React.createElement("button", { className: "admin-icon-btn", onClick: () => startEditItem(item), "aria-label": `Modifica ${item.name}` }, "\u270F\uFE0F"), /* @__PURE__ */ React.createElement("button", { className: "admin-icon-btn admin-icon-btn-delete", onClick: () => deleteItem(item.id), "aria-label": `Elimina ${item.name}` }, "\u{1F5D1}\uFE0F")))))
      ), adminNewItem?.catIdx === catIdx ? /* @__PURE__ */ React.createElement("div", { className: "admin-form admin-form-new" }, /* @__PURE__ */ React.createElement(
        "input",
        {
          className: "admin-input admin-input-name",
          "aria-label": "Nome nuovo alimento",
          placeholder: "Nome alimento",
          value: adminNewItem.name,
          onChange: (e) => setAdminNewItem2((d) => ({ ...d, name: e.target.value })),
          onKeyDown: (e) => {
            if (e.key === "Enter") addNewItem(catIdx);
            if (e.key === "Escape") setAdminNewItem2(null);
          },
          autoFocus: true
        }
      ), !adminNewItem.variable && /* @__PURE__ */ React.createElement(
        "input",
        {
          className: "admin-input admin-input-portion",
          "aria-label": "Porzione",
          placeholder: "Porzione",
          value: adminNewItem.portion,
          onChange: (e) => setAdminNewItem2((d) => ({ ...d, portion: e.target.value }))
        }
      ), /* @__PURE__ */ React.createElement("label", { className: "admin-variable-label" }, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "checkbox",
          checked: adminNewItem.variable,
          onChange: (e) => setAdminNewItem2((d) => ({ ...d, variable: e.target.checked, ...e.target.checked ? { portion: "" } : {} }))
        }
      ), "Variabile"), adminNewItem.variable ? /* @__PURE__ */ React.createElement("div", { className: "admin-ref-wrap" }, /* @__PURE__ */ React.createElement(
        "input",
        {
          className: "admin-input admin-input-ref-g",
          type: "number",
          "aria-label": "Grammi di riferimento",
          placeholder: "g",
          value: adminNewItem.refGrams,
          onChange: (e) => setAdminNewItem2((d) => ({ ...d, refGrams: e.target.value })),
          min: "1"
        }
      ), /* @__PURE__ */ React.createElement("span", { className: "admin-ref-sep" }, "g ="), /* @__PURE__ */ React.createElement(
        "input",
        {
          className: "admin-input admin-input-ref-kcal",
          type: "number",
          "aria-label": "Calorie per i grammi di riferimento",
          placeholder: "kcal",
          value: adminNewItem.refKcal,
          onChange: (e) => setAdminNewItem2((d) => ({ ...d, refKcal: e.target.value })),
          min: "0"
        }
      ), /* @__PURE__ */ React.createElement("span", { className: "admin-ref-sep" }, "kcal")) : /* @__PURE__ */ React.createElement(
        "input",
        {
          className: "admin-input admin-input-kcal",
          type: "number",
          "aria-label": "Calorie",
          placeholder: "kcal",
          value: adminNewItem.kcal,
          onChange: (e) => setAdminNewItem2((d) => ({ ...d, kcal: e.target.value })),
          min: "0"
        }
      ), /* @__PURE__ */ React.createElement("div", { className: "admin-form-actions" }, /* @__PURE__ */ React.createElement("button", { className: "admin-btn admin-btn-primary", onClick: () => addNewItem(catIdx), "aria-label": "Aggiungi alimento" }, "Aggiungi"), /* @__PURE__ */ React.createElement("button", { className: "admin-btn admin-btn-ghost", onClick: () => setAdminNewItem2(null), "aria-label": "Annulla" }, "Annulla"))) : /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "admin-add-btn",
          onClick: () => {
            setAdminEditId2(null);
            setAdminNewItem2({ catIdx, name: "", kcal: "", portion: "", variable: false, kcalPerG: "", refGrams: "100", refKcal: "" });
          },
          "aria-label": `Aggiungi alimento a ${cat.category}`
        },
        "+ Aggiungi alimento"
      )));
    })), adminNewCat ? /* @__PURE__ */ React.createElement("div", { className: "admin-new-cat-card" }, /* @__PURE__ */ React.createElement("div", { className: "admin-form" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "admin-input admin-input-name",
        "aria-label": "Nome nuova categoria",
        placeholder: "Nome categoria",
        value: adminNewCatDraft.name,
        onChange: (e) => setAdminNewCatDraft((d) => ({ ...d, name: e.target.value })),
        onKeyDown: (e) => {
          if (e.key === "Enter") addNewCategory();
          if (e.key === "Escape") {
            setAdminNewCat(false);
            setAdminNewCatDraft({ name: "", icon: "" });
          }
        },
        autoFocus: true
      }
    ), /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "admin-input admin-input-icon",
        "aria-label": "Emoji icona categoria",
        placeholder: "Emoji",
        value: adminNewCatDraft.icon,
        onChange: (e) => setAdminNewCatDraft((d) => ({ ...d, icon: e.target.value })),
        maxLength: 2
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "admin-form-actions" }, /* @__PURE__ */ React.createElement("button", { className: "admin-btn admin-btn-primary", onClick: addNewCategory, "aria-label": "Aggiungi categoria" }, "Aggiungi"), /* @__PURE__ */ React.createElement("button", { className: "admin-btn admin-btn-ghost", onClick: () => {
      setAdminNewCat(false);
      setAdminNewCatDraft({ name: "", icon: "" });
    }, "aria-label": "Annulla" }, "Annulla")))) : /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "admin-add-cat-btn",
        onClick: () => setAdminNewCat(true),
        "aria-label": "Aggiungi nuova categoria"
      },
      "+ Aggiungi categoria"
    )));
  }

  // src/components/KcalBar.jsx
  function KcalBar({ kcal, max }) {
    const pct = Math.min(kcal / max * 100, 100);
    const color = kcal > 400 ? "var(--color-negative)" : kcal > 250 ? "var(--color-warning)" : "var(--color-positive)";
    return /* @__PURE__ */ React.createElement("div", { className: "bar-mini" }, /* @__PURE__ */ React.createElement("div", { className: "bar-mini-fill", style: { width: `${pct}%`, background: color } }));
  }

  // src/tabs/TrackerTab.jsx
  function TrackerTab({
    user,
    dietData,
    searchQuery,
    openIdx,
    setOpenIdx,
    varGrams,
    setVarGrams,
    setLog,
    extras,
    extraName,
    setExtraName,
    extraInput,
    setExtraInput,
    addExtra,
    removeExtra,
    getCount,
    inc,
    dec,
    catKcal,
    maxItemKcal,
    login
  }) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, user && (() => {
      const query = searchQuery.trim().toLowerCase();
      const visibleCats = dietData.map((cat, ci) => ({
        cat,
        ci,
        items: query ? cat.items.map((item, ii) => ({ item, ii })).filter(({ item }) => item.name.toLowerCase().includes(query)) : cat.items.map((item, ii) => ({ item, ii }))
      })).filter(({ items }) => !query || items.length > 0).filter(({ cat }) => user || cat.category !== "Alcol");
      const highlightName = (name) => {
        if (!query) return name;
        const idx = name.toLowerCase().indexOf(query);
        if (idx === -1) return name;
        return /* @__PURE__ */ React.createElement(React.Fragment, null, name.slice(0, idx), /* @__PURE__ */ React.createElement("span", { className: "search-highlight" }, name.slice(idx, idx + query.length)), name.slice(idx + query.length));
      };
      return visibleCats.map(({ cat, ci, items }) => {
        const isOpen = query ? true : openIdx === ci;
        const kcalCat = catKcal(ci);
        const hasAny = kcalCat > 0;
        return /* @__PURE__ */ React.createElement("div", { key: ci, className: `category-card${hasAny ? " has-checked" : ""}` }, /* @__PURE__ */ React.createElement("button", { className: "category-btn", onClick: () => !query && setOpenIdx(isOpen ? null : ci), "aria-expanded": isOpen, "aria-controls": `cat-grid-${ci}` }, /* @__PURE__ */ React.createElement("span", { className: "cat-icon", "aria-hidden": "true" }, cat.icon), /* @__PURE__ */ React.createElement("span", { className: "cat-name" }, cat.category), hasAny && /* @__PURE__ */ React.createElement("span", { className: "cat-kcal-badge" }, "+", kcalCat, " kcal"), !query && /* @__PURE__ */ React.createElement("span", { className: "cat-meta" }, cat.items.length, " ", cat.items.length === 1 ? "alimento" : "alimenti"), !query && /* @__PURE__ */ React.createElement("span", { className: `cat-arrow${isOpen ? " open" : ""}` }, "\u25BC")), isOpen && /* @__PURE__ */ React.createElement("div", { id: `cat-grid-${ci}`, className: "items-grid" }, /* @__PURE__ */ React.createElement("div", { className: "items-grid-label" }, "Alimento"), /* @__PURE__ */ React.createElement("div", { className: "items-grid-label" }, "Porzione"), /* @__PURE__ */ React.createElement("div", { className: "items-grid-label right" }, "Kcal"), /* @__PURE__ */ React.createElement("div", { className: "items-grid-label" }), items.map(({ item, ii }, idx) => {
          const qty = getCount(item.id);
          const isActive = qty > 0;
          if (item.variable) {
            const g = varGrams[item.id] || 0;
            const portionKcal = g > 0 ? Math.round(g * item.kcalPerG) : 0;
            const totalVar = portionKcal * qty;
            return /* @__PURE__ */ React.createElement(React.Fragment, { key: ii }, idx > 0 && /* @__PURE__ */ React.createElement("div", { className: "items-grid-sep" }), /* @__PURE__ */ React.createElement("div", { className: `item-name${isActive ? " item-cell-active" : ""}` }, /* @__PURE__ */ React.createElement("span", null, highlightName(item.name))), /* @__PURE__ */ React.createElement("div", { className: `item-portion${isActive ? " item-cell-active" : ""}` }, /* @__PURE__ */ React.createElement(
              "input",
              {
                type: "number",
                className: "grams-input",
                "aria-label": `Grammi di ${item.name}`,
                placeholder: "Grammi",
                value: g || "",
                onChange: (e) => {
                  e.stopPropagation();
                  const val = parseInt(e.target.value, 10);
                  setVarGrams((prev) => {
                    if (!val || val <= 0) {
                      const { [item.id]: _, ...rest } = prev;
                      return rest;
                    }
                    return { ...prev, [item.id]: val };
                  });
                  if (val > 0 && getCount(item.id) > 0) {
                    const newKcal = Math.round(val * item.kcalPerG);
                    setLog((prev) => {
                      for (let i = prev.length - 1; i >= 0; i--) {
                        if (prev[i].type === "item" && prev[i].id === item.id) {
                          const updated = [...prev];
                          updated[i] = { ...updated[i], grams: val, kcal: newKcal };
                          return updated;
                        }
                      }
                      return prev;
                    });
                  }
                },
                onClick: (e) => e.stopPropagation(),
                min: "0"
              }
            )), /* @__PURE__ */ React.createElement("div", { className: `item-kcal-cell${isActive ? " item-cell-active" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "item-kcal" }, g > 0 ? isActive ? totalVar : portionKcal : "\u2013", g > 0 && isActive && qty > 1 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: "var(--text-dimmer)", marginLeft: 3 } }, "\xD7", qty)), /* @__PURE__ */ React.createElement(KcalBar, { kcal: portionKcal, max: maxItemKcal })), /* @__PURE__ */ React.createElement("div", { className: isActive ? "item-cell-active" : "", style: { minHeight: 44, padding: "0 14px 0 0", display: "flex", alignItems: "center", justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("div", { className: "counter", onClick: (e) => e.stopPropagation(), role: "group", "aria-label": item.name }, /* @__PURE__ */ React.createElement("button", { className: `counter-btn${isActive ? "" : " minus-disabled"}`, onClick: (e) => dec(item.id, e), "aria-label": `Rimuovi ${item.name}`, "aria-disabled": !isActive }, "\u2212"), /* @__PURE__ */ React.createElement("span", { className: "counter-num", "aria-label": `${qty} porzioni` }, qty), /* @__PURE__ */ React.createElement("button", { className: "counter-btn plus", onClick: (e) => inc(item.id, e), "aria-label": `Aggiungi ${item.name}` }, "+"))));
          }
          return /* @__PURE__ */ React.createElement(React.Fragment, { key: ii }, idx > 0 && /* @__PURE__ */ React.createElement("div", { className: "items-grid-sep" }), /* @__PURE__ */ React.createElement("div", { className: `item-name${isActive ? " item-cell-active" : ""}` }, /* @__PURE__ */ React.createElement("span", null, highlightName(item.name))), /* @__PURE__ */ React.createElement("div", { className: `item-portion${isActive ? " item-cell-active" : ""}` }, item.portion), /* @__PURE__ */ React.createElement("div", { className: `item-kcal-cell${isActive ? " item-cell-active" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "item-kcal" }, isActive ? item.kcal * qty : item.kcal, isActive && qty > 1 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: "var(--text-dimmer)", marginLeft: 3 } }, "\xD7", qty)), /* @__PURE__ */ React.createElement(KcalBar, { kcal: item.kcal, max: maxItemKcal })), /* @__PURE__ */ React.createElement("div", { className: isActive ? "item-cell-active" : "", style: { minHeight: 44, padding: "0 14px 0 0", display: "flex", alignItems: "center", justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("div", { className: "counter", onClick: (e) => e.stopPropagation(), role: "group", "aria-label": item.name }, /* @__PURE__ */ React.createElement("button", { className: `counter-btn${isActive ? "" : " minus-disabled"}`, onClick: (e) => dec(item.id, e), "aria-label": `Rimuovi ${item.name}`, "aria-disabled": !isActive }, "\u2212"), /* @__PURE__ */ React.createElement("span", { className: "counter-num", "aria-label": `${qty} porzioni` }, qty), /* @__PURE__ */ React.createElement("button", { className: "counter-btn plus", onClick: (e) => inc(item.id, e), "aria-label": `Aggiungi ${item.name}` }, "+"))));
        })));
      });
    })(), (() => {
      const extrasKcal = extras.reduce((s, e) => s + e.kcal, 0);
      const hasExtras = extras.length > 0;
      return /* @__PURE__ */ React.createElement("div", { className: `category-card${hasExtras ? " has-checked" : ""}`, style: { marginTop: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px 0", fontWeight: 600, fontSize: 14 } }, /* @__PURE__ */ React.createElement("span", { className: "cat-icon", "aria-hidden": "true" }, "\u{1F9FE}"), /* @__PURE__ */ React.createElement("span", { className: "cat-name" }, user ? "Extra" : "Aggiungi alimento"), hasExtras && /* @__PURE__ */ React.createElement("span", { className: "cat-kcal-badge" }, "+", extrasKcal, " kcal"), user && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "#a1a1aa", fontWeight: 400 } }, "calorie libere")), /* @__PURE__ */ React.createElement("div", { className: "extra-input-row" }, /* @__PURE__ */ React.createElement(
        "input",
        {
          className: "extra-kcal-input",
          type: "text",
          "aria-label": "Nome alimento",
          placeholder: "cosa hai mangiato\u2026",
          value: extraName,
          onChange: (e) => setExtraName(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") addExtra();
          },
          style: { flex: 2 }
        }
      ), /* @__PURE__ */ React.createElement(
        "input",
        {
          className: "extra-kcal-input",
          type: "number",
          "aria-label": "Calorie",
          placeholder: "kcal",
          value: extraInput,
          onChange: (e) => setExtraInput(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") addExtra();
          },
          min: "1",
          style: { flex: 1, minWidth: 0 }
        }
      ), /* @__PURE__ */ React.createElement("button", { className: "extra-add-btn", onClick: addExtra, "aria-label": "Aggiungi alimento" }, "+")), hasExtras && /* @__PURE__ */ React.createElement("div", { className: "extra-list" }, extras.map((item) => /* @__PURE__ */ React.createElement("div", { key: item.uid || item.name, className: "extra-item" }, /* @__PURE__ */ React.createElement("span", { className: "extra-item-label" }, item.name), /* @__PURE__ */ React.createElement("div", { className: "extra-item-right" }, /* @__PURE__ */ React.createElement("span", { className: "extra-item-kcal" }, item.kcal, " kcal"), /* @__PURE__ */ React.createElement("button", { className: "extra-remove-btn", onClick: () => removeExtra(item.uid), "aria-label": `Rimuovi ${item.name}` }, "\xD7"))))));
    })(), user && /* @__PURE__ */ React.createElement("div", { className: "legend" }, [["var(--color-positive)", "<250 kcal"], ["var(--color-warning)", "250\u2013400 kcal"], ["var(--color-negative)", ">400 kcal"]].map(([color, label]) => /* @__PURE__ */ React.createElement("span", { key: label, style: { display: "flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 } }), label))), !user && /* @__PURE__ */ React.createElement("div", { className: "guest-banner" }, /* @__PURE__ */ React.createElement("div", { className: "guest-banner-title" }, "Accedi per sbloccare tutto"), /* @__PURE__ */ React.createElement("div", { className: "guest-banner-body" }, "Con un account Google puoi gestire la tua lista alimenti personalizzata, consultare lo storico settimanale, sincronizzare i dati su tutti i tuoi dispositivi e tanto altro."), /* @__PURE__ */ React.createElement("button", { className: "guest-banner-btn", onClick: login }, "Accedi con Google")));
  }

  // src/app.jsx
  var { useState: useState3, useEffect: useEffect3, useRef: useRef2, useMemo } = React;
  function App() {
    const [user, setUser] = useState3(void 0);
    const [notAllowed, setNotAllowed] = useState3(false);
    const [wizardOpen, setWizardOpen] = useState3(false);
    const [wizardStep, setWizardStep] = useState3(0);
    const [settingsOpen, setSettingsOpen] = useState3(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState3(false);
    const [settingsDraft, setSettingsDraft] = useState3({ defaultKcal: "2000", schedule: DEFAULT_SCHEDULE });
    const [defaultKcal, setDefaultKcal] = useState3(2e3);
    const [counts, setCounts] = useState3(() => loadLocalData().counts);
    const [extras, setExtras] = useState3(() => loadLocalData().extras);
    const [varGrams, setVarGrams] = useState3(() => loadLocalData().varGrams);
    const [log, setLog] = useState3([]);
    const [searchQuery, setSearchQuery] = useState3("");
    const [adminSearchQuery, setAdminSearchQuery] = useState3("");
    const [extraName, setExtraName] = useState3("");
    const [extraInput, setExtraInput] = useState3("");
    const [target, setTarget] = useState3(loadTarget);
    const [openIdx, setOpenIdx] = useState3(null);
    const [editingDayTarget, setEditingDayTarget] = useState3(null);
    const [activeTab, setActiveTab] = useState3("oggi");
    const swipeStart = useRef2(null);
    const tabRefs = useRef2({});
    const [indicatorStyle, setIndicatorStyle] = useState3({ left: 0, width: 0 });
    const [history, setHistory] = useState3([]);
    const [historyLoading, setHistoryLoading] = useState3(false);
    const [currentPage, setCurrentPage] = useState3(() => getBimesterOf(ACTIVE_DAY()));
    const [openWeeks, setOpenWeeks] = useState3(/* @__PURE__ */ new Set());
    const [dataReady, setDataReady] = useState3(false);
    const [shakeTarget, setShakeTarget] = useState3(false);
    const [autoOpenWizard, setAutoOpenWizard] = useState3(false);
    const [lightTheme, setLightTheme] = useState3(() => localStorage.getItem("kcal_theme") === "light");
    const [confirmModal, setConfirmModal] = useState3(null);
    const [installEvent, setInstallEvent] = useState3(null);
    const [installBanner, setInstallBanner] = useState3(null);
    const [pwaInteracted, setPwaInteracted] = useState3(() => localStorage.getItem("pwa_dismissed") === "1");
    const [dietData, setDietData] = useState3(SEED_DIET_DATA);
    const [schedule, setSchedule] = useState3(DEFAULT_SCHEDULE);
    const profileMenuRef = useRef2(null);
    const itemById = useMemo(() => {
      const m = {};
      dietData.forEach((cat) => cat.items.forEach((item) => {
        m[item.id] = item;
      }));
      return m;
    }, [dietData]);
    const itemCategory = useMemo(() => {
      const m = {};
      dietData.forEach((cat) => cat.items.forEach((item) => {
        m[item.id] = cat.category;
      }));
      return m;
    }, [dietData]);
    const maxItemKcal = useMemo(() => {
      const fixed = dietData.flatMap((c) => c.items.filter((i) => !i.variable).map((i) => i.kcal));
      return fixed.length > 0 ? Math.max(...fixed) : 1e3;
    }, [dietData]);
    const toggleWeek = (ws) => setOpenWeeks((prev) => {
      const next = new Set(prev);
      next.has(ws) ? next.delete(ws) : next.add(ws);
      return next;
    });
    useEffect3(() => {
      document.body.classList.toggle("light", lightTheme);
      localStorage.setItem("kcal_theme", lightTheme ? "light" : "dark");
    }, [lightTheme]);
    useEffect3(() => {
      if (new URLSearchParams(location.search).has("reset-pwa")) localStorage.removeItem("pwa_dismissed");
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
      if (isStandalone) return;
      const isDismissed = !!localStorage.getItem("pwa_dismissed");
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const isSafariOnly = /safari/i.test(navigator.userAgent) && !/chrome|chromium|crios|fxios/i.test(navigator.userAgent);
      if (isIOS && isSafariOnly) {
        if (!isDismissed) setInstallBanner("ios");
        return;
      }
      const handler = (e) => {
        e.preventDefault();
        setInstallEvent(e);
        if (!isDismissed) setInstallBanner("android");
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);
    useEffect3(() => {
      document.body.classList.toggle("has-install-banner", !!installBanner);
      return () => document.body.classList.remove("has-install-banner");
    }, [installBanner]);
    const handleInstall = async () => {
      if (!installEvent) return;
      installEvent.prompt();
      const { outcome } = await installEvent.userChoice;
      setInstallBanner(null);
      setInstallEvent(null);
      if (outcome === "accepted") localStorage.setItem("pwa_dismissed", "1");
    };
    const dismissInstall = () => {
      setInstallBanner(null);
      localStorage.setItem("pwa_dismissed", "1");
      setPwaInteracted(true);
    };
    const saveDebounceRef = useRef2(null);
    const prevOverTarget = useRef2(false);
    useEffect3(() => {
      return auth.onAuthStateChanged(async (u) => {
        if (!u) {
          setUser(null);
          setCounts({});
          setExtras([]);
          setVarGrams({});
          setLog([]);
          setDietData(SEED_DIET_DATA);
          setSchedule(DEFAULT_SCHEDULE);
          setDataReady(false);
          return;
        }
        try {
          const accessRef = db.collection("config").doc("access");
          const accessSnap = await accessRef.get();
          const { allowedUids, maxUsers } = accessSnap.data();
          if (!allowedUids.includes(u.uid)) {
            if (allowedUids.length < maxUsers) {
              await accessRef.update({
                allowedUids: firebase.firestore.FieldValue.arrayUnion(u.uid)
              });
            } else {
              auth.signOut();
              setNotAllowed(true);
              return;
            }
          }
        } catch (e) {
          console.error("Access check error:", e);
          auth.signOut();
          return;
        }
        setUser(u);
        try {
          const [daySnap, foodsSnap, schedSnap] = await Promise.all([
            db.collection("users").doc(u.uid).collection("days").doc(ACTIVE_DAY()).get(),
            db.collection("users").doc(u.uid).collection("config").doc("foods").get(),
            db.collection("users").doc(u.uid).collection("config").doc("schedule").get()
          ]);
          const loadedDefaultKcal = schedSnap.exists && schedSnap.data().defaultKcal ? schedSnap.data().defaultKcal : 2e3;
          setDefaultKcal(loadedDefaultKcal);
          if (schedSnap.exists && schedSnap.data().schedule) {
            setSchedule(schedSnap.data().schedule);
          }
          const isFirstLogin = !foodsSnap.exists;
          let loadedDietData;
          if (foodsSnap.exists && foodsSnap.data().dietData) {
            loadedDietData = foodsSnap.data().dietData;
            if (u.uid === ALLOWED_UID) {
              const firestoreIds = new Set(loadedDietData.flatMap((c) => c.items.map((i) => i.id)));
              let needsMerge = false;
              const mergedData = loadedDietData.map((cat) => {
                const seedCat = SEED_DIET_DATA.find((sc) => sc.category === cat.category);
                if (!seedCat) return cat;
                const newItems = seedCat.items.filter((si) => !firestoreIds.has(si.id));
                if (newItems.length === 0) return cat;
                needsMerge = true;
                return { ...cat, items: [...cat.items, ...newItems] };
              });
              const firestoreCats = new Set(loadedDietData.map((c) => c.category));
              SEED_DIET_DATA.forEach((seedCat) => {
                if (!firestoreCats.has(seedCat.category)) {
                  const newItems = seedCat.items.filter((si) => !firestoreIds.has(si.id));
                  if (newItems.length > 0) {
                    mergedData.push({ ...seedCat, items: newItems });
                    needsMerge = true;
                  }
                }
              });
              if (needsMerge) {
                loadedDietData = mergedData;
                db.collection("users").doc(u.uid).collection("config").doc("foods").set({ dietData: mergedData }).catch((e) => console.error("Merge diet data error:", e));
              }
            }
          } else {
            loadedDietData = u.uid === ALLOWED_UID ? SEED_DIET_DATA : [];
            db.collection("users").doc(u.uid).collection("config").doc("foods").set({ dietData: loadedDietData }).catch((e) => console.error("Seed diet data error:", e));
          }
          setDietData(loadedDietData);
          const loadedItemById = {};
          loadedDietData.forEach((cat) => cat.items.forEach((item) => {
            loadedItemById[item.id] = item;
          }));
          if (daySnap.exists) {
            const data = daySnap.data();
            const { counts: mc, varGrams: mvg, migrated } = migrateCountKeys(data.counts || {}, data.varGrams || {});
            const sanitizedCounts = { ...mc };
            Object.keys(sanitizedCounts).forEach((id) => {
              const it = loadedItemById[id];
              if (it?.variable && !mvg[id]) delete sanitizedCounts[id];
            });
            const loadedExtras = (data.extras || []).map((e) => e.uid ? e : { ...e, uid: Math.random().toString(36).slice(2, 8) });
            setCounts(sanitizedCounts);
            setExtras(loadedExtras);
            setVarGrams(mvg);
            setLog(data.log || []);
            setTarget(data.target || loadedDefaultKcal);
            if (migrated) {
              db.collection("users").doc(u.uid).collection("days").doc(ACTIVE_DAY()).update({ counts: mc, varGrams: mvg }).catch((e) => console.error("Migration update error:", e));
            }
          }
          if (!daySnap.exists) setTarget(loadedDefaultKcal);
          setDataReady(true);
          if (isFirstLogin) setAutoOpenWizard(true);
        } catch (e) {
          console.error("Firestore load error \u2014 save disabled to prevent data loss:", e);
        }
      });
    }, []);
    useEffect3(() => {
      if (user === void 0 || user) return;
      localStorage.setItem("kcal_data", JSON.stringify({ date: ACTIVE_DAY(), counts, extras, varGrams }));
    }, [counts, extras, varGrams, user]);
    useEffect3(() => {
      if (!user || !dataReady) return;
      clearTimeout(saveDebounceRef.current);
      saveDebounceRef.current = setTimeout(() => {
        const totalKcal2 = computeTotal(counts, extras, varGrams, itemById);
        const items = buildItemsList(counts, extras, varGrams, itemById);
        db.collection("users").doc(user.uid).collection("days").doc(ACTIVE_DAY()).set({
          counts,
          extras,
          varGrams,
          log,
          target,
          totalKcal: totalKcal2,
          items,
          date: ACTIVE_DAY(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).catch((e) => console.error("Firestore save error:", e));
      }, 400);
    }, [counts, extras, varGrams, log, target, user, dataReady]);
    useEffect3(() => {
      localStorage.setItem("kcal_target", String(target));
    }, [target]);
    const totalKcal = computeTotal(counts, extras, varGrams, itemById);
    useEffect3(() => {
      const over = totalKcal > target;
      if (over && !prevOverTarget.current) {
        setShakeTarget(true);
        setTimeout(() => setShakeTarget(false), 400);
      }
      prevOverTarget.current = over;
    }, [totalKcal, target]);
    useEffect3(() => {
      if (activeTab === "menu" && log.length === 0) setActiveTab("oggi");
    }, [log, activeTab]);
    useEffect3(() => {
      const btn = tabRefs.current[activeTab];
      if (btn) setIndicatorStyle({ left: btn.offsetLeft, width: btn.offsetWidth });
    }, [activeTab, log.length]);
    useEffect3(() => {
      if (activeTab !== "storico" || !user) return;
      setHistoryLoading(true);
      db.collection("users").doc(user.uid).collection("days").get().then((snap) => {
        const docs = snap.docs.map((d) => d.data()).filter((d) => d.date !== ACTIVE_DAY()).sort((a, b) => b.date.localeCompare(a.date));
        setHistory(docs);
        setHistoryLoading(false);
      }).catch(() => setHistoryLoading(false));
    }, [activeTab, user]);
    useEffect3(() => {
      if (activeTab !== "alimenti") setAdminSearchQuery("");
    }, [activeTab]);
    useEffect3(() => {
      if (dataReady && autoOpenWizard) {
        setWizardStep(0);
        setWizardOpen(true);
        setAutoOpenWizard(false);
      }
    }, [dataReady, autoOpenWizard]);
    useEffect3(() => {
      if (!wizardOpen) {
        setSettingsOpen(false);
        setProfileMenuOpen(false);
        return;
      }
      const step = WIZARD_STEPS[wizardStep];
      if (step.tab) setActiveTab(step.tab);
      if (step.openSettings) {
        setSettingsDraft({ defaultKcal: String(defaultKcal), schedule: [...schedule] });
        setSettingsOpen(true);
      } else {
        setSettingsOpen(false);
      }
      setProfileMenuOpen(!!step.openProfileMenu);
    }, [wizardOpen, wizardStep]);
    useEffect3(() => {
      if (!profileMenuOpen) return;
      const handler = (e) => {
        if (wizardOpen) return;
        if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
          setProfileMenuOpen(false);
        }
      };
      document.addEventListener("mousedown", handler);
      document.addEventListener("touchstart", handler, { passive: true });
      return () => {
        document.removeEventListener("mousedown", handler);
        document.removeEventListener("touchstart", handler);
      };
    }, [profileMenuOpen, wizardOpen]);
    const login = () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider).catch(console.error);
    };
    const logout = () => {
      setConfirmModal({
        title: "Esci",
        message: "Esci dall'account?",
        onConfirm: () => auth.signOut()
      });
    };
    const getCount = (id) => counts[id] || 0;
    const vibrate = () => {
      try {
        navigator.vibrate && navigator.vibrate(30);
      } catch {
      }
    };
    const inc = (id, e) => {
      e.stopPropagation();
      vibrate();
      const item = itemById[id];
      const grams = varGrams[id] || 0;
      const kcal = item.variable ? Math.round(grams * item.kcalPerG) : item.kcal;
      setCounts((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
      setLog((prev) => [...prev, { type: "item", id, name: item.name, kcal, grams, category: itemCategory[id] || "", ts: (/* @__PURE__ */ new Date()).toISOString() }]);
    };
    const dec = (id, e) => {
      e.stopPropagation();
      const item = itemById[id];
      setCounts((prev) => {
        const next = (prev[id] || 0) - 1;
        if (next <= 0) {
          if (item?.variable) setVarGrams((vg) => {
            const { [id]: _2, ...rest2 } = vg;
            return rest2;
          });
          const { [id]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [id]: next };
      });
      setLog((prev) => {
        for (let i = prev.length - 1; i >= 0; i--) {
          if (prev[i].type === "item" && prev[i].id === id) {
            return [...prev.slice(0, i), ...prev.slice(i + 1)];
          }
        }
        return prev;
      });
    };
    const pct = Math.min(totalKcal / target * 100, 100);
    const remaining = target - totalKcal;
    const barColor = pct >= 100 ? "var(--color-negative)" : pct >= 80 ? "var(--color-warning)" : "var(--color-positive)";
    const handleReset = () => {
      setConfirmModal({
        title: "Reset",
        message: "Resettare le calorie di oggi?",
        onConfirm: () => {
          setCounts({});
          setExtras([]);
          setVarGrams({});
          setLog([]);
        }
      });
    };
    const getTabs = () => {
      if (!user) return [];
      const t = ["oggi"];
      if (log.length > 0) t.push("menu");
      t.push("storico");
      t.push("alimenti");
      return t;
    };
    const onTouchStart = (e) => {
      swipeStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = (e) => {
      if (!swipeStart.current || !user) return;
      const dx = e.changedTouches[0].clientX - swipeStart.current.x;
      const dy = e.changedTouches[0].clientY - swipeStart.current.y;
      swipeStart.current = null;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      const tabs = getTabs();
      const idx = tabs.indexOf(activeTab);
      if (dx < 0 && idx < tabs.length - 1) setActiveTab(tabs[idx + 1]);
      if (dx > 0 && idx > 0) setActiveTab(tabs[idx - 1]);
    };
    const saveDayTarget = (date) => {
      const t = parseInt(editingDayTarget?.draft, 10);
      setEditingDayTarget(null);
      if (!t || t <= 0) return;
      setHistory((prev) => prev.map((d) => d.date === date ? { ...d, target: t } : d));
      db.collection("users").doc(user.uid).collection("days").doc(date).update({ target: t }).catch((e) => console.error("Day target update error:", e));
    };
    const catKcal = (ci) => dietData[ci].items.reduce((s, item) => {
      const qty = getCount(item.id);
      if (item.variable) return s + Math.round((varGrams[item.id] || 0) * item.kcalPerG) * qty;
      return s + item.kcal * qty;
    }, 0);
    const addExtra = () => {
      const v = parseInt(extraInput, 10);
      if (v > 0) {
        vibrate();
        const uid = Math.random().toString(36).slice(2, 8);
        const name = extraName.trim() || "Extra";
        setExtras((prev) => [...prev, { uid, name, kcal: v }]);
        setLog((prev) => [...prev, { type: "extra", uid, name, kcal: v, grams: 0, ts: (/* @__PURE__ */ new Date()).toISOString() }]);
        setExtraName("");
        setExtraInput("");
      }
    };
    const removeExtra = (uid) => {
      setExtras((prev) => prev.filter((e) => e.uid !== uid));
      setLog((prev) => prev.filter((e) => !(e.type === "extra" && e.uid === uid)));
    };
    const saveSettingsToFirestore = (newSchedule, newDefaultKcal) => {
      if (!user) return;
      db.collection("users").doc(user.uid).collection("config").doc("schedule").set({ schedule: newSchedule, defaultKcal: newDefaultKcal }).catch((e) => console.error("Settings save error:", e));
    };
    const saveSettings = () => {
      const parsed = parseInt(settingsDraft.defaultKcal, 10);
      const newDefaultKcal = parsed > 0 ? parsed : 2e3;
      setDefaultKcal(newDefaultKcal);
      setSchedule(settingsDraft.schedule);
      setTarget(newDefaultKcal);
      saveSettingsToFirestore(settingsDraft.schedule, newDefaultKcal);
      setSettingsOpen(false);
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("a", { href: "#main-content", className: "skip-link" }, "Vai al contenuto principale"), /* @__PURE__ */ React.createElement(ConfirmModal, { modal: confirmModal, onClose: () => setConfirmModal(null) }), notAllowed && /* @__PURE__ */ React.createElement("div", { className: "modal-overlay", role: "dialog", "aria-modal": "true", "aria-labelledby": "modal-title" }, /* @__PURE__ */ React.createElement("div", { className: "modal" }, /* @__PURE__ */ React.createElement("img", { src: "no.gif", alt: "", role: "presentation", style: { width: 313, maxWidth: "100%", height: "auto", borderRadius: 8, marginBottom: 12 } }), /* @__PURE__ */ React.createElement("div", { id: "modal-title", className: "modal-title" }, "Accesso non disponibile"), /* @__PURE__ */ React.createElement("div", { className: "modal-text" }, "Gli slot disponibili sono esauriti. Riprova pi\xF9 avanti."), /* @__PURE__ */ React.createElement("button", { className: "modal-btn", onClick: () => setNotAllowed(false) }, "Ok, capito"))), /* @__PURE__ */ React.createElement("div", { className: "sticky-top" }, /* @__PURE__ */ React.createElement("header", { className: "header" }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 520, margin: "0 auto" } }, /* @__PURE__ */ React.createElement("div", { className: "header-top" }, /* @__PURE__ */ React.createElement("img", { src: "logo-main-horizontal.png", alt: "kcalTracker", className: "app-logo" }), /* @__PURE__ */ React.createElement("div", { className: "header-top-right" }, /* @__PURE__ */ React.createElement("button", { className: "reset-btn", onClick: handleReset, "aria-label": "Azzera le calorie di oggi" }, "\u274C"), /* @__PURE__ */ React.createElement("button", { className: "theme-btn", onClick: () => setLightTheme((t) => !t), "aria-label": lightTheme ? "Passa al tema scuro" : "Passa al tema chiaro" }, lightTheme ? "\u{1F319}" : "\u2600\uFE0F"), user && /* @__PURE__ */ React.createElement("button", { className: "wizard-help-btn", onClick: () => {
      setWizardStep(0);
      setWizardOpen(true);
    }, "aria-label": "Apri guida funzionalit\xE0" }, "\u{1F9D9}"), user === void 0 ? null : user ? /* @__PURE__ */ React.createElement("div", { className: "profile-menu-wrap", ref: profileMenuRef }, /* @__PURE__ */ React.createElement("button", { className: "auth-btn logged", onClick: () => setProfileMenuOpen((v) => !v), "aria-label": "Menu profilo", "aria-expanded": profileMenuOpen, "aria-haspopup": "menu" }, user.photoURL && /* @__PURE__ */ React.createElement("img", { src: user.photoURL, className: "auth-avatar", alt: "" })), profileMenuOpen && /* @__PURE__ */ React.createElement("div", { className: "profile-dropdown", role: "menu" }, /* @__PURE__ */ React.createElement("button", { className: "profile-menu-item", role: "menuitem", onClick: () => {
      setProfileMenuOpen(false);
      setSettingsDraft({ defaultKcal: String(defaultKcal), schedule: [...schedule] });
      setSettingsOpen(true);
    } }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "\u2699\uFE0F"), " Impostazioni"), navigator.share && /* @__PURE__ */ React.createElement("button", { className: "profile-menu-item", role: "menuitem", onClick: async () => {
      setProfileMenuOpen(false);
      const shareData = { title: "kcalTracker", text: "Traccia le calorie con me su kcalTracker!", url: "https://vlrprbttst.github.io/kcalTracker" };
      try {
        const res = await fetch("https://vlrprbttst.github.io/kcalTracker/logo-main.png");
        const blob = await res.blob();
        const file = new File([blob], "kcalTracker.png", { type: blob.type });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }
      } catch (_) {
      }
      navigator.share(shareData);
    } }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "\u{1F4E4}"), " Condividi app"), pwaInteracted && !(window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) && /* @__PURE__ */ React.createElement("button", { className: "profile-menu-item", role: "menuitem", onClick: () => {
      setProfileMenuOpen(false);
      if (installEvent) {
        handleInstall();
      } else {
        const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
        if (isIOS) setInstallBanner("ios");
      }
    } }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "\u{1F4F2}"), " Installa app"), /* @__PURE__ */ React.createElement("button", { className: "profile-menu-item profile-menu-item-logout", role: "menuitem", onClick: () => {
      setProfileMenuOpen(false);
      logout();
    } }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "\u{1F6AA}"), " Logout"))) : /* @__PURE__ */ React.createElement("button", { className: "auth-btn", onClick: login }, "Accedi"))), /* @__PURE__ */ React.createElement("div", { className: "kcal-row", "aria-live": "polite", "aria-atomic": "true" }, /* @__PURE__ */ React.createElement("span", { className: `kcal-consumed${shakeTarget ? " shake" : ""}`, style: { color: barColor } }, totalKcal), /* @__PURE__ */ React.createElement("span", { className: "kcal-sep" }, "/"), /* @__PURE__ */ React.createElement("span", { className: "kcal-target-wrap" }, /* @__PURE__ */ React.createElement("span", { className: "kcal-target", "aria-label": `Obiettivo calorico: ${target} kcal` }, target), /* @__PURE__ */ React.createElement("span", { className: "kcal-label" }, "kcal")), /* @__PURE__ */ React.createElement("span", { className: "kcal-remaining" }, remaining >= 0 ? `${remaining} rimanenti` : `${Math.abs(remaining)} in eccesso`)), /* @__PURE__ */ React.createElement("div", { className: "progress-track" }, /* @__PURE__ */ React.createElement("div", { className: "progress-bar", style: { width: `${pct}%`, background: barColor } })))), user && /* @__PURE__ */ React.createElement("div", { className: "tabs-bar", role: "navigation", "aria-label": "Sezioni principali" }, /* @__PURE__ */ React.createElement("div", { className: "tabs-inner" }, /* @__PURE__ */ React.createElement("button", { ref: (el) => tabRefs.current["oggi"] = el, className: `tab-btn${activeTab === "oggi" ? " active" : ""}`, onClick: () => setActiveTab("oggi") }, "Oggi"), log.length > 0 && /* @__PURE__ */ React.createElement("button", { ref: (el) => tabRefs.current["menu"] = el, className: `tab-btn${activeTab === "menu" ? " active" : ""}`, onClick: () => setActiveTab("menu") }, "Menu"), /* @__PURE__ */ React.createElement("button", { ref: (el) => tabRefs.current["storico"] = el, "data-wizard": "storico-tab", className: `tab-btn${activeTab === "storico" ? " active" : ""}`, onClick: () => setActiveTab("storico") }, "Storico"), /* @__PURE__ */ React.createElement("button", { ref: (el) => tabRefs.current["alimenti"] = el, "data-wizard": "alimenti-tab", className: `tab-btn${activeTab === "alimenti" ? " active" : ""}`, onClick: () => setActiveTab("alimenti") }, "Alimenti"), /* @__PURE__ */ React.createElement("div", { className: "tab-indicator", style: { left: indicatorStyle.left, width: indicatorStyle.width } }))), user && activeTab === "oggi" && /* @__PURE__ */ React.createElement("div", { className: "sticky-search" }, /* @__PURE__ */ React.createElement("div", { className: "search-wrap" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "search-input",
        type: "search",
        "aria-label": "Cerca alimento",
        placeholder: "Cerca alimento\u2026",
        value: searchQuery,
        onChange: (e) => {
          setSearchQuery(e.target.value);
          setOpenIdx(null);
        }
      }
    ), searchQuery && /* @__PURE__ */ React.createElement("button", { className: "search-clear", onClick: () => setSearchQuery(""), "aria-label": "Cancella ricerca" }, "\xD7"))), user && activeTab === "alimenti" && /* @__PURE__ */ React.createElement("div", { className: "sticky-search" }, /* @__PURE__ */ React.createElement("div", { className: "search-wrap" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "search-input",
        type: "search",
        "aria-label": "Cerca alimento",
        placeholder: "Cerca alimento\u2026",
        value: adminSearchQuery,
        onChange: (e) => {
          setAdminSearchQuery(e.target.value);
          setAdminEditId(null);
          setAdminNewItem(null);
        }
      }
    ), adminSearchQuery && /* @__PURE__ */ React.createElement("button", { className: "search-clear", onClick: () => setAdminSearchQuery(""), "aria-label": "Cancella ricerca" }, "\xD7")))), /* @__PURE__ */ React.createElement("main", { id: "main-content", className: "content", onTouchStart, onTouchEnd }, (!user || activeTab === "oggi") && /* @__PURE__ */ React.createElement(
      TrackerTab,
      {
        user,
        dietData,
        searchQuery,
        openIdx,
        setOpenIdx,
        varGrams,
        setVarGrams,
        setLog,
        extras,
        extraName,
        setExtraName,
        extraInput,
        setExtraInput,
        addExtra,
        removeExtra,
        getCount,
        inc,
        dec,
        catKcal,
        maxItemKcal,
        login
      }
    ), user && activeTab === "menu" && /* @__PURE__ */ React.createElement(MenuTab, { log, schedule }), user && activeTab === "storico" && /* @__PURE__ */ React.createElement(
      StoricoTab,
      {
        historyLoading,
        history,
        currentPage,
        setCurrentPage,
        openWeeks,
        toggleWeek,
        editingDayTarget,
        setEditingDayTarget,
        saveDayTarget,
        target,
        totalKcal,
        schedule
      }
    ), user && activeTab === "alimenti" && /* @__PURE__ */ React.createElement(
      AlimentiAdminTab,
      {
        user,
        dietData,
        setDietData,
        counts,
        itemById,
        setConfirmModal,
        adminSearchQuery,
        setAdminSearchQuery
      }
    )), user && /* @__PURE__ */ React.createElement(
      SettingsOverlay,
      {
        open: settingsOpen,
        setOpen: setSettingsOpen,
        wizardOpen,
        draft: settingsDraft,
        setDraft: setSettingsDraft,
        onSave: saveSettings
      }
    ), /* @__PURE__ */ React.createElement(
      Wizard,
      {
        open: wizardOpen,
        step: wizardStep,
        setStep: setWizardStep,
        setOpen: setWizardOpen,
        lightTheme,
        setActiveTab,
        activeTab
      }
    ), installBanner && /* @__PURE__ */ React.createElement("div", { className: "install-banner", role: "complementary", "aria-label": "Installa l'app" }, /* @__PURE__ */ React.createElement("div", { className: "install-banner-text" }, /* @__PURE__ */ React.createElement("strong", null, "Installa kcalTracker"), installBanner === "android" ? /* @__PURE__ */ React.createElement("span", null, "Aggiungila alla schermata home per un accesso rapido") : /* @__PURE__ */ React.createElement("span", null, "Tocca \u2B06 in basso, poi \xABAggiungi alla schermata Home\xBB")), /* @__PURE__ */ React.createElement("div", { className: "install-banner-actions" }, installBanner === "android" && /* @__PURE__ */ React.createElement("button", { className: "install-btn", onClick: handleInstall }, "Installa"), /* @__PURE__ */ React.createElement("button", { className: "install-dismiss", onClick: dismissInstall, "aria-label": "Chiudi banner installazione" }, "\xD7"))));
  }
  ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/kcalTracker/sw.js").catch(() => {
      });
    });
  }
})();
