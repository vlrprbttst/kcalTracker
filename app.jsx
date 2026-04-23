const { useState, useEffect, useRef } = React;

const firebaseConfig = {
  apiKey: "AIzaSyBCY1ONerEeZ6Ysa34222hZ-JzJ_rIjcZI",
  authDomain: "kcaltracker-5dd56.firebaseapp.com",
  projectId: "kcaltracker-5dd56",
  storageBucket: "kcaltracker-5dd56.firebasestorage.app",
  messagingSenderId: "857152386346",
  appId: "1:857152386346:web:d28c844e6291c315471a53",
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const dietData = [
  {
    category: "Carboidrati", icon: "🍞",
    items: [
      { name: "Rosetta", portion: "120g", kcal: 340 },
      { name: "Basmati cotto", portion: "150g", kcal: 200 },
      { name: "Basmati cotto", portion: "200g", kcal: 270 },
      { name: "Taralli", portion: "1 pacchetto", kcal: 280 },
      { name: "Gnocchi", portion: "200g", kcal: 300 },
    ],
  },
  {
    category: "Carne", icon: "🍗",
    items: [
      { name: "Pollo", portion: "150g", kcal: 165 },
    ],
  },
  {
    category: "Pesce", icon: "🐟",
    items: [
      { name: "Gratinato alle erbe", portion: "½ vaschetta", kcal: 400 },
      { name: "Gratinato ai ceci", portion: "½ vaschetta", kcal: 350 },
      { name: "Gratinato patate/rosmarino", portion: "½ vaschetta", kcal: 240 },
      { name: "Tonno non sgocciolato", portion: "1 scatola", kcal: 200 },
      { name: "Tonno filo d'olio", portion: "1 scatola", kcal: 150 },
    ],
  },
  {
    category: "Uova", icon: "🥚",
    items: [{ name: "Uova strapazzate", portion: "2 uova", kcal: 230 }],
  },
  {
    category: "Secondi vegetali", icon: "🥬",
    items: [
      { name: "Miniburger broccoli zucchine e carote", portion: "1 pezzo", kcal: 89 },
      { name: "Miniburger spinaci", portion: "1 pezzo", kcal: 95 },
      { name: "Cotoletta vegetale", portion: "1 pezzo", kcal: 220 },
      { name: "Straccetti di soia al sugo", portion: "1 porzione", kcal: 390 },
      { name: "Tofu al naturale", portion: "1 porzione", kcal: 190 },
    ],
  },
  {
    category: "Legumi", icon: "🍲",
    items: [{ name: "Borlotti", portion: "1 lattina", kcal: 120 }],
  },
  {
    category: "Contorni", icon: "🥦",
    items: [
      { name: "Contorno leggerezza", portion: "225g", kcal: 60 },
      { name: "Contorno tricolore", portion: "225g", kcal: 55 },
    ],
  },
  {
    category: "Formaggi", icon: "🧀",
    items: [
      { name: "Mozzarella", portion: "1 pezzo", kcal: 300 },
      { name: "Parmigiano", portion: "10g", kcal: 40 },
    ],
  },
  {
    category: "Condimenti", icon: "🍅",
    items: [
      { name: "Passata", portion: "300g", kcal: 90 },
      { name: "Curry sauce", portion: "1 porzione", kcal: 300 },
      { name: "Tikka masala sauce", portion: "1 porzione", kcal: 200 },
      { name: "Olio", portion: "10g", kcal: 90 },
    ],
  },
  {
    category: "Merende", icon: "🥄",
    items: [
      { name: "Yogurt bianco", portion: "1 vasetto", kcal: 50 },
      { name: "Mela gialla", portion: "1 medio-piccola", kcal: 67 },
      { name: "Cono gelato medio", portion: "3 gusti cremosi + panna", kcal: 450 },
    ],
  },
  {
    category: "Altro", icon: "🥟",
    items: [
      { name: "Bao", portion: "1 pezzo", kcal: 375 },
      { name: "Ravioli vapore arancioni", portion: "1 pezzo", kcal: 36 },
      { name: "Pizza margherita grande", portion: "1 pizza", kcal: 1000 },
      { name: "Kebab", portion: "1 panino/piadina farcita", kcal: 1000 },
    ],
  },
  {
    category: "Fritti", icon: "🍟",
    items: [
      { name: "Cotoletta pollo Aia", portion: "1 pezzo", kcal: 200 },
      { name: "Patatine fritte", portion: "200g", kcal: 280 },
      { name: "Sofficino alla pizzaiola", portion: "1 pezzo", kcal: 144 },
      { name: "Supplì romano", portion: "1 pezzo", kcal: 250 },
    ],
  },
  {
    category: "Alcol", icon: "🍺",
    items: [
      { name: "Tennent's Super grande", portion: "44cl", kcal: 320 },
      { name: "Tennent's Super piccola", portion: "35.5cl", kcal: 260 },
      { name: "Ceres Strong Ale piccola", portion: "33cl", kcal: 198 },
      { name: "Ceres Strong Ale grande", portion: "50cl", kcal: 300 },
      { name: "Carlsberg Special Brew", portion: "40cl", kcal: 260 },
    ],
  },
];

const ALLOWED_UID = "f1rMJWrezfORvihvxM5EspY3FsA3";

const TODAY = () => new Date().toISOString().slice(0, 10);

function loadCounts() {
  try {
    const raw = localStorage.getItem("kcal_data");
    if (!raw) return {};
    const data = JSON.parse(raw);
    if (data.date !== TODAY()) return {};
    return data.counts || {};
  } catch { return {}; }
}

function loadExtras() {
  try {
    const raw = localStorage.getItem("kcal_data");
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (data.date !== TODAY()) return [];
    return data.extras || [];
  } catch { return []; }
}

function loadTarget() {
  return parseInt(localStorage.getItem("kcal_target") || "2000", 10);
}

function computeTotal(counts, extras) {
  return Object.entries(counts).reduce((sum, [key, qty]) => {
    const [ci, ii] = key.split("_").map(Number);
    return sum + (dietData[ci]?.items[ii]?.kcal || 0) * qty;
  }, 0) + extras.reduce((s, e) => s + e.kcal, 0);
}

function buildItemsList(counts, extras) {
  const items = [];
  Object.entries(counts).forEach(([key, qty]) => {
    const [ci, ii] = key.split("_").map(Number);
    const item = dietData[ci]?.items[ii];
    if (item && qty > 0) items.push(qty > 1 ? `${item.name} ×${qty}` : item.name);
  });
  extras.forEach(e => items.push(`${e.name} (extra, ${e.kcal} kcal)`));
  return items;
}

function getWeekStart(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  const daysSinceFriday = (d.getDay() + 2) % 7; // Fri=0, Sat=1, Sun=2, ..., Thu=6
  const friday = new Date(d);
  friday.setDate(d.getDate() - daysSinceFriday);
  return friday.toISOString().slice(0, 10);
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

function groupByWeek(history) {
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
      const balance = totalConsumed - 14000;
      return { weekStart, weekEndStr, days: days.sort((a, b) => b.date.localeCompare(a.date)), totalConsumed, balance };
    });
}

function getBimesterOf(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return { year: d.getFullYear(), bim: Math.floor(d.getMonth() / 2) };
}

function bimesterLabel(year, bim) {
  const months = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
  return `${months[bim * 2]} – ${months[bim * 2 + 1]} ${year}`;
}

function addBimesters(year, bim, delta) {
  let b = bim + delta, y = year;
  while (b < 0) { b += 6; y--; }
  while (b >= 6) { b -= 6; y++; }
  return { year: y, bim: b };
}

function getMonthName(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
}

const maxItemKcal = Math.max(...dietData.flatMap(c => c.items.map(i => i.kcal)));

function KcalBar({ kcal, max }) {
  const pct = Math.min((kcal / max) * 100, 100);
  const color = kcal > 400 ? "var(--color-negative)" : kcal > 250 ? "#fbbf24" : "var(--color-positive)";
  return (
    <div className="bar-mini">
      <div className="bar-mini-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function App() {
  const [user, setUser] = useState(undefined);
  const [notAllowed, setNotAllowed] = useState(false);
  const [counts, setCounts] = useState(loadCounts);
  const [extras, setExtras] = useState(loadExtras);
  const [searchQuery, setSearchQuery] = useState("");
  const [extraName, setExtraName] = useState("");
  const [extraInput, setExtraInput] = useState("");
  const [target, setTarget] = useState(loadTarget);
  const [openIdx, setOpenIdx] = useState(null);
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetDraft, setTargetDraft] = useState("");
  const [activeTab, setActiveTab] = useState("oggi");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => getBimesterOf(TODAY()));
  const [openWeeks, setOpenWeeks] = useState(new Set());

  const toggleWeek = (ws) => setOpenWeeks(prev => {
    const next = new Set(prev);
    next.has(ws) ? next.delete(ws) : next.add(ws);
    return next;
  });
  const [shakeTarget, setShakeTarget] = useState(false);
  const [lightTheme, setLightTheme] = useState(() => localStorage.getItem("kcal_theme") === "light");

  useEffect(() => {
    document.body.classList.toggle("light", lightTheme);
    localStorage.setItem("kcal_theme", lightTheme ? "light" : "dark");
  }, [lightTheme]);
  const targetInputRef = useRef(null);
  const saveDebounceRef = useRef(null);
  const prevOverTarget = useRef(false);

  useEffect(() => {
    return auth.onAuthStateChanged(async (u) => {
      if (u && u.uid !== ALLOWED_UID) {
        auth.signOut();
        setNotAllowed(true);
        return;
      }
      setUser(u);
      if (!u) {
        setCounts({});
        setExtras([]);
        return;
      }
      if (u) {
        try {
          const snap = await db.collection("users").doc(u.uid).collection("days").doc(TODAY()).get();
          if (snap.exists) {
            const data = snap.data();
            setCounts(data.counts || {});
            setExtras(data.extras || []);
            if (data.target) setTarget(data.target);
          }
        } catch (e) { console.error(e); }
      }
    });
  }, []);

  useEffect(() => {
    if (user === undefined || user) return;
    localStorage.setItem("kcal_data", JSON.stringify({ date: TODAY(), counts, extras }));
  }, [counts, extras, user]);

  useEffect(() => {
    if (!user) return;
    clearTimeout(saveDebounceRef.current);
    saveDebounceRef.current = setTimeout(() => {
      const totalKcal = computeTotal(counts, extras);
      const items = buildItemsList(counts, extras);
      db.collection("users").doc(user.uid).collection("days").doc(TODAY()).set({
        counts, extras, target, totalKcal, items, date: TODAY(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }, 1500);
  }, [counts, extras, target, user]);

  useEffect(() => {
    localStorage.setItem("kcal_target", String(target));
  }, [target]);

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
    if (activeTab !== "storico" || !user) return;
    setHistoryLoading(true);
    db.collection("users").doc(user.uid).collection("days")
      .get()
      .then(snap => {
        const docs = snap.docs
          .map(d => d.data())
          .filter(d => d.date !== TODAY())
          .sort((a, b) => b.date.localeCompare(a.date));
        setHistory(docs);
        setHistoryLoading(false);
      })
      .catch(() => setHistoryLoading(false));
  }, [activeTab, user]);

  const login = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(console.error);
  };

  const logout = () => {
    if (window.confirm("Esci dall'account?")) auth.signOut();
  };

  const getCount = (ci, ii) => counts[`${ci}_${ii}`] || 0;

  const vibrate = () => { try { navigator.vibrate && navigator.vibrate(30); } catch {} };

  const inc = (ci, ii, e) => {
    e.stopPropagation();
    vibrate();
    const key = `${ci}_${ii}`;
    setCounts(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  };

  const dec = (ci, ii, e) => {
    e.stopPropagation();
    const key = `${ci}_${ii}`;
    setCounts(prev => {
      const next = (prev[key] || 0) - 1;
      if (next <= 0) { const { [key]: _, ...rest } = prev; return rest; }
      return { ...prev, [key]: next };
    });
  };

  const totalKcal = computeTotal(counts, extras);
  const pct = Math.min((totalKcal / target) * 100, 100);
  const remaining = target - totalKcal;
  const barColor = pct >= 100 ? "var(--color-negative)" : pct >= 80 ? "#fbbf24" : "var(--color-positive)";

  const handleReset = () => {
    if (window.confirm("Resettare le calorie di oggi?")) { setCounts({}); setExtras([]); }
  };

  const startEditTarget = () => { setTargetDraft(String(target)); setEditingTarget(true); };
  const commitTarget = () => {
    const v = parseInt(targetDraft, 10);
    if (v > 0) setTarget(v);
    setEditingTarget(false);
  };

  const catKcal = (ci) => dietData[ci].items.reduce((s, item, ii) => s + item.kcal * getCount(ci, ii), 0);

  const addExtra = () => {
    const v = parseInt(extraInput, 10);
    if (v > 0) {
      vibrate();
      setExtras(prev => [...prev, { name: extraName.trim() || "Extra", kcal: v }]);
      setExtraName("");
      setExtraInput("");
    }
  };

  const removeExtra = (i) => setExtras(prev => prev.filter((_, idx) => idx !== i));

  return (
    <>
      {notAllowed && (
        <div className="modal-overlay">
          <div className="modal">
            <img src="no.gif" alt="" style={{ width: 313, maxWidth: "100%", height: "auto", borderRadius: 8, marginBottom: 12 }} />
            <div className="modal-title">Accesso negato</div>
            <div className="modal-text">Non puoi loggarti a meno che tu non sia il creatore dell'app!</div>
            <button className="modal-btn" onClick={() => setNotAllowed(false)}>Ok, capito</button>
          </div>
        </div>
      )}
      <div className="header">
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div className="header-top">
            <img src="logo2.png" alt="kcalTracker" className="app-logo" />
            <div className="header-top-right">
              <button className="reset-btn" onClick={handleReset}>Reset</button>
              <button className="theme-btn" onClick={() => setLightTheme(t => !t)} title="Cambia tema">
                {lightTheme ? "🌙" : "☀️"}
              </button>
              {user === undefined ? null : user ? (
                <button className="auth-btn logged" onClick={logout}>
                  {user.photoURL && <img src={user.photoURL} className="auth-avatar" />}
                  Esci
                </button>
              ) : (
                <button className="auth-btn" onClick={login}>Accedi</button>
              )}
            </div>
          </div>

          <div className="kcal-row">
            <span className={`kcal-consumed${shakeTarget ? " shake" : ""}`} style={{ color: barColor }}>{totalKcal}</span>
            <span className="kcal-sep">/</span>
            <span className="kcal-target-wrap">
              {editingTarget ? (
                <input
                  ref={targetInputRef}
                  className="kcal-target-input"
                  value={targetDraft}
                  onChange={e => setTargetDraft(e.target.value)}
                  onBlur={commitTarget}
                  onKeyDown={e => { if (e.key === "Enter") commitTarget(); if (e.key === "Escape") setEditingTarget(false); }}
                  type="number"
                />
              ) : (
                <span className="kcal-target" onClick={startEditTarget} title="Clicca per modificare">{target}</span>
              )}
              <span className="kcal-label">kcal</span>
            </span>
            <span className="kcal-remaining">
              {remaining >= 0 ? `${remaining} rimanenti` : `${Math.abs(remaining)} in eccesso`}
            </span>
          </div>

          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${pct}%`, background: barColor }} />
          </div>

          {(!user || activeTab === "oggi") && (
            <div className="search-wrap" style={{ marginTop: 10, marginBottom: 0 }}>
              <input
                className="search-input"
                type="text"
                placeholder="Cerca alimento…"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setOpenIdx(null); }}
              />
              {searchQuery && (
                <button className="search-clear" onClick={() => setSearchQuery("")}>×</button>
              )}
            </div>
          )}
        </div>
      </div>

      {user && (
        <div className="tabs-bar">
          <div className="tabs-inner">
            <button className={`tab-btn${activeTab === "oggi" ? " active" : ""}`} onClick={() => setActiveTab("oggi")}>Oggi</button>
            <button className={`tab-btn${activeTab === "storico" ? " active" : ""}`} onClick={() => setActiveTab("storico")}>Storico</button>
          </div>
        </div>
      )}

      <div className="content">
        {(!user || activeTab === "oggi") && (
          <>
            {!searchQuery && openIdx !== null && (
              <button className="close-all-btn" onClick={() => setOpenIdx(null)}>chiudi tutto</button>
            )}

            {(() => {
              const query = searchQuery.trim().toLowerCase();
              const visibleCats = dietData.map((cat, ci) => ({
                cat, ci,
                items: query
                  ? cat.items.map((item, ii) => ({ item, ii })).filter(({ item }) => item.name.toLowerCase().includes(query))
                  : cat.items.map((item, ii) => ({ item, ii })),
              })).filter(({ items }) => !query || items.length > 0);

              const highlightName = (name) => {
                if (!query) return name;
                const idx = name.toLowerCase().indexOf(query);
                if (idx === -1) return name;
                return <>{name.slice(0, idx)}<span className="search-highlight">{name.slice(idx, idx + query.length)}</span>{name.slice(idx + query.length)}</>;
              };

              return visibleCats.map(({ cat, ci, items }) => {
                const isOpen = query ? true : openIdx === ci;
                const kcalCat = catKcal(ci);
                const hasAny = kcalCat > 0;
                return (
                  <div key={ci} className={`category-card${hasAny ? " has-checked" : ""}`}>
                    <button className="category-btn" onClick={() => !query && setOpenIdx(isOpen ? null : ci)}>
                      <span className="cat-icon">{cat.icon}</span>
                      <span className="cat-name">{cat.category}</span>
                      {hasAny && <span className="cat-kcal-badge">+{kcalCat} kcal</span>}
                      {!query && <span className="cat-meta">{cat.items.length} {cat.items.length === 1 ? "alimento" : "alimenti"}</span>}
                      {!query && <span className={`cat-arrow${isOpen ? " open" : ""}`}>▼</span>}
                    </button>
                    {isOpen && (
                      <div className="items-grid">
                        <div className="items-grid-label">Alimento</div>
                        <div className="items-grid-label">Porzione</div>
                        <div className="items-grid-label right">Kcal</div>
                        <div className="items-grid-label"></div>
                        {items.map(({ item, ii }, idx) => {
                          const qty = getCount(ci, ii);
                          const isActive = qty > 0;
                          return (
                            <React.Fragment key={ii}>
                              {idx > 0 && <div className="items-grid-sep" />}
                              <div className="item-name"><span>{highlightName(item.name)}</span></div>
                              <div className="item-portion">{item.portion}</div>
                              <div className="item-kcal-cell">
                                <span className="item-kcal">
                                  {isActive ? item.kcal * qty : item.kcal}
                                  {isActive && qty > 1 && <span style={{ fontSize: 10, color: "var(--text-dimmer)", marginLeft: 3 }}>×{qty}</span>}
                                </span>
                                <KcalBar kcal={item.kcal} max={maxItemKcal} />
                              </div>
                              <div style={{ padding: "10px 0", display: "flex", justifyContent: "flex-end" }}>
                                <div className="counter" onClick={e => e.stopPropagation()}>
                                  <button className={`counter-btn${isActive ? "" : " minus-disabled"}`} onClick={e => dec(ci, ii, e)}>−</button>
                                  <span className="counter-num">{qty}</span>
                                  <button className="counter-btn plus" onClick={e => inc(ci, ii, e)}>+</button>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              });
            })()}

            {/* Extra card */}
            {(() => {
              const extrasKcal = extras.reduce((s, e) => s + e.kcal, 0);
              const hasExtras = extras.length > 0;
              return (
                <div className={`category-card${hasExtras ? " has-checked" : ""}`} style={{ marginTop: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px 0", fontWeight: 600, fontSize: 14 }}>
                    <span className="cat-icon">🧾</span>
                    <span className="cat-name">Extra</span>
                    {hasExtras && <span className="cat-kcal-badge">+{extrasKcal} kcal</span>}
                    <span style={{ fontSize: 12, color: "#a1a1aa", fontWeight: 400 }}>calorie libere</span>
                  </div>
                  <div className="extra-input-row">
                    <input
                      className="extra-kcal-input"
                      type="text"
                      placeholder="cosa hai mangiato…"
                      value={extraName}
                      onChange={e => setExtraName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") addExtra(); }}
                      style={{ flex: 2 }}
                    />
                    <input
                      className="extra-kcal-input"
                      type="number"
                      placeholder="kcal"
                      value={extraInput}
                      onChange={e => setExtraInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") addExtra(); }}
                      min="1"
                      style={{ flex: 1, minWidth: 0 }}
                    />
                    <button className="extra-add-btn" onClick={addExtra}>+</button>
                  </div>
                  {hasExtras && (
                    <div className="extra-list">
                      {extras.map((item, i) => (
                        <div key={i} className="extra-item">
                          <span className="extra-item-label">{item.name}</span>
                          <div className="extra-item-right">
                            <span className="extra-item-kcal">{item.kcal} kcal</span>
                            <button className="extra-remove-btn" onClick={() => removeExtra(i)}>×</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="legend">
              {[["var(--color-positive)", "<250 kcal"], ["#fbbf24", "250–400 kcal"], ["var(--color-negative)", ">400 kcal"]].map(([color, label]) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                  {label}
                </span>
              ))}
            </div>
          </>
        )}

        {user && activeTab === "storico" && (
          <>
            {historyLoading ? (
              <div className="history-empty">Caricamento...</div>
            ) : (() => {
              const { year: curYear, bim: curBim } = getBimesterOf(TODAY());
              const currentWeekStart = getWeekStart(TODAY());
              const pageHistory = history.filter(d => {
                const { year, bim } = getBimesterOf(d.date);
                return year === currentPage.year && bim === currentPage.bim;
              });
              const weeks = groupByWeek(pageHistory);
              const hasPrev = history.some(d => {
                const { year, bim } = getBimesterOf(d.date);
                return year < currentPage.year || (year === currentPage.year && bim < currentPage.bim);
              });
              const isCurrentPage = currentPage.year === curYear && currentPage.bim === curBim;
              let lastMonth = null;
              return (
                <>
                  <div className="bimester-nav">
                    <button className="bimester-btn" onClick={() => setCurrentPage(p => addBimesters(p.year, p.bim, -1))} disabled={!hasPrev}>← prec</button>
                    <span className="bimester-label">{bimesterLabel(currentPage.year, currentPage.bim)}</span>
                    <button className="bimester-btn" onClick={() => setCurrentPage(p => addBimesters(p.year, p.bim, 1))} disabled={isCurrentPage}>succ →</button>
                  </div>
                  {weeks.length === 0 ? (
                    <div className="history-empty">Nessun dato in questo periodo.</div>
                  ) : weeks.map((week, i) => {
                    const isCurrentWeek = week.weekStart === currentWeekStart;
                    const isOpen = isCurrentWeek || openWeeks.has(week.weekStart);
                    const weekMonth = getMonthName(week.weekStart);
                    const showMonthHeader = weekMonth !== lastMonth;
                    lastMonth = weekMonth;
                    return (
                      <React.Fragment key={i}>
                        {showMonthHeader && <div className="month-label">{weekMonth}</div>}
                        <div className="week-card">
                          {isCurrentWeek ? (
                            <div className="week-current-header">
                              Settimana in corso · {formatShortDate(week.weekStart)} → {formatShortDate(week.weekEndStr)}
                            </div>
                          ) : (() => {
                            const incomplete = week.days.length < 7;
                            return (
                              <div className={`week-accordion-header${incomplete ? " incomplete" : ""}`} onClick={() => toggleWeek(week.weekStart)}>
                                <div className="week-acc-left">
                                  <span className="week-acc-dates">
                                    {incomplete && "⚠️ "}{formatShortDate(week.weekStart)} → {formatShortDate(week.weekEndStr)}
                                    <span style={{ fontWeight: 400, color: "var(--text-dimmer)", marginLeft: 6 }}>{week.days.length}/7 giorni</span>
                                  </span>
                                  <span className={`week-acc-balance ${week.balance <= 0 ? "deficit" : "surplus"}`}>
                                    {week.balance <= 0
                                      ? `✅ Deficit ${Math.abs(week.balance).toLocaleString("it-IT")} kcal`
                                      : `⚠️ Surplus ${week.balance.toLocaleString("it-IT")} kcal`}
                                  </span>
                                </div>
                                <span className={`week-acc-arrow${isOpen ? " open" : ""}`}>▼</span>
                              </div>
                            );
                          })()}
                          {isOpen && (
                            <>
                              {week.days.map((day, j) => (
                                <div key={j} className="history-day" style={{ borderRadius: 0, border: "none", borderTop: j > 0 ? "1px solid var(--border)" : "none" }}>
                                  <div className="history-day-header">
                                    <span className="history-day-date">{formatDate(day.date)}</span>
                                    <span className="history-day-kcal" style={{ color: day.totalKcal > day.target ? "var(--color-negative)" : "var(--color-positive)" }}>
                                      {day.totalKcal} kcal
                                    </span>
                                  </div>
                                  {day.items && day.items.length > 0 && (
                                    <div className="history-items">{day.items.join(" · ")}</div>
                                  )}
                                </div>
                              ))}
                              <div className="week-summary">
                                <div className="week-summary-row">
                                  <span>Obiettivo settimana</span>
                                  <span>14.000 kcal</span>
                                </div>
                                <div className="week-summary-row">
                                  <span>Calorie ingerite</span>
                                  <span>{week.totalConsumed.toLocaleString("it-IT")} kcal</span>
                                </div>
                                {!isCurrentWeek && week.days.length < 7 && (
                                  <div className="week-incomplete-note">
                                    ⚠️ Dati parziali — {7 - week.days.length} {7 - week.days.length === 1 ? "giorno non tracciato" : "giorni non tracciati"}. Il balance potrebbe non essere accurato.
                                  </div>
                                )}
                                {(!isCurrentWeek || TODAY() === week.weekEndStr) && week.days.length === 7 && (
                                  <div className="week-balance">
                                    {week.balance <= 0 ? (
                                      <>
                                        <span>✅ Sei in deficit</span>
                                        <span className="deficit">−{Math.abs(week.balance).toLocaleString("it-IT")} kcal</span>
                                      </>
                                    ) : (
                                      <>
                                        <span>⚠️ Sei in surplus</span>
                                        <span className="surplus">+{week.balance.toLocaleString("it-IT")} kcal</span>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </>
              );
            })()}
          </>
        )}
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
