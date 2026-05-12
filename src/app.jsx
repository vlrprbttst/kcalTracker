import { auth, db, ALLOWED_UID } from './firebase.js';
import { SEED_DIET_DATA, seedItemById, seedItemCategory } from './seed.js';
import { TODAY, ACTIVE_DAY, migrateCountKeys, loadLocalData, loadTarget, computeTotal, buildItemsList } from './utils.js';
import { DEFAULT_SCHEDULE, minutesToTime, timeToMinutes, getMealSlot, groupLogByMeal, groupEntries } from './schedule.js';
import { getWeekStart, formatShortDate, groupByWeek, getBimesterOf, bimesterLabel, addBimesters, getMonthName, formatDate } from './history.js';
import ConfirmModal from './components/ConfirmModal.jsx';
import SettingsOverlay from './components/SettingsOverlay.jsx';
import Wizard, { WIZARD_STEPS } from './components/Wizard.jsx';
import MenuTab from './tabs/MenuTab.jsx';
import StoricoTab from './tabs/StoricoTab.jsx';
import AlimentiAdminTab from './tabs/AlimentiAdminTab.jsx';
import TrackerTab from './tabs/TrackerTab.jsx';

const { useState, useEffect, useRef, useMemo } = React;


function App() {
  const [user, setUser] = useState(undefined);
  const [notAllowed, setNotAllowed] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState({ defaultKcal: "2000", schedule: DEFAULT_SCHEDULE });
  const [defaultKcal, setDefaultKcal] = useState(2000);
  const [counts, setCounts] = useState(() => loadLocalData().counts);
  const [extras, setExtras] = useState(() => loadLocalData().extras);
  const [varGrams, setVarGrams] = useState(() => loadLocalData().varGrams);
  const [log, setLog] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [extraName, setExtraName] = useState("");
  const [extraInput, setExtraInput] = useState("");
  const [target, setTarget] = useState(loadTarget);
  const [openIdx, setOpenIdx] = useState(null);
  const [editingDayTarget, setEditingDayTarget] = useState(null);
  const [activeTab, setActiveTab] = useState("oggi");
  const swipeStart = useRef(null);
  const tabRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => getBimesterOf(ACTIVE_DAY()));
  const [openWeeks, setOpenWeeks] = useState(new Set());
  const [dataReady, setDataReady] = useState(false);
  const [shakeTarget, setShakeTarget] = useState(false);
  const [autoOpenWizard, setAutoOpenWizard] = useState(false);
  const [lightTheme, setLightTheme] = useState(() => localStorage.getItem("kcal_theme") === "light");
  const [confirmModal, setConfirmModal] = useState(null);
  const [installEvent, setInstallEvent] = useState(null);
  const [installBanner, setInstallBanner] = useState(null); // "android" | "ios" | null

  // dietData state — loaded from Firestore on login, seeded from SEED_DIET_DATA if absent
  const [dietData, setDietData] = useState(SEED_DIET_DATA);
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);

  const profileMenuRef = useRef(null);

  // Derived lookup maps — recomputed whenever dietData changes
  const itemById = useMemo(() => {
    const m = {};
    dietData.forEach(cat => cat.items.forEach(item => { m[item.id] = item; }));
    return m;
  }, [dietData]);

  const itemCategory = useMemo(() => {
    const m = {};
    dietData.forEach(cat => cat.items.forEach(item => { m[item.id] = cat.category; }));
    return m;
  }, [dietData]);

  const maxItemKcal = useMemo(() => {
    const fixed = dietData.flatMap(c => c.items.filter(i => !i.variable).map(i => i.kcal));
    return fixed.length > 0 ? Math.max(...fixed) : 1000;
  }, [dietData]);

  const toggleWeek = (ws) => setOpenWeeks(prev => {
    const next = new Set(prev);
    next.has(ws) ? next.delete(ws) : next.add(ws);
    return next;
  });

  useEffect(() => {
    document.body.classList.toggle("light", lightTheme);
    localStorage.setItem("kcal_theme", lightTheme ? "light" : "dark");
  }, [lightTheme]);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone || localStorage.getItem('pwa_dismissed')) return;
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafariOnly = /safari/i.test(navigator.userAgent) && !/chrome|chromium|crios|fxios/i.test(navigator.userAgent);
    if (isIOS && isSafariOnly) { setInstallBanner("ios"); return; }
    const handler = (e) => { e.preventDefault(); setInstallEvent(e); setInstallBanner("android"); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('has-install-banner', !!installBanner);
    return () => document.body.classList.remove('has-install-banner');
  }, [installBanner]);

  const handleInstall = async () => {
    if (!installEvent) return;
    installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    setInstallBanner(null);
    setInstallEvent(null);
    if (outcome === 'accepted') localStorage.setItem('pwa_dismissed', '1');
  };

  const dismissInstall = () => {
    setInstallBanner(null);
    localStorage.setItem('pwa_dismissed', '1');
  };

  const saveDebounceRef = useRef(null);
  const prevOverTarget = useRef(false);

  useEffect(() => {
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

      // Check access list and auto-register if slot available
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
          // Load day data, food list and schedule in parallel
          const [daySnap, foodsSnap, schedSnap] = await Promise.all([
            db.collection("users").doc(u.uid).collection("days").doc(ACTIVE_DAY()).get(),
            db.collection("users").doc(u.uid).collection("config").doc("foods").get(),
            db.collection("users").doc(u.uid).collection("config").doc("schedule").get(),
          ]);
          const loadedDefaultKcal = (schedSnap.exists && schedSnap.data().defaultKcal) ? schedSnap.data().defaultKcal : 2000;
          setDefaultKcal(loadedDefaultKcal);
          if (schedSnap.exists && schedSnap.data().schedule) {
            setSchedule(schedSnap.data().schedule);
          }

          // Handle food list: use Firestore version if present, otherwise seed
          const isFirstLogin = !foodsSnap.exists;
          let loadedDietData;
          if (foodsSnap.exists && foodsSnap.data().dietData) {
            loadedDietData = foodsSnap.data().dietData;
            // Auto-merge new items from SEED_DIET_DATA only for the owner
            if (u.uid === ALLOWED_UID) {
              const firestoreIds = new Set(loadedDietData.flatMap(c => c.items.map(i => i.id)));
              let needsMerge = false;
              const mergedData = loadedDietData.map(cat => {
                const seedCat = SEED_DIET_DATA.find(sc => sc.category === cat.category);
                if (!seedCat) return cat;
                const newItems = seedCat.items.filter(si => !firestoreIds.has(si.id));
                if (newItems.length === 0) return cat;
                needsMerge = true;
                return { ...cat, items: [...cat.items, ...newItems] };
              });
              const firestoreCats = new Set(loadedDietData.map(c => c.category));
              SEED_DIET_DATA.forEach(seedCat => {
                if (!firestoreCats.has(seedCat.category)) {
                  // Only add items whose IDs are not already present in any other category
                  // (prevents re-adding items that the user moved elsewhere before deleting the category)
                  const newItems = seedCat.items.filter(si => !firestoreIds.has(si.id));
                  if (newItems.length > 0) {
                    mergedData.push({ ...seedCat, items: newItems });
                    needsMerge = true;
                  }
                }
              });
              if (needsMerge) {
                loadedDietData = mergedData;
                db.collection("users").doc(u.uid).collection("config").doc("foods")
                  .set({ dietData: mergedData })
                  .catch(e => console.error("Merge diet data error:", e));
              }
            }
          } else {
            // Owner gets SEED_DIET_DATA, new users start with an empty list
            loadedDietData = u.uid === ALLOWED_UID ? SEED_DIET_DATA : [];
            db.collection("users").doc(u.uid).collection("config").doc("foods")
              .set({ dietData: loadedDietData })
              .catch(e => console.error("Seed diet data error:", e));
          }
          setDietData(loadedDietData);

          // Build lookup from the loaded food list for use in sanitization below
          const loadedItemById = {};
          loadedDietData.forEach(cat => cat.items.forEach(item => { loadedItemById[item.id] = item; }));

          // Handle today's day document
          if (daySnap.exists) {
            const data = daySnap.data();
            const { counts: mc, varGrams: mvg, migrated } = migrateCountKeys(data.counts || {}, data.varGrams || {});
            const sanitizedCounts = { ...mc };
            Object.keys(sanitizedCounts).forEach(id => {
              const it = loadedItemById[id];
              if (it?.variable && !mvg[id]) delete sanitizedCounts[id];
            });
            const loadedExtras = (data.extras || []).map(e => e.uid ? e : { ...e, uid: Math.random().toString(36).slice(2, 8) });
            setCounts(sanitizedCounts);
            setExtras(loadedExtras);
            setVarGrams(mvg);
            setLog(data.log || []);
            setTarget(data.target || loadedDefaultKcal);
            if (migrated) {
              db.collection("users").doc(u.uid).collection("days").doc(ACTIVE_DAY()).update({ counts: mc, varGrams: mvg }).catch(e => console.error("Migration update error:", e));
            }
          }
          if (!daySnap.exists) setTarget(loadedDefaultKcal);
          setDataReady(true);
          if (isFirstLogin) setAutoOpenWizard(true);
        } catch (e) {
          console.error("Firestore load error — save disabled to prevent data loss:", e);
        }
    });
  }, []);

  useEffect(() => {
    if (user === undefined || user) return;
    localStorage.setItem("kcal_data", JSON.stringify({ date: ACTIVE_DAY(), counts, extras, varGrams }));
  }, [counts, extras, varGrams, user]);

  useEffect(() => {
    if (!user || !dataReady) return;
    clearTimeout(saveDebounceRef.current);
    saveDebounceRef.current = setTimeout(() => {
      const totalKcal = computeTotal(counts, extras, varGrams, itemById);
      const items = buildItemsList(counts, extras, varGrams, itemById);
      db.collection("users").doc(user.uid).collection("days").doc(ACTIVE_DAY()).set({
        counts, extras, varGrams, log, target, totalKcal, items, date: ACTIVE_DAY(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }).catch(e => console.error("Firestore save error:", e));
    }, 400);
  }, [counts, extras, varGrams, log, target, user, dataReady]);

  useEffect(() => {
    localStorage.setItem("kcal_target", String(target));
  }, [target]);

  const totalKcal = computeTotal(counts, extras, varGrams, itemById);

  useEffect(() => {
    const over = totalKcal > target;
    if (over && !prevOverTarget.current) {
      setShakeTarget(true);
      setTimeout(() => setShakeTarget(false), 400);
    }
    prevOverTarget.current = over;
  }, [totalKcal, target]);

  useEffect(() => {
    if (activeTab === "menu" && log.length === 0) setActiveTab("oggi");
  }, [log, activeTab]);

  useEffect(() => {
    const btn = tabRefs.current[activeTab];
    if (btn) setIndicatorStyle({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [activeTab, log.length]);

  useEffect(() => {
    if (activeTab !== "storico" || !user) return;
    setHistoryLoading(true);
    db.collection("users").doc(user.uid).collection("days")
      .get()
      .then(snap => {
        const docs = snap.docs
          .map(d => d.data())
          .filter(d => d.date !== ACTIVE_DAY())
          .sort((a, b) => b.date.localeCompare(a.date));
        setHistory(docs);
        setHistoryLoading(false);
      })
      .catch(() => setHistoryLoading(false));
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab !== "alimenti") setAdminSearchQuery("");
  }, [activeTab]);

  useEffect(() => {
    if (dataReady && autoOpenWizard) {
      setWizardStep(0);
      setWizardOpen(true);
      setAutoOpenWizard(false);
    }
  }, [dataReady, autoOpenWizard]);

  useEffect(() => {
    if (!wizardOpen) { setSettingsOpen(false); setProfileMenuOpen(false); return; }
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

  useEffect(() => {
    if (!profileMenuOpen) return;
    const handler = (e) => {
      if (wizardOpen) return;
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
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
      onConfirm: () => auth.signOut(),
    });
  };

  const getCount = (id) => counts[id] || 0;

  const vibrate = () => { try { navigator.vibrate && navigator.vibrate(30); } catch {} };

  const inc = (id, e) => {
    e.stopPropagation();
    vibrate();
    const item = itemById[id];
    const grams = varGrams[id] || 0;
    const kcal = item.variable ? Math.round(grams * item.kcalPerG) : item.kcal;
    setCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setLog(prev => [...prev, { type: 'item', id, name: item.name, kcal, grams, category: itemCategory[id] || '', ts: new Date().toISOString() }]);
  };

  const dec = (id, e) => {
    e.stopPropagation();
    const item = itemById[id];
    setCounts(prev => {
      const next = (prev[id] || 0) - 1;
      if (next <= 0) {
        if (item?.variable) setVarGrams(vg => { const { [id]: _, ...rest } = vg; return rest; });
        const { [id]: _, ...rest } = prev; return rest;
      }
      return { ...prev, [id]: next };
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

  const pct = Math.min((totalKcal / target) * 100, 100);
  const remaining = target - totalKcal;
  const barColor = pct >= 100 ? "var(--color-negative)" : pct >= 80 ? "var(--color-warning)" : "var(--color-positive)";

  const handleReset = () => {
    setConfirmModal({
      title: "Reset",
      message: "Resettare le calorie di oggi?",
      onConfirm: () => { setCounts({}); setExtras([]); setVarGrams({}); setLog([]); },
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
    setHistory(prev => prev.map(d => d.date === date ? { ...d, target: t } : d));
    db.collection("users").doc(user.uid).collection("days").doc(date)
      .update({ target: t })
      .catch(e => console.error("Day target update error:", e));
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
      setExtras(prev => [...prev, { uid, name, kcal: v }]);
      setLog(prev => [...prev, { type: 'extra', uid, name, kcal: v, grams: 0, ts: new Date().toISOString() }]);
      setExtraName("");
      setExtraInput("");
    }
  };

  const removeExtra = (uid) => {
    setExtras(prev => prev.filter(e => e.uid !== uid));
    setLog(prev => prev.filter(e => !(e.type === 'extra' && e.uid === uid)));
  };

  // --- Admin tab functions ---

  const saveSettingsToFirestore = (newSchedule, newDefaultKcal) => {
    if (!user) return;
    db.collection("users").doc(user.uid).collection("config").doc("schedule")
      .set({ schedule: newSchedule, defaultKcal: newDefaultKcal })
      .catch(e => console.error("Settings save error:", e));
  };

  const saveSettings = () => {
    const parsed = parseInt(settingsDraft.defaultKcal, 10);
    const newDefaultKcal = (parsed > 0) ? parsed : 2000;
    setDefaultKcal(newDefaultKcal);
    setSchedule(settingsDraft.schedule);
    setTarget(newDefaultKcal);
    saveSettingsToFirestore(settingsDraft.schedule, newDefaultKcal);
    setSettingsOpen(false);
  };

  return (
    <>
      <a href="#main-content" className="skip-link">Vai al contenuto principale</a>

      <ConfirmModal modal={confirmModal} onClose={() => setConfirmModal(null)} />

      {notAllowed && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal">
            <img src="no.gif" alt="" role="presentation" style={{ width: 313, maxWidth: "100%", height: "auto", borderRadius: 8, marginBottom: 12 }} />
            <div id="modal-title" className="modal-title">Accesso non disponibile</div>
            <div className="modal-text">Gli slot disponibili sono esauriti. Riprova più avanti.</div>
            <button className="modal-btn" onClick={() => setNotAllowed(false)}>Ok, capito</button>
          </div>
        </div>
      )}
      <div className="sticky-top">
      <header className="header">
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div className="header-top">
            <img src="logo-main-horizontal.png" alt="kcalTracker" className="app-logo" />
            <div className="header-top-right">
              <button className="reset-btn" onClick={handleReset} aria-label="Azzera le calorie di oggi">❌</button>
              <button className="theme-btn" onClick={() => setLightTheme(t => !t)} aria-label={lightTheme ? "Passa al tema scuro" : "Passa al tema chiaro"}>
                {lightTheme ? "🌙" : "☀️"}
              </button>
              {user && (
                <button className="wizard-help-btn" onClick={() => { setWizardStep(0); setWizardOpen(true); }} aria-label="Apri guida funzionalità">🧙</button>
              )}
              {user === undefined ? null : user ? (
                <div className="profile-menu-wrap" ref={profileMenuRef}>
                  <button className="auth-btn logged" onClick={() => setProfileMenuOpen(v => !v)} aria-label="Menu profilo" aria-expanded={profileMenuOpen} aria-haspopup="menu">
                    {user.photoURL && <img src={user.photoURL} className="auth-avatar" alt="" />}
                  </button>
                  {profileMenuOpen && (
                    <div className="profile-dropdown" role="menu">
                      <button className="profile-menu-item" role="menuitem" onClick={() => { setProfileMenuOpen(false); setSettingsDraft({ defaultKcal: String(defaultKcal), schedule: [...schedule] }); setSettingsOpen(true); }}>
                        <span aria-hidden="true">⚙️</span> Impostazioni
                      </button>
                      {navigator.share && (
                        <button className="profile-menu-item" role="menuitem" onClick={async () => {
                          setProfileMenuOpen(false);
                          const shareData = { title: 'kcalTracker', text: 'Traccia le calorie con me su kcalTracker!', url: 'https://vlrprbttst.github.io/kcalTracker' };
                          try {
                            const res = await fetch('https://vlrprbttst.github.io/kcalTracker/logo-main.png');
                            const blob = await res.blob();
                            const file = new File([blob], 'kcalTracker.png', { type: blob.type });
                            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                              shareData.files = [file];
                            }
                          } catch (_) {}
                          navigator.share(shareData);
                        }}>
                          <span aria-hidden="true">📤</span> Condividi app
                        </button>
                      )}
                      <button className="profile-menu-item profile-menu-item-logout" role="menuitem" onClick={() => { setProfileMenuOpen(false); logout(); }}>
                        <span aria-hidden="true">🚪</span> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button className="auth-btn" onClick={login}>Accedi</button>
              )}
            </div>
          </div>

          <div className="kcal-row" aria-live="polite" aria-atomic="true">
            <span className={`kcal-consumed${shakeTarget ? " shake" : ""}`} style={{ color: barColor }}>{totalKcal}</span>
            <span className="kcal-sep">/</span>
            <span className="kcal-target-wrap">
              <span className="kcal-target" aria-label={`Obiettivo calorico: ${target} kcal`}>{target}</span>
              <span className="kcal-label">kcal</span>
            </span>
            <span className="kcal-remaining">
              {remaining >= 0 ? `${remaining} rimanenti` : `${Math.abs(remaining)} in eccesso`}
            </span>
          </div>

          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${pct}%`, background: barColor }} />
          </div>

        </div>
      </header>

      {user && (
        <div className="tabs-bar" role="navigation" aria-label="Sezioni principali">
          <div className="tabs-inner">
            <button ref={el => tabRefs.current["oggi"] = el} className={`tab-btn${activeTab === "oggi" ? " active" : ""}`} onClick={() => setActiveTab("oggi")}>Oggi</button>
            {log.length > 0 && <button ref={el => tabRefs.current["menu"] = el} className={`tab-btn${activeTab === "menu" ? " active" : ""}`} onClick={() => setActiveTab("menu")}>Menu</button>}
            <button ref={el => tabRefs.current["storico"] = el} data-wizard="storico-tab" className={`tab-btn${activeTab === "storico" ? " active" : ""}`} onClick={() => setActiveTab("storico")}>Storico</button>
            <button ref={el => tabRefs.current["alimenti"] = el} data-wizard="alimenti-tab" className={`tab-btn${activeTab === "alimenti" ? " active" : ""}`} onClick={() => setActiveTab("alimenti")}>Alimenti</button>
            <div className="tab-indicator" style={{ left: indicatorStyle.left, width: indicatorStyle.width }} />
          </div>
        </div>
      )}
      {(user && activeTab === "oggi") && (
        <div className="sticky-search">
          <div className="search-wrap">
            <input
              className="search-input"
              type="search"
              aria-label="Cerca alimento"
              placeholder="Cerca alimento…"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setOpenIdx(null); }}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery("")} aria-label="Cancella ricerca">×</button>
            )}
          </div>
        </div>
      )}
      {(user && activeTab === "alimenti") && (
        <div className="sticky-search">
          <div className="search-wrap">
            <input
              className="search-input"
              type="search"
              aria-label="Cerca alimento"
              placeholder="Cerca alimento…"
              value={adminSearchQuery}
              onChange={e => { setAdminSearchQuery(e.target.value); setAdminEditId(null); setAdminNewItem(null); }}
            />
            {adminSearchQuery && (
              <button className="search-clear" onClick={() => setAdminSearchQuery("")} aria-label="Cancella ricerca">×</button>
            )}
          </div>
        </div>
      )}
      </div>

      <main id="main-content" className="content" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {(!user || activeTab === "oggi") && (
          <TrackerTab
            user={user}
            dietData={dietData}
            searchQuery={searchQuery}
            openIdx={openIdx}
            setOpenIdx={setOpenIdx}
            varGrams={varGrams}
            setVarGrams={setVarGrams}
            setLog={setLog}
            extras={extras}
            extraName={extraName}
            setExtraName={setExtraName}
            extraInput={extraInput}
            setExtraInput={setExtraInput}
            addExtra={addExtra}
            removeExtra={removeExtra}
            getCount={getCount}
            inc={inc}
            dec={dec}
            catKcal={catKcal}
            maxItemKcal={maxItemKcal}
            login={login}
          />
        )}

        {user && activeTab === "menu" && <MenuTab log={log} schedule={schedule} />}

        {user && activeTab === "storico" && (
          <StoricoTab
            historyLoading={historyLoading}
            history={history}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            openWeeks={openWeeks}
            toggleWeek={toggleWeek}
            editingDayTarget={editingDayTarget}
            setEditingDayTarget={setEditingDayTarget}
            saveDayTarget={saveDayTarget}
            target={target}
            totalKcal={totalKcal}
            schedule={schedule}
          />
        )}

        {user && activeTab === "alimenti" && (
          <AlimentiAdminTab
            user={user}
            dietData={dietData}
            setDietData={setDietData}
            counts={counts}
            itemById={itemById}
            setConfirmModal={setConfirmModal}
            adminSearchQuery={adminSearchQuery}
            setAdminSearchQuery={setAdminSearchQuery}
          />
        )}

      </main>

      {user && (
        <SettingsOverlay
          open={settingsOpen}
          setOpen={setSettingsOpen}
          wizardOpen={wizardOpen}
          draft={settingsDraft}
          setDraft={setSettingsDraft}
          onSave={saveSettings}
        />
      )}

      <Wizard
        open={wizardOpen}
        step={wizardStep}
        setStep={setWizardStep}
        setOpen={setWizardOpen}
        lightTheme={lightTheme}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
      />

      {installBanner && (
        <div className="install-banner" role="complementary" aria-label="Installa l'app">
          <div className="install-banner-text">
            <strong>Installa kcalTracker</strong>
            {installBanner === "android"
              ? <span>Aggiungila alla schermata home per un accesso rapido</span>
              : <span>Tocca ⬆ in basso, poi «Aggiungi alla schermata Home»</span>
            }
          </div>
          <div className="install-banner-actions">
            {installBanner === "android" && (
              <button className="install-btn" onClick={handleInstall}>Installa</button>
            )}
            <button className="install-dismiss" onClick={dismissInstall} aria-label="Chiudi banner installazione">×</button>
          </div>
        </div>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/kcalTracker/sw.js').catch(() => {});
  });
}
