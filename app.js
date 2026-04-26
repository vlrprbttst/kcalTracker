const {
  useState,
  useEffect,
  useRef
} = React;
const firebaseConfig = {
  apiKey: "AIzaSyBCY1ONerEeZ6Ysa34222hZ-JzJ_rIjcZI",
  authDomain: "kcaltracker-5dd56.firebaseapp.com",
  projectId: "kcaltracker-5dd56",
  storageBucket: "kcaltracker-5dd56.firebasestorage.app",
  messagingSenderId: "857152386346",
  appId: "1:857152386346:web:d28c844e6291c315471a53"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const dietData = [{
  category: "Carboidrati",
  icon: "🍞",
  items: [{
    id: "r7m2k9",
    name: "Rosetta",
    portion: "120g",
    kcal: 340
  }, {
    id: "b4x8q3",
    name: "Basmati cotto",
    portion: "g",
    kcal: 0,
    variable: true,
    kcalPerG: 4 / 3
  }, {
    id: "t6n5p1",
    name: "Taralli",
    portion: "1 pacchetto",
    kcal: 280
  }, {
    id: "g9j3w7",
    name: "Gnocchi",
    portion: "g",
    kcal: 0,
    variable: true,
    kcalPerG: 1.5
  }, {
    id: "p2c8f6",
    name: "Pasta",
    portion: "g",
    kcal: 0,
    variable: true,
    kcalPerG: 3.6
  }]
}, {
  category: "Carne",
  icon: "🍗",
  items: [{
    id: "h5v4r2",
    name: "Pollo",
    portion: "150g",
    kcal: 165
  }]
}, {
  category: "Pesce",
  icon: "🐟",
  items: [{
    id: "e8k7n4",
    name: "Gratinato alle erbe",
    portion: "½ vaschetta",
    kcal: 400
  }, {
    id: "c3p9m6",
    name: "Gratinato ai ceci",
    portion: "½ vaschetta",
    kcal: 350
  }, {
    id: "d7q2b5",
    name: "Gratinato patate/rosmarino",
    portion: "½ vaschetta",
    kcal: 240
  }, {
    id: "s4w6j8",
    name: "Tonno non sgocciolato",
    portion: "1 scatola",
    kcal: 200
  }, {
    id: "f1t9x3",
    name: "Tonno filo d'olio",
    portion: "1 scatola",
    kcal: 150
  }]
}, {
  category: "Uova",
  icon: "🥚",
  items: [{
    id: "u6r3k8",
    name: "Uova strapazzate",
    portion: "2 uova",
    kcal: 230
  }]
}, {
  category: "Secondi vegetali",
  icon: "🥬",
  items: [{
    id: "m7h4v9",
    name: "Miniburger broccoli zucchine e carote",
    portion: "1 pezzo",
    kcal: 89
  }, {
    id: "n2f6p1",
    name: "Miniburger spinaci",
    portion: "1 pezzo",
    kcal: 95
  }, {
    id: "v5q8k3",
    name: "Cotoletta vegetale",
    portion: "1 pezzo",
    kcal: 220
  }, {
    id: "w9j2r6",
    name: "Straccetti di soia al sugo",
    portion: "1 porzione",
    kcal: 390
  }, {
    id: "a4b7x5",
    name: "Tofu al naturale",
    portion: "1 porzione",
    kcal: 190
  }, {
    id: "c6p1w9",
    name: "Nuggets croccanti",
    portion: "½ porzione",
    kcal: 233
  }]
}, {
  category: "Legumi",
  icon: "🍲",
  items: [{
    id: "j3x9k2",
    name: "Borlotti",
    portion: "1 lattina",
    kcal: 120
  }, {
    id: "o8m5t7",
    name: "Fagioli cannellini",
    portion: "1 lattina",
    kcal: 109
  }]
}, {
  category: "Zuppe",
  icon: "🍜",
  items: [{
    id: "t2v8r4",
    name: "Antichi sapori",
    portion: "1 porzione",
    kcal: 350
  }, {
    id: "m3k6p9",
    name: "Verdurì Minestrone",
    portion: "1 porzione",
    kcal: 230
  }, {
    id: "s9f2j6",
    name: "Verdurì Zucca e carota",
    portion: "1 porzione",
    kcal: 220
  }]
}, {
  category: "Contorni",
  icon: "🥦",
  items: [{
    id: "l6v2n9",
    name: "Contorno leggerezza",
    portion: "225g",
    kcal: 60
  }, {
    id: "y4p8q1",
    name: "Contorno tricolore",
    portion: "225g",
    kcal: 55
  }, {
    id: "k7r3n5",
    name: "Patate al rosmarino",
    portion: "225g",
    kcal: 304
  }]
}, {
  category: "Formaggi",
  icon: "🧀",
  items: [{
    id: "z7j5w4",
    name: "Mozzarella",
    portion: "1 pezzo",
    kcal: 300
  }, {
    id: "i2n8b6",
    name: "Parmigiano",
    portion: "10g",
    kcal: 40
  }]
}, {
  category: "Condimenti",
  icon: "🍅",
  items: [{
    id: "q9r4k3",
    name: "Passata",
    portion: "g",
    kcal: 0,
    variable: true,
    kcalPerG: 0.3
  }, {
    id: "k5t7m2",
    name: "Curry sauce",
    portion: "1 porzione",
    kcal: 300
  }, {
    id: "x8j3c9",
    name: "Tikka masala sauce",
    portion: "g",
    kcal: 0,
    variable: true,
    kcalPerG: 1.32
  }, {
    id: "c1v6p4",
    name: "Olio",
    portion: "g",
    kcal: 0,
    variable: true,
    kcalPerG: 9
  }, {
    id: "n4k8r2",
    name: "Zucchero",
    portion: "1 cucchiaino",
    kcal: 18
  }]
}, {
  category: "Merende",
  icon: "🥄",
  items: [{
    id: "r3q9f7",
    name: "Yogurt bianco",
    portion: "1 vasetto",
    kcal: 50
  }, {
    id: "m6k2w8",
    name: "Mela gialla",
    portion: "1 medio-piccola",
    kcal: 67
  }, {
    id: "g4h7r5",
    name: "Cono gelato medio",
    portion: "3 gusti cremosi + panna",
    kcal: 450
  }, {
    id: "d5n1q8",
    name: "Latte parz. scremato UHT",
    portion: "1 tazza (200ml)",
    kcal: 96
  }]
}, {
  category: "Altro",
  icon: "🥟",
  items: [{
    id: "b9j4n3",
    name: "Bao",
    portion: "1 pezzo",
    kcal: 375
  }, {
    id: "v2b8m6",
    name: "Ravioli vapore arancioni",
    portion: "1 pezzo",
    kcal: 36
  }, {
    id: "p5x1k9",
    name: "Pizza margherita grande",
    portion: "1 pizza",
    kcal: 1000
  }, {
    id: "e7w4t2",
    name: "Kebab",
    portion: "1 panino/piadina farcita",
    kcal: 1000
  }]
}, {
  category: "Fritti",
  icon: "🍟",
  items: [{
    id: "a3f9v6",
    name: "Cotoletta pollo Aia",
    portion: "1 pezzo",
    kcal: 200
  }, {
    id: "f8n2j4",
    name: "Patatine fritte",
    portion: "g",
    kcal: 0,
    variable: true,
    kcalPerG: 1.4
  }, {
    id: "s1r7b5",
    name: "Sofficino alla pizzaiola",
    portion: "1 pezzo",
    kcal: 144
  }, {
    id: "w6q4x8",
    name: "Supplì romano",
    portion: "1 pezzo",
    kcal: 250
  }, {
    id: "h2m5n8",
    name: "Gran fritto pastellato",
    portion: "225g",
    kcal: 315
  }]
}, {
  category: "Alcol",
  icon: "🍺",
  items: [{
    id: "t3m9k2",
    name: "Tennent's Super grande",
    portion: "44cl",
    kcal: 320
  }, {
    id: "p7h5w6",
    name: "Tennent's Super piccola",
    portion: "35.5cl",
    kcal: 260
  }, {
    id: "c4j2n8",
    name: "Ceres Strong Ale piccola",
    portion: "33cl",
    kcal: 198
  }, {
    id: "r9p6k3",
    name: "Ceres Strong Ale grande",
    portion: "50cl",
    kcal: 300
  }, {
    id: "b5v2m7",
    name: "Carlsberg Special Brew",
    portion: "40cl",
    kcal: 260
  }]
}];
const itemById = {};
const itemCategory = {};
dietData.forEach(cat => cat.items.forEach(item => {
  itemById[item.id] = item;
  itemCategory[item.id] = cat.category;
}));
const ALLOWED_UID = "f1rMJWrezfORvihvxM5EspY3FsA3";
const TODAY = () => new Date().toISOString().slice(0, 10);
const ACTIVE_DAY = () => {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const m = now.getHours() * 60 + now.getMinutes();
  if (m < 330) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};
function migrateCountKeys(counts, varGrams) {
  const isOld = key => /^\d+_\d+$/.test(key);
  const hasOld = Object.keys(counts).some(isOld) || Object.keys(varGrams).some(isOld);
  if (!hasOld) return {
    counts,
    varGrams,
    migrated: false
  };
  const newCounts = {};
  Object.entries(counts).forEach(([key, qty]) => {
    if (isOld(key)) {
      const [ci, ii] = key.split("_").map(Number);
      const item = dietData[ci]?.items[ii];
      if (item) newCounts[item.id] = qty;
    } else {
      newCounts[key] = qty;
    }
  });
  const newVarGrams = {};
  Object.entries(varGrams).forEach(([key, g]) => {
    if (isOld(key)) {
      const [ci, ii] = key.split("_").map(Number);
      const item = dietData[ci]?.items[ii];
      if (item) newVarGrams[item.id] = g;
    } else {
      newVarGrams[key] = g;
    }
  });
  return {
    counts: newCounts,
    varGrams: newVarGrams,
    migrated: true
  };
}
function loadLocalData() {
  try {
    const raw = localStorage.getItem("kcal_data");
    if (!raw) return {
      counts: {},
      extras: [],
      varGrams: {}
    };
    const data = JSON.parse(raw);
    if (data.date !== ACTIVE_DAY()) return {
      counts: {},
      extras: [],
      varGrams: {}
    };
    const {
      counts: mc,
      varGrams,
      migrated
    } = migrateCountKeys(data.counts || {}, data.varGrams || {});
    const counts = {
      ...mc
    };
    Object.keys(counts).forEach(id => {
      const it = itemById[id];
      if (it?.variable && !varGrams[id]) delete counts[id];
    });
    if (migrated) {
      localStorage.setItem("kcal_data", JSON.stringify({
        date: ACTIVE_DAY(),
        counts,
        extras: data.extras || [],
        varGrams
      }));
    }
    return {
      counts,
      extras: data.extras || [],
      varGrams
    };
  } catch {
    return {
      counts: {},
      extras: [],
      varGrams: {}
    };
  }
}
function loadTarget() {
  return parseInt(localStorage.getItem("kcal_target") || "2000", 10);
}
function computeTotal(counts, extras, varGrams = {}) {
  return Object.entries(counts).reduce((sum, [id, qty]) => {
    const item = itemById[id];
    if (!item) return sum;
    if (item.variable) return sum + Math.round((varGrams[id] || 0) * item.kcalPerG) * qty;
    return sum + item.kcal * qty;
  }, 0) + extras.reduce((s, e) => s + e.kcal, 0);
}
function buildItemsList(counts, extras, varGrams = {}) {
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
function getMealSlot(ts) {
  const d = new Date(ts);
  const m = d.getHours() * 60 + d.getMinutes();
  if (m < 330) return {
    key: "fuori-orario",
    label: "Fuori Orario"
  };
  if (m <= 630) return {
    key: "colazione",
    label: "Colazione"
  };
  if (m <= 720) return {
    key: "merenda-mat",
    label: "Merenda metà mattina"
  };
  if (m <= 900) return {
    key: "pranzo",
    label: "Pranzo"
  };
  if (m <= 1140) return {
    key: "merenda-pom",
    label: "Merenda pomeriggio"
  };
  if (m <= 1320) return {
    key: "cena",
    label: "Cena"
  };
  return {
    key: "fuori-orario",
    label: "Fuori Orario"
  };
}
function groupLogByMeal(log) {
  const groups = {},
    order = [];
  log.forEach(entry => {
    const {
      key,
      label
    } = getMealSlot(entry.ts);
    if (!groups[key]) {
      groups[key] = {
        key,
        label,
        items: []
      };
      order.push(key);
    }
    groups[key].items.push(entry);
  });
  return order.map(k => groups[k]);
}
function groupEntries(entries) {
  const map = new Map();
  for (const e of entries) {
    const key = e.name + (e.grams > 0 ? `-${e.grams}` : '');
    if (map.has(key)) {
      const g = map.get(key);
      g.count++;
      g.totalKcal += e.kcal;
    } else {
      map.set(key, {
        ...e,
        count: 1,
        totalKcal: e.kcal
      });
    }
  }
  return Array.from(map.values());
}
function getWeekStart(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  const daysSinceFriday = (d.getDay() + 2) % 7;
  const friday = new Date(d);
  friday.setDate(d.getDate() - daysSinceFriday);
  return friday.toISOString().slice(0, 10);
}
function formatShortDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short"
  });
}
function groupByWeek(history) {
  const weeks = {};
  history.forEach(day => {
    const ws = getWeekStart(day.date);
    if (!weeks[ws]) weeks[ws] = [];
    weeks[ws].push(day);
  });
  return Object.entries(weeks).sort(([a], [b]) => b.localeCompare(a)).map(([weekStart, days]) => {
    const weekEnd = new Date(weekStart + "T12:00:00");
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().slice(0, 10);
    const totalConsumed = days.reduce((s, d) => s + (d.totalKcal || 0), 0);
    const balance = totalConsumed - 14000;
    return {
      weekStart,
      weekEndStr,
      days: days.sort((a, b) => b.date.localeCompare(a.date)),
      totalConsumed,
      balance
    };
  });
}
function getBimesterOf(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return {
    year: d.getFullYear(),
    bim: Math.floor(d.getMonth() / 2)
  };
}
function bimesterLabel(year, bim) {
  const months = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
  return `${months[bim * 2]} – ${months[bim * 2 + 1]} ${year}`;
}
function addBimesters(year, bim, delta) {
  let b = bim + delta,
    y = year;
  while (b < 0) {
    b += 6;
    y--;
  }
  while (b >= 6) {
    b -= 6;
    y++;
  }
  return {
    year: y,
    bim: b
  };
}
function getMonthName(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric"
  });
}
function formatDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}
const maxItemKcal = Math.max(...dietData.flatMap(c => c.items.filter(i => !i.variable).map(i => i.kcal)));
function KcalBar({
  kcal,
  max
}) {
  const pct = Math.min(kcal / max * 100, 100);
  const color = kcal > 400 ? "var(--color-negative)" : kcal > 250 ? "var(--color-warning)" : "var(--color-positive)";
  return /*#__PURE__*/React.createElement("div", {
    className: "bar-mini"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar-mini-fill",
    style: {
      width: `${pct}%`,
      background: color
    }
  }));
}
function App() {
  const [user, setUser] = useState(undefined);
  const [notAllowed, setNotAllowed] = useState(false);
  const [counts, setCounts] = useState(() => loadLocalData().counts);
  const [extras, setExtras] = useState(() => loadLocalData().extras);
  const [varGrams, setVarGrams] = useState(() => loadLocalData().varGrams);
  const [log, setLog] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [extraName, setExtraName] = useState("");
  const [extraInput, setExtraInput] = useState("");
  const [target, setTarget] = useState(loadTarget);
  const [openIdx, setOpenIdx] = useState(null);
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetDraft, setTargetDraft] = useState("");
  const [activeTab, setActiveTab] = useState("oggi");
  const swipeStart = useRef(null);
  const tabRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0
  });
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => getBimesterOf(ACTIVE_DAY()));
  const [openWeeks, setOpenWeeks] = useState(new Set());
  const [dataReady, setDataReady] = useState(false);
  const [shakeTarget, setShakeTarget] = useState(false);
  const [lightTheme, setLightTheme] = useState(() => localStorage.getItem("kcal_theme") === "light");
  const toggleWeek = ws => setOpenWeeks(prev => {
    const next = new Set(prev);
    next.has(ws) ? next.delete(ws) : next.add(ws);
    return next;
  });
  useEffect(() => {
    document.body.classList.toggle("light", lightTheme);
    localStorage.setItem("kcal_theme", lightTheme ? "light" : "dark");
  }, [lightTheme]);
  const targetInputRef = useRef(null);
  const saveDebounceRef = useRef(null);
  const prevOverTarget = useRef(false);
  useEffect(() => {
    return auth.onAuthStateChanged(async u => {
      if (u && u.uid !== ALLOWED_UID) {
        auth.signOut();
        setNotAllowed(true);
        return;
      }
      setUser(u);
      if (!u) {
        setCounts({});
        setExtras([]);
        setVarGrams({});
        setLog([]);
        setDataReady(false);
        return;
      }
      if (u) {
        try {
          const snap = await db.collection("users").doc(u.uid).collection("days").doc(ACTIVE_DAY()).get();
          if (snap.exists) {
            const data = snap.data();
            const {
              counts: mc,
              varGrams: mvg,
              migrated
            } = migrateCountKeys(data.counts || {}, data.varGrams || {});
            const sanitizedCounts = {
              ...mc
            };
            Object.keys(sanitizedCounts).forEach(id => {
              const it = itemById[id];
              if (it?.variable && !mvg[id]) delete sanitizedCounts[id];
            });
            const loadedExtras = (data.extras || []).map(e => e.uid ? e : {
              ...e,
              uid: Math.random().toString(36).slice(2, 8)
            });
            setCounts(sanitizedCounts);
            setExtras(loadedExtras);
            setVarGrams(mvg);
            setLog(data.log || []);
            if (data.target) setTarget(data.target);
            if (migrated) {
              db.collection("users").doc(u.uid).collection("days").doc(ACTIVE_DAY()).update({
                counts: mc,
                varGrams: mvg
              }).catch(e => console.error("Migration update error:", e));
            }
          }
          setDataReady(true);
        } catch (e) {
          console.error("Firestore load error — save disabled to prevent data loss:", e);
        }
      }
    });
  }, []);
  useEffect(() => {
    if (user === undefined || user) return;
    localStorage.setItem("kcal_data", JSON.stringify({
      date: ACTIVE_DAY(),
      counts,
      extras,
      varGrams
    }));
  }, [counts, extras, varGrams, user]);
  useEffect(() => {
    if (!user || !dataReady) return;
    clearTimeout(saveDebounceRef.current);
    saveDebounceRef.current = setTimeout(() => {
      const totalKcal = computeTotal(counts, extras, varGrams);
      const items = buildItemsList(counts, extras, varGrams);
      db.collection("users").doc(user.uid).collection("days").doc(ACTIVE_DAY()).set({
        counts,
        extras,
        varGrams,
        log,
        target,
        totalKcal,
        items,
        date: ACTIVE_DAY(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(e => console.error("Firestore save error:", e));
    }, 400);
  }, [counts, extras, varGrams, log, target, user, dataReady]);
  useEffect(() => {
    localStorage.setItem("kcal_target", String(target));
  }, [target]);
  const totalKcal = computeTotal(counts, extras, varGrams);
  useEffect(() => {
    const over = totalKcal > target;
    if (over && !prevOverTarget.current) {
      setShakeTarget(true);
      setTimeout(() => setShakeTarget(false), 400);
    }
    prevOverTarget.current = over;
  }, [totalKcal, target]);
  useEffect(() => {
    if (editingTarget && targetInputRef.current) targetInputRef.current.focus();
  }, [editingTarget]);
  useEffect(() => {
    if (activeTab === "menu" && log.length === 0) setActiveTab("oggi");
  }, [log, activeTab]);
  useEffect(() => {
    const btn = tabRefs.current[activeTab];
    if (btn) setIndicatorStyle({
      left: btn.offsetLeft,
      width: btn.offsetWidth
    });
  }, [activeTab, log.length]);
  useEffect(() => {
    if (activeTab !== "storico" || !user) return;
    setHistoryLoading(true);
    db.collection("users").doc(user.uid).collection("days").get().then(snap => {
      const docs = snap.docs.map(d => d.data()).filter(d => d.date !== ACTIVE_DAY()).sort((a, b) => b.date.localeCompare(a.date));
      setHistory(docs);
      setHistoryLoading(false);
    }).catch(() => setHistoryLoading(false));
  }, [activeTab, user]);
  const login = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(console.error);
  };
  const logout = () => {
    if (window.confirm("Esci dall'account?")) auth.signOut();
  };
  const getCount = id => counts[id] || 0;
  const vibrate = () => {
    try {
      navigator.vibrate && navigator.vibrate(30);
    } catch {}
  };
  const inc = (id, e) => {
    e.stopPropagation();
    vibrate();
    const item = itemById[id];
    const grams = varGrams[id] || 0;
    const kcal = item.variable ? Math.round(grams * item.kcalPerG) : item.kcal;
    setCounts(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
    setLog(prev => [...prev, {
      type: 'item',
      id,
      name: item.name,
      kcal,
      grams,
      category: itemCategory[id] || '',
      ts: new Date().toISOString()
    }]);
  };
  const dec = (id, e) => {
    e.stopPropagation();
    const item = itemById[id];
    setCounts(prev => {
      const next = (prev[id] || 0) - 1;
      if (next <= 0) {
        if (item?.variable) setVarGrams(vg => {
          const {
            [id]: _,
            ...rest
          } = vg;
          return rest;
        });
        const {
          [id]: _,
          ...rest
        } = prev;
        return rest;
      }
      return {
        ...prev,
        [id]: next
      };
    });
    setLog(prev => {
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].type === 'item' && prev[i].id === id) {
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
    if (window.confirm("Resettare le calorie di oggi?")) {
      setCounts({});
      setExtras([]);
      setVarGrams({});
      setLog([]);
    }
  };
  const getTabs = () => {
    if (!user) return [];
    const t = ["oggi"];
    if (log.length > 0) t.push("menu");
    t.push("storico");
    return t;
  };
  const onTouchStart = e => {
    swipeStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };
  const onTouchEnd = e => {
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
  const startEditTarget = () => {
    setTargetDraft(String(target));
    setEditingTarget(true);
  };
  const commitTarget = () => {
    const v = parseInt(targetDraft, 10);
    if (v > 0) setTarget(v);
    setEditingTarget(false);
  };
  const catKcal = ci => dietData[ci].items.reduce((s, item) => {
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
      setExtras(prev => [...prev, {
        uid,
        name,
        kcal: v
      }]);
      setLog(prev => [...prev, {
        type: 'extra',
        uid,
        name,
        kcal: v,
        grams: 0,
        ts: new Date().toISOString()
      }]);
      setExtraName("");
      setExtraInput("");
    }
  };
  const removeExtra = uid => {
    setExtras(prev => prev.filter(e => e.uid !== uid));
    setLog(prev => prev.filter(e => !(e.type === 'extra' && e.uid === uid)));
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("a", {
    href: "#main-content",
    className: "skip-link"
  }, "Vai al contenuto principale"), notAllowed && /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": "modal-title"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal"
  }, /*#__PURE__*/React.createElement("img", {
    src: "no.gif",
    alt: "",
    role: "presentation",
    style: {
      width: 313,
      maxWidth: "100%",
      height: "auto",
      borderRadius: 8,
      marginBottom: 12
    }
  }), /*#__PURE__*/React.createElement("div", {
    id: "modal-title",
    className: "modal-title"
  }, "Accesso negato"), /*#__PURE__*/React.createElement("div", {
    className: "modal-text"
  }, "Non puoi loggarti a meno che tu non sia il creatore dell'app!"), /*#__PURE__*/React.createElement("button", {
    className: "modal-btn",
    onClick: () => setNotAllowed(false)
  }, "Ok, capito"))), /*#__PURE__*/React.createElement("header", {
    className: "header"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 520,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "header-top"
  }, /*#__PURE__*/React.createElement("img", {
    src: "logo2.png",
    alt: "kcalTracker",
    className: "app-logo"
  }), /*#__PURE__*/React.createElement("div", {
    className: "header-top-right"
  }, /*#__PURE__*/React.createElement("button", {
    className: "reset-btn",
    onClick: handleReset,
    "aria-label": "Azzera le calorie di oggi"
  }, "Reset"), /*#__PURE__*/React.createElement("button", {
    className: "theme-btn",
    onClick: () => setLightTheme(t => !t),
    "aria-label": lightTheme ? "Passa al tema scuro" : "Passa al tema chiaro"
  }, lightTheme ? "🌙" : "☀️"), user === undefined ? null : user ? /*#__PURE__*/React.createElement("button", {
    className: "auth-btn logged",
    onClick: logout,
    "aria-label": `Esci dall'account ${user.displayName || ''}`
  }, user.photoURL && /*#__PURE__*/React.createElement("img", {
    src: user.photoURL,
    className: "auth-avatar",
    alt: ""
  }), "Esci") : /*#__PURE__*/React.createElement("button", {
    className: "auth-btn",
    onClick: login
  }, "Accedi"))), /*#__PURE__*/React.createElement("div", {
    className: "kcal-row",
    "aria-live": "polite",
    "aria-atomic": "true"
  }, /*#__PURE__*/React.createElement("span", {
    className: `kcal-consumed${shakeTarget ? " shake" : ""}`,
    style: {
      color: barColor
    }
  }, totalKcal), /*#__PURE__*/React.createElement("span", {
    className: "kcal-sep"
  }, "/"), /*#__PURE__*/React.createElement("span", {
    className: "kcal-target-wrap"
  }, editingTarget ? /*#__PURE__*/React.createElement("input", {
    ref: targetInputRef,
    className: "kcal-target-input",
    "aria-label": "Obiettivo calorico giornaliero",
    value: targetDraft,
    onChange: e => setTargetDraft(e.target.value),
    onBlur: commitTarget,
    onKeyDown: e => {
      if (e.key === "Enter") commitTarget();
      if (e.key === "Escape") setEditingTarget(false);
    },
    type: "number"
  }) : /*#__PURE__*/React.createElement("span", {
    className: "kcal-target",
    onClick: startEditTarget,
    role: "button",
    tabIndex: 0,
    "aria-label": `Obiettivo calorico: ${target} kcal. Premi per modificare`,
    onKeyDown: e => {
      if (e.key === "Enter" || e.key === " ") startEditTarget();
    }
  }, target), /*#__PURE__*/React.createElement("span", {
    className: "kcal-label"
  }, "kcal")), /*#__PURE__*/React.createElement("span", {
    className: "kcal-remaining"
  }, remaining >= 0 ? `${remaining} rimanenti` : `${Math.abs(remaining)} in eccesso`)), /*#__PURE__*/React.createElement("div", {
    className: "progress-track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "progress-bar",
    style: {
      width: `${pct}%`,
      background: barColor
    }
  })), user && activeTab === "oggi" && /*#__PURE__*/React.createElement("div", {
    className: "search-wrap",
    style: {
      marginTop: 10,
      marginBottom: 0
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "search-input",
    type: "search",
    "aria-label": "Cerca alimento",
    placeholder: "Cerca alimento\u2026",
    value: searchQuery,
    onChange: e => {
      setSearchQuery(e.target.value);
      setOpenIdx(null);
    }
  }), searchQuery && /*#__PURE__*/React.createElement("button", {
    className: "search-clear",
    onClick: () => setSearchQuery(""),
    "aria-label": "Cancella ricerca"
  }, "\xD7")))), user && /*#__PURE__*/React.createElement("div", {
    className: "tabs-bar",
    role: "navigation",
    "aria-label": "Sezioni principali"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tabs-inner"
  }, /*#__PURE__*/React.createElement("button", {
    ref: el => tabRefs.current["oggi"] = el,
    className: `tab-btn${activeTab === "oggi" ? " active" : ""}`,
    onClick: () => setActiveTab("oggi")
  }, "Oggi"), log.length > 0 && /*#__PURE__*/React.createElement("button", {
    ref: el => tabRefs.current["menu"] = el,
    className: `tab-btn${activeTab === "menu" ? " active" : ""}`,
    onClick: () => setActiveTab("menu")
  }, "Menu"), /*#__PURE__*/React.createElement("button", {
    ref: el => tabRefs.current["storico"] = el,
    className: `tab-btn${activeTab === "storico" ? " active" : ""}`,
    onClick: () => setActiveTab("storico")
  }, "Storico"), /*#__PURE__*/React.createElement("div", {
    className: "tab-indicator",
    style: {
      left: indicatorStyle.left,
      width: indicatorStyle.width
    }
  }))), /*#__PURE__*/React.createElement("main", {
    id: "main-content",
    className: "content",
    onTouchStart: onTouchStart,
    onTouchEnd: onTouchEnd
  }, (!user || activeTab === "oggi") && /*#__PURE__*/React.createElement(React.Fragment, null, user && !searchQuery && /*#__PURE__*/React.createElement("button", {
    className: "close-all-btn",
    style: {
      visibility: openIdx !== null ? 'visible' : 'hidden'
    },
    onClick: () => setOpenIdx(null)
  }, "chiudi tutto"), user && (() => {
    const query = searchQuery.trim().toLowerCase();
    const visibleCats = dietData.map((cat, ci) => ({
      cat,
      ci,
      items: query ? cat.items.map((item, ii) => ({
        item,
        ii
      })).filter(({
        item
      }) => item.name.toLowerCase().includes(query)) : cat.items.map((item, ii) => ({
        item,
        ii
      }))
    })).filter(({
      items
    }) => !query || items.length > 0).filter(({
      cat
    }) => user || cat.category !== 'Alcol');
    const highlightName = name => {
      if (!query) return name;
      const idx = name.toLowerCase().indexOf(query);
      if (idx === -1) return name;
      return /*#__PURE__*/React.createElement(React.Fragment, null, name.slice(0, idx), /*#__PURE__*/React.createElement("span", {
        className: "search-highlight"
      }, name.slice(idx, idx + query.length)), name.slice(idx + query.length));
    };
    return visibleCats.map(({
      cat,
      ci,
      items
    }) => {
      const isOpen = query ? true : openIdx === ci;
      const kcalCat = catKcal(ci);
      const hasAny = kcalCat > 0;
      return /*#__PURE__*/React.createElement("div", {
        key: ci,
        className: `category-card${hasAny ? " has-checked" : ""}`
      }, /*#__PURE__*/React.createElement("button", {
        className: "category-btn",
        onClick: () => !query && setOpenIdx(isOpen ? null : ci),
        "aria-expanded": isOpen,
        "aria-controls": `cat-grid-${ci}`
      }, /*#__PURE__*/React.createElement("span", {
        className: "cat-icon",
        "aria-hidden": "true"
      }, cat.icon), /*#__PURE__*/React.createElement("span", {
        className: "cat-name"
      }, cat.category), hasAny && /*#__PURE__*/React.createElement("span", {
        className: "cat-kcal-badge"
      }, "+", kcalCat, " kcal"), !query && /*#__PURE__*/React.createElement("span", {
        className: "cat-meta"
      }, cat.items.length, " ", cat.items.length === 1 ? "alimento" : "alimenti"), !query && /*#__PURE__*/React.createElement("span", {
        className: `cat-arrow${isOpen ? " open" : ""}`
      }, "\u25BC")), isOpen && /*#__PURE__*/React.createElement("div", {
        id: `cat-grid-${ci}`,
        className: "items-grid"
      }, /*#__PURE__*/React.createElement("div", {
        className: "items-grid-label"
      }, "Alimento"), /*#__PURE__*/React.createElement("div", {
        className: "items-grid-label"
      }, "Porzione"), /*#__PURE__*/React.createElement("div", {
        className: "items-grid-label right"
      }, "Kcal"), /*#__PURE__*/React.createElement("div", {
        className: "items-grid-label"
      }), items.map(({
        item,
        ii
      }, idx) => {
        const qty = getCount(item.id);
        const isActive = qty > 0;
        if (item.variable) {
          const g = varGrams[item.id] || 0;
          const portionKcal = g > 0 ? Math.round(g * item.kcalPerG) : 0;
          const totalVar = portionKcal * qty;
          return /*#__PURE__*/React.createElement(React.Fragment, {
            key: ii
          }, idx > 0 && /*#__PURE__*/React.createElement("div", {
            className: "items-grid-sep"
          }), /*#__PURE__*/React.createElement("div", {
            className: `item-name${isActive ? " item-cell-active" : ""}`
          }, /*#__PURE__*/React.createElement("span", null, highlightName(item.name))), /*#__PURE__*/React.createElement("div", {
            className: `item-portion${isActive ? " item-cell-active" : ""}`
          }, /*#__PURE__*/React.createElement("input", {
            type: "number",
            className: "grams-input",
            "aria-label": `Grammi di ${item.name}`,
            placeholder: "Grammi",
            value: g || "",
            onChange: e => {
              e.stopPropagation();
              const val = parseInt(e.target.value, 10);
              setVarGrams(prev => {
                if (!val || val <= 0) {
                  const {
                    [item.id]: _,
                    ...rest
                  } = prev;
                  return rest;
                }
                return {
                  ...prev,
                  [item.id]: val
                };
              });
              if (val > 0 && getCount(item.id) > 0) {
                const newKcal = Math.round(val * item.kcalPerG);
                setLog(prev => {
                  for (let i = prev.length - 1; i >= 0; i--) {
                    if (prev[i].type === 'item' && prev[i].id === item.id) {
                      const updated = [...prev];
                      updated[i] = {
                        ...updated[i],
                        grams: val,
                        kcal: newKcal
                      };
                      return updated;
                    }
                  }
                  return prev;
                });
              }
            },
            onClick: e => e.stopPropagation(),
            min: "0"
          })), /*#__PURE__*/React.createElement("div", {
            className: `item-kcal-cell${isActive ? " item-cell-active" : ""}`
          }, /*#__PURE__*/React.createElement("span", {
            className: "item-kcal"
          }, g > 0 ? isActive ? totalVar : portionKcal : "–", g > 0 && isActive && qty > 1 && /*#__PURE__*/React.createElement("span", {
            style: {
              fontSize: 10,
              color: "var(--text-dimmer)",
              marginLeft: 3
            }
          }, "\xD7", qty)), /*#__PURE__*/React.createElement(KcalBar, {
            kcal: portionKcal,
            max: maxItemKcal
          })), /*#__PURE__*/React.createElement("div", {
            className: isActive ? "item-cell-active" : "",
            style: {
              minHeight: 44,
              padding: "0 14px 0 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end"
            }
          }, /*#__PURE__*/React.createElement("div", {
            className: "counter",
            onClick: e => e.stopPropagation(),
            role: "group",
            "aria-label": item.name
          }, /*#__PURE__*/React.createElement("button", {
            className: `counter-btn${isActive ? "" : " minus-disabled"}`,
            onClick: e => dec(item.id, e),
            "aria-label": `Rimuovi ${item.name}`,
            "aria-disabled": !isActive
          }, "\u2212"), /*#__PURE__*/React.createElement("span", {
            className: "counter-num",
            "aria-label": `${qty} porzioni`
          }, qty), /*#__PURE__*/React.createElement("button", {
            className: "counter-btn plus",
            onClick: e => inc(item.id, e),
            "aria-label": `Aggiungi ${item.name}`
          }, "+"))));
        }
        return /*#__PURE__*/React.createElement(React.Fragment, {
          key: ii
        }, idx > 0 && /*#__PURE__*/React.createElement("div", {
          className: "items-grid-sep"
        }), /*#__PURE__*/React.createElement("div", {
          className: `item-name${isActive ? " item-cell-active" : ""}`
        }, /*#__PURE__*/React.createElement("span", null, highlightName(item.name))), /*#__PURE__*/React.createElement("div", {
          className: `item-portion${isActive ? " item-cell-active" : ""}`
        }, item.portion), /*#__PURE__*/React.createElement("div", {
          className: `item-kcal-cell${isActive ? " item-cell-active" : ""}`
        }, /*#__PURE__*/React.createElement("span", {
          className: "item-kcal"
        }, isActive ? item.kcal * qty : item.kcal, isActive && qty > 1 && /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10,
            color: "var(--text-dimmer)",
            marginLeft: 3
          }
        }, "\xD7", qty)), /*#__PURE__*/React.createElement(KcalBar, {
          kcal: item.kcal,
          max: maxItemKcal
        })), /*#__PURE__*/React.createElement("div", {
          className: isActive ? "item-cell-active" : "",
          style: {
            minHeight: 44,
            padding: "0 14px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end"
          }
        }, /*#__PURE__*/React.createElement("div", {
          className: "counter",
          onClick: e => e.stopPropagation(),
          role: "group",
          "aria-label": item.name
        }, /*#__PURE__*/React.createElement("button", {
          className: `counter-btn${isActive ? "" : " minus-disabled"}`,
          onClick: e => dec(item.id, e),
          "aria-label": `Rimuovi ${item.name}`,
          "aria-disabled": !isActive
        }, "\u2212"), /*#__PURE__*/React.createElement("span", {
          className: "counter-num",
          "aria-label": `${qty} porzioni`
        }, qty), /*#__PURE__*/React.createElement("button", {
          className: "counter-btn plus",
          onClick: e => inc(item.id, e),
          "aria-label": `Aggiungi ${item.name}`
        }, "+"))));
      })));
    });
  })(), (() => {
    const extrasKcal = extras.reduce((s, e) => s + e.kcal, 0);
    const hasExtras = extras.length > 0;
    return /*#__PURE__*/React.createElement("div", {
      className: `category-card${hasExtras ? " has-checked" : ""}`,
      style: {
        marginTop: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 14px 0",
        fontWeight: 600,
        fontSize: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "cat-icon",
      "aria-hidden": "true"
    }, "\uD83E\uDDFE"), /*#__PURE__*/React.createElement("span", {
      className: "cat-name"
    }, user ? "Extra" : "Aggiungi alimento"), hasExtras && /*#__PURE__*/React.createElement("span", {
      className: "cat-kcal-badge"
    }, "+", extrasKcal, " kcal"), user && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "#a1a1aa",
        fontWeight: 400
      }
    }, "calorie libere")), /*#__PURE__*/React.createElement("div", {
      className: "extra-input-row"
    }, /*#__PURE__*/React.createElement("input", {
      className: "extra-kcal-input",
      type: "text",
      "aria-label": "Nome alimento",
      placeholder: "cosa hai mangiato\u2026",
      value: extraName,
      onChange: e => setExtraName(e.target.value),
      onKeyDown: e => {
        if (e.key === "Enter") addExtra();
      },
      style: {
        flex: 2
      }
    }), /*#__PURE__*/React.createElement("input", {
      className: "extra-kcal-input",
      type: "number",
      "aria-label": "Calorie",
      placeholder: "kcal",
      value: extraInput,
      onChange: e => setExtraInput(e.target.value),
      onKeyDown: e => {
        if (e.key === "Enter") addExtra();
      },
      min: "1",
      style: {
        flex: 1,
        minWidth: 0
      }
    }), /*#__PURE__*/React.createElement("button", {
      className: "extra-add-btn",
      onClick: addExtra,
      "aria-label": "Aggiungi alimento"
    }, "+")), hasExtras && /*#__PURE__*/React.createElement("div", {
      className: "extra-list"
    }, extras.map(item => /*#__PURE__*/React.createElement("div", {
      key: item.uid || item.name,
      className: "extra-item"
    }, /*#__PURE__*/React.createElement("span", {
      className: "extra-item-label"
    }, item.name), /*#__PURE__*/React.createElement("div", {
      className: "extra-item-right"
    }, /*#__PURE__*/React.createElement("span", {
      className: "extra-item-kcal"
    }, item.kcal, " kcal"), /*#__PURE__*/React.createElement("button", {
      className: "extra-remove-btn",
      onClick: () => removeExtra(item.uid),
      "aria-label": `Rimuovi ${item.name}`
    }, "\xD7"))))));
  })(), user && /*#__PURE__*/React.createElement("div", {
    className: "legend"
  }, [["var(--color-positive)", "<250 kcal"], ["var(--color-warning)", "250–400 kcal"], ["var(--color-negative)", ">400 kcal"]].map(([color, label]) => /*#__PURE__*/React.createElement("span", {
    key: label,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-block",
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: color,
      flexShrink: 0
    }
  }), label))), !user && /*#__PURE__*/React.createElement("div", {
    className: "guest-banner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "guest-banner-title"
  }, "\uD83E\uDDEA App in beta privata"), /*#__PURE__*/React.createElement("div", {
    className: "guest-banner-body"
  }, "Accedi per sbloccare la lista alimenti personalizzata, lo storico settimanale e la sincronizzazione tra dispositivi."), /*#__PURE__*/React.createElement("button", {
    className: "guest-banner-btn",
    onClick: login
  }, "Accedi con Google"))), user && activeTab === "menu" && (() => {
    const alcolLog = log.filter(e => e.category === 'Alcol');
    const foodLog = log.filter(e => e.category !== 'Alcol');
    return /*#__PURE__*/React.createElement("div", {
      className: "menu-tab"
    }, groupLogByMeal(foodLog).map(({
      key,
      label,
      items
    }) => {
      const slotTotal = items.reduce((s, e) => s + e.kcal, 0);
      return /*#__PURE__*/React.createElement("div", {
        key: key,
        className: "meal-group"
      }, /*#__PURE__*/React.createElement("div", {
        className: "meal-group-header"
      }, /*#__PURE__*/React.createElement("span", {
        className: "meal-group-label"
      }, label), /*#__PURE__*/React.createElement("span", {
        className: "meal-group-total"
      }, slotTotal, " kcal")), groupEntries(items).map((entry, i) => /*#__PURE__*/React.createElement("div", {
        key: i,
        className: "meal-entry"
      }, /*#__PURE__*/React.createElement("span", {
        className: "meal-entry-name"
      }, entry.name, entry.grams > 0 ? ` ${entry.grams}g` : '', entry.count > 1 ? ` ×${entry.count}` : ''), /*#__PURE__*/React.createElement("span", {
        className: "meal-entry-kcal"
      }, entry.totalKcal > 0 ? `${entry.totalKcal} kcal` : '–'))));
    }), alcolLog.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "meal-group meal-group-extra"
    }, /*#__PURE__*/React.createElement("div", {
      className: "meal-group-header"
    }, /*#__PURE__*/React.createElement("span", {
      className: "meal-group-label"
    }, "\uD83C\uDF7A Extra"), /*#__PURE__*/React.createElement("span", {
      className: "meal-group-total"
    }, alcolLog.reduce((s, e) => s + e.kcal, 0), " kcal")), groupEntries(alcolLog).map((entry, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "meal-entry"
    }, /*#__PURE__*/React.createElement("span", {
      className: "meal-entry-name"
    }, entry.name, entry.count > 1 ? ` ×${entry.count}` : ''), /*#__PURE__*/React.createElement("span", {
      className: "meal-entry-kcal"
    }, entry.totalKcal, " kcal")))), /*#__PURE__*/React.createElement("div", {
      className: "menu-legend"
    }, /*#__PURE__*/React.createElement("div", {
      className: "menu-legend-title"
    }, "Fasce orarie"), /*#__PURE__*/React.createElement("div", {
      className: "menu-legend-row"
    }, /*#__PURE__*/React.createElement("span", null, "Fuori Orario"), /*#__PURE__*/React.createElement("span", null, "00:00 \u2013 05:29 / 22:01 \u2013 23:59")), /*#__PURE__*/React.createElement("div", {
      className: "menu-legend-row"
    }, /*#__PURE__*/React.createElement("span", null, "Colazione"), /*#__PURE__*/React.createElement("span", null, "05:30 \u2013 10:30")), /*#__PURE__*/React.createElement("div", {
      className: "menu-legend-row"
    }, /*#__PURE__*/React.createElement("span", null, "Merenda met\xE0 mattina"), /*#__PURE__*/React.createElement("span", null, "10:31 \u2013 12:00")), /*#__PURE__*/React.createElement("div", {
      className: "menu-legend-row"
    }, /*#__PURE__*/React.createElement("span", null, "Pranzo"), /*#__PURE__*/React.createElement("span", null, "12:01 \u2013 15:00")), /*#__PURE__*/React.createElement("div", {
      className: "menu-legend-row"
    }, /*#__PURE__*/React.createElement("span", null, "Merenda pomeriggio"), /*#__PURE__*/React.createElement("span", null, "15:01 \u2013 19:00")), /*#__PURE__*/React.createElement("div", {
      className: "menu-legend-row"
    }, /*#__PURE__*/React.createElement("span", null, "Cena"), /*#__PURE__*/React.createElement("span", null, "19:01 \u2013 22:00"))));
  })(), user && activeTab === "storico" && /*#__PURE__*/React.createElement(React.Fragment, null, historyLoading ? /*#__PURE__*/React.createElement("div", {
    className: "history-empty"
  }, "Caricamento...") : (() => {
    const {
      year: curYear,
      bim: curBim
    } = getBimesterOf(ACTIVE_DAY());
    const currentWeekStart = getWeekStart(ACTIVE_DAY());
    const pageHistory = history.filter(d => {
      const {
        year,
        bim
      } = getBimesterOf(d.date);
      return year === currentPage.year && bim === currentPage.bim;
    });
    const weeks = groupByWeek(pageHistory);
    const hasPrev = history.some(d => {
      const {
        year,
        bim
      } = getBimesterOf(d.date);
      return year < currentPage.year || year === currentPage.year && bim < currentPage.bim;
    });
    const isCurrentPage = currentPage.year === curYear && currentPage.bim === curBim;
    let lastMonth = null;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "bimester-nav"
    }, /*#__PURE__*/React.createElement("button", {
      className: "bimester-btn",
      onClick: () => setCurrentPage(p => addBimesters(p.year, p.bim, -1)),
      disabled: !hasPrev
    }, "\u2190 prec"), /*#__PURE__*/React.createElement("span", {
      className: "bimester-label"
    }, bimesterLabel(currentPage.year, currentPage.bim)), /*#__PURE__*/React.createElement("button", {
      className: "bimester-btn",
      onClick: () => setCurrentPage(p => addBimesters(p.year, p.bim, 1)),
      disabled: isCurrentPage
    }, "succ \u2192")), weeks.length === 0 ? /*#__PURE__*/React.createElement("div", {
      className: "history-empty"
    }, "Nessun dato in questo periodo.") : weeks.map((week, i) => {
      const isCurrentWeek = week.weekStart === currentWeekStart;
      const isOpen = isCurrentWeek || openWeeks.has(week.weekStart);
      const weekMonth = getMonthName(week.weekStart);
      const showMonthHeader = weekMonth !== lastMonth;
      lastMonth = weekMonth;
      return /*#__PURE__*/React.createElement(React.Fragment, {
        key: i
      }, showMonthHeader && /*#__PURE__*/React.createElement("div", {
        className: "month-label"
      }, weekMonth), /*#__PURE__*/React.createElement("div", {
        className: "week-card"
      }, isCurrentWeek ? /*#__PURE__*/React.createElement("div", {
        className: "week-current-header"
      }, "Settimana in corso \xB7 ", formatShortDate(week.weekStart), " \u2192 ", formatShortDate(week.weekEndStr)) : (() => {
        const incomplete = week.days.length < 7;
        return /*#__PURE__*/React.createElement("div", {
          className: `week-accordion-header${incomplete ? " incomplete" : ""}`,
          onClick: () => toggleWeek(week.weekStart)
        }, /*#__PURE__*/React.createElement("div", {
          className: "week-acc-left"
        }, /*#__PURE__*/React.createElement("span", {
          className: "week-acc-dates"
        }, incomplete && "⚠️ ", formatShortDate(week.weekStart), " \u2192 ", formatShortDate(week.weekEndStr), /*#__PURE__*/React.createElement("span", {
          style: {
            fontWeight: 400,
            color: "var(--text-dimmer)",
            marginLeft: 6
          }
        }, week.days.length, "/7 giorni"))), !incomplete && /*#__PURE__*/React.createElement("span", {
          className: `week-acc-balance ${week.balance <= 0 ? "deficit" : "surplus"}`
        }, week.balance <= 0 ? `✅ Deficit ${Math.abs(week.balance).toLocaleString("it-IT")} kcal` : `⚠️ Surplus ${week.balance.toLocaleString("it-IT")} kcal`), /*#__PURE__*/React.createElement("span", {
          className: `week-acc-arrow${isOpen ? " open" : ""}`
        }, "\u25BC"));
      })(), isOpen && /*#__PURE__*/React.createElement(React.Fragment, null, week.days.map((day, j) => /*#__PURE__*/React.createElement("div", {
        key: j,
        className: "history-day",
        style: {
          borderRadius: 0,
          border: "none",
          borderTop: j > 0 ? "1px solid var(--border)" : "none"
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "history-day-header"
      }, /*#__PURE__*/React.createElement("span", {
        className: "history-day-date"
      }, formatDate(day.date)), /*#__PURE__*/React.createElement("span", {
        className: "history-day-kcal",
        style: {
          color: day.totalKcal > day.target ? "var(--color-negative)" : "var(--color-positive)"
        }
      }, day.totalKcal, " kcal")), day.log && day.log.length > 0 ? (() => {
        const alcolLog = day.log.filter(e => e.category === 'Alcol');
        const foodLog = day.log.filter(e => e.category !== 'Alcol');
        return /*#__PURE__*/React.createElement("div", {
          className: "history-log-groups"
        }, groupLogByMeal(foodLog).map(({
          key,
          label,
          items
        }) => /*#__PURE__*/React.createElement("div", {
          key: key,
          className: "history-log-group"
        }, /*#__PURE__*/React.createElement("span", {
          className: "history-log-label"
        }, label, ":"), /*#__PURE__*/React.createElement("span", {
          className: "history-log-items"
        }, groupEntries(items).map(e => e.name + (e.grams > 0 ? ` ${e.grams}g` : '') + (e.count > 1 ? ` ×${e.count}` : '')).join(', ')))), alcolLog.length > 0 && /*#__PURE__*/React.createElement("div", {
          className: "history-log-group"
        }, /*#__PURE__*/React.createElement("span", {
          className: "history-log-label"
        }, "\uD83C\uDF7A Extra:"), /*#__PURE__*/React.createElement("span", {
          className: "history-log-items"
        }, groupEntries(alcolLog).map(e => e.name + (e.count > 1 ? ` ×${e.count}` : '')).join(', '))));
      })() : day.items && day.items.length > 0 ? /*#__PURE__*/React.createElement("div", {
        className: "history-items"
      }, day.items.join(" · ")) : null)), /*#__PURE__*/React.createElement("div", {
        className: "week-summary"
      }, /*#__PURE__*/React.createElement("div", {
        className: "week-summary-row"
      }, /*#__PURE__*/React.createElement("span", null, "Media settimanale"), /*#__PURE__*/React.createElement("span", null, "14.000 kcal")), /*#__PURE__*/React.createElement("div", {
        className: "week-summary-row"
      }, /*#__PURE__*/React.createElement("span", null, "Calorie assunte"), /*#__PURE__*/React.createElement("span", null, week.totalConsumed.toLocaleString("it-IT"), " kcal")), !isCurrentWeek && week.days.length < 7 && /*#__PURE__*/React.createElement("div", {
        className: "week-incomplete-note"
      }, "\u26A0\uFE0F Dati parziali \u2014 ", 7 - week.days.length, " ", 7 - week.days.length === 1 ? "giorno non tracciato" : "giorni non tracciati", ". Il balance potrebbe non essere accurato."), (!isCurrentWeek || ACTIVE_DAY() === week.weekEndStr) && week.days.length === 7 && /*#__PURE__*/React.createElement("div", {
        className: "week-balance"
      }, week.balance <= 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "\u2705 Sei in deficit"), /*#__PURE__*/React.createElement("span", {
        className: "deficit"
      }, "\u2212", Math.abs(week.balance).toLocaleString("it-IT"), " kcal")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "\u26A0\uFE0F Sei in surplus"), /*#__PURE__*/React.createElement("span", {
        className: "surplus"
      }, "+", week.balance.toLocaleString("it-IT"), " kcal")))))));
    }));
  })())));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));