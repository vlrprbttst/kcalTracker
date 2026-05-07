import { auth, db, ALLOWED_UID } from './firebase.js';
import { SEED_DIET_DATA, seedItemById, seedItemCategory } from './seed.js';
import { TODAY, ACTIVE_DAY, genId, migrateCountKeys, loadLocalData, loadTarget, computeTotal, buildItemsList } from './utils.js';
import { DEFAULT_SCHEDULE, minutesToTime, timeToMinutes, getMealSlot, groupLogByMeal, groupEntries } from './schedule.js';
import { getWeekStart, formatShortDate, groupByWeek, getBimesterOf, bimesterLabel, addBimesters, getMonthName, formatDate } from './history.js';
import KcalBar from './components/KcalBar.jsx';
import ConfirmModal from './components/ConfirmModal.jsx';
import SettingsOverlay from './components/SettingsOverlay.jsx';
import Wizard, { WIZARD_STEPS } from './components/Wizard.jsx';
import MenuTab from './tabs/MenuTab.jsx';
import StoricoTab from './tabs/StoricoTab.jsx';

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

  // dietData state — loaded from Firestore on login, seeded from SEED_DIET_DATA if absent
  const [dietData, setDietData] = useState(SEED_DIET_DATA);
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);

  // Admin tab state
  const [adminEditId, setAdminEditId] = useState(null);
  const [adminEditDraft, setAdminEditDraft] = useState({});
  const [adminNewItem, setAdminNewItem] = useState(null);
  const [adminNewCat, setAdminNewCat] = useState(false);
  const [adminNewCatDraft, setAdminNewCatDraft] = useState({ name: "", icon: "" });
  const [adminEditCat, setAdminEditCat] = useState(null);
  const [adminEditCatDraft, setAdminEditCatDraft] = useState({ name: "", icon: "" });
  const [adminOpenCats, setAdminOpenCats] = useState(new Set());
  const sortableCatsRef = useRef(null);
  const sortableItemRefs = useRef({});
  const sortableItemInstances = useRef({});
  const isDraggingRef = useRef(false);
  const profileMenuRef = useRef(null);
  const hoverOpenTimerRef = useRef(null);
  const hoverOpenCatRef = useRef(null);
  const adminOpenCatsRef = useRef(adminOpenCats);
  const handleTouchMoveRef = useRef(null);
  const dietDataRef = useRef(dietData);
  const userRef = useRef(null);

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

  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { adminOpenCatsRef.current = adminOpenCats; }, [adminOpenCats]);
  useEffect(() => { dietDataRef.current = dietData; }, [dietData]);

  useEffect(() => {
    if (typeof Sortable === 'undefined' || activeTab !== "alimenti") return;
    // Crea sortable solo per le categorie appena aperte (non tocca quelle già attive)
    adminOpenCats.forEach(catName => {
      const el = sortableItemRefs.current[catName];
      if (!el) return;
      if (sortableItemInstances.current[catName] && sortableItemInstances.current[catName].el !== el) {
        try { sortableItemInstances.current[catName].destroy(); } catch {}
        delete sortableItemInstances.current[catName];
      }
      if (sortableItemInstances.current[catName]) return;
      sortableItemInstances.current[catName] = Sortable.create(el, {
        animation: 150,
        handle: '.admin-drag-handle',
        ghostClass: 'admin-drag-ghost',
        group: 'items',
        onStart: () => {
          isDraggingRef.current = true;
          handleTouchMoveRef.current = (e) => {
            const touch = e.touches[0];
            if (!touch) return;
            const els = document.elementsFromPoint(touch.clientX, touch.clientY);
            const catRow = els.find(el => el.dataset && el.dataset.hoverCat);
            const catName = catRow ? catRow.dataset.hoverCat : null;
            if (catName === hoverOpenCatRef.current) return;
            clearTimeout(hoverOpenTimerRef.current);
            hoverOpenCatRef.current = catName;
            if (catName && !adminOpenCatsRef.current.has(catName)) {
              hoverOpenTimerRef.current = setTimeout(() => {
                setAdminOpenCats(prev => { const next = new Set(prev); next.add(catName); return next; });
              }, 600);
            }
          };
          document.addEventListener('touchmove', handleTouchMoveRef.current, { passive: true });
        },
        onEnd: (evt) => {
          isDraggingRef.current = false;
          clearTimeout(hoverOpenTimerRef.current);
          hoverOpenCatRef.current = null;
          if (handleTouchMoveRef.current) {
            document.removeEventListener('touchmove', handleTouchMoveRef.current);
            handleTouchMoveRef.current = null;
          }
          const { oldIndex, newIndex, from, to } = evt;
          // SortableJS fires onEnd on both source and destination sortables when using
          // group mode. Only the source sortable (from === el) should process the move.
          if (from !== el) return;
          const fromCat = from.dataset.category;
          const toCat = to.dataset.category;
          if (fromCat === toCat && oldIndex === newIndex) return;
          if (from !== to) {
            from.insertBefore(evt.item, from.children[oldIndex] || null);
          }
          const u = userRef.current;
          const newData = dietDataRef.current.map(cat => ({ ...cat, items: [...cat.items] }));
          const srcCat = newData.find(c => c.category === fromCat);
          const dstCat = newData.find(c => c.category === toCat);
          if (!srcCat || !dstCat) return;
          const [moved] = srcCat.items.splice(oldIndex, 1);
          dstCat.items.splice(newIndex, 0, moved);
          setDietData(newData);
          if (u) {
            db.collection("users").doc(u.uid).collection("config").doc("foods")
              .set({ dietData: newData })
              .catch(e => console.error("Diet save error:", e));
          }
        },
      });
    });
    // Distrugge sortable solo per le categorie che sono state chiuse
    Object.keys(sortableItemInstances.current).forEach(catName => {
      if (!adminOpenCats.has(catName)) {
        try { sortableItemInstances.current[catName].destroy(); } catch {}
        delete sortableItemInstances.current[catName];
      }
    });
  }, [adminOpenCats, activeTab, adminSearchQuery]);

  // Cleanup totale solo al cambio di tab (effect separato per non toccare i sortable durante il drag)
  useEffect(() => {
    return () => {
      Object.values(sortableItemInstances.current).forEach(s => { try { s.destroy(); } catch {} });
      sortableItemInstances.current = {};
    };
  }, [activeTab]);

  useEffect(() => {
    if (typeof Sortable === 'undefined' || activeTab !== "alimenti" || !sortableCatsRef.current) return;
    const sortable = Sortable.create(sortableCatsRef.current, {
      animation: 150,
      handle: '.admin-cat-drag-handle',
      ghostClass: 'admin-drag-ghost',
      onEnd: (evt) => {
        const { oldIndex, newIndex } = evt;
        if (oldIndex === newIndex) return;
        const u = userRef.current;
        const newData = [...dietDataRef.current];
        const [moved] = newData.splice(oldIndex, 1);
        newData.splice(newIndex, 0, moved);
        setDietData(newData);
        if (u) {
          db.collection("users").doc(u.uid).collection("config").doc("foods")
            .set({ dietData: newData })
            .catch(e => console.error("Diet save error:", e));
        }
      },
    });
    return () => { try { sortable.destroy(); } catch {} };
  }, [activeTab, adminSearchQuery]);

  // Reset admin forms when leaving the tab
  useEffect(() => {
    if (activeTab !== "alimenti") {
      setAdminEditId(null);
      setAdminNewItem(null);
      setAdminNewCat(false);
      setAdminEditCat(null);
      setAdminSearchQuery("");
    }
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

  const saveDietToFirestore = (newDietData) => {
    if (!user) return;
    db.collection("users").doc(user.uid).collection("config").doc("foods")
      .set({ dietData: newDietData })
      .catch(e => console.error("Diet save error:", e));
  };

  const startEditItem = (item) => {
    setAdminNewItem(null);
    setAdminEditId(item.id);
    setAdminEditDraft({
      name: item.name,
      kcal: item.variable ? "" : String(item.kcal),
      portion: item.portion || "",
      variable: !!item.variable,
      kcalPerG: item.variable ? String(item.kcalPerG) : "",
      refGrams: "100",
      refKcal: item.variable ? String(Math.round(item.kcalPerG * 100)) : "",
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
    const newDietData = dietData.map(cat => ({
      ...cat,
      items: cat.items.map(item => {
        if (item.id !== itemId) return item;
        if (d.variable) {
          return { id: item.id, name: d.name.trim(), portion: d.portion.trim() || "g", kcal: 0, variable: true, kcalPerG: computedKcalPerG };
        }
        return { id: item.id, name: d.name.trim(), portion: d.portion.trim(), kcal: parseInt(d.kcal, 10) };
      }),
    }));
    setDietData(newDietData);
    saveDietToFirestore(newDietData);
    setAdminEditId(null);
  };

  const deleteItem = (itemId) => {
    const item = itemById[itemId];
    const hasCount = (counts[itemId] || 0) > 0;
    const message = hasCount
      ? `"${item?.name}" ha ${counts[itemId]} porzioni registrate oggi. Il conteggio di oggi non verrà modificato.`
      : `Eliminare "${item?.name}" dalla lista?`;
    setConfirmModal({
      title: "Elimina alimento",
      message,
      danger: true,
      onConfirm: () => {
        const newDietData = dietData.map(cat => ({
          ...cat,
          items: cat.items.filter(i => i.id !== itemId),
        }));
        setDietData(newDietData);
        saveDietToFirestore(newDietData);
        if (adminEditId === itemId) setAdminEditId(null);
      },
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
    const newItem = form.variable
      ? { id: newId, name: form.name.trim(), portion: form.portion.trim() || "g", kcal: 0, variable: true, kcalPerG: computedKcalPerG }
      : { id: newId, name: form.name.trim(), portion: form.portion.trim(), kcal: parseInt(form.kcal, 10) };
    const newDietData = dietData.map((cat, ci) =>
      ci !== catIdx ? cat : { ...cat, items: [...cat.items, newItem] }
    );
    setDietData(newDietData);
    saveDietToFirestore(newDietData);
    setAdminNewItem(null);
  };

  const addNewCategory = () => {
    const name = adminNewCatDraft.name.trim();
    if (!name) return;
    const icon = adminNewCatDraft.icon.trim() || "🍽️";
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
    const icon = adminEditCatDraft.icon.trim() || "🍽️";
    const oldName = adminEditCat;
    const newDietData = dietData.map(cat =>
      cat.category !== oldName ? cat : { ...cat, category: name, icon }
    );
    if (oldName !== name) {
      setAdminOpenCats(prev => {
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
    const message = cat.items.length > 0
      ? `La categoria "${cat.category}" contiene ${cat.items.length} aliment${cat.items.length === 1 ? "o" : "i"}. Eliminare tutto?`
      : `Eliminare la categoria "${cat.category}"?`;
    setConfirmModal({
      title: "Elimina categoria",
      message,
      danger: true,
      onConfirm: () => {
        const newDietData = dietData.filter((_, i) => i !== catIdx);
        setDietData(newDietData);
        saveDietToFirestore(newDietData);
        setAdminOpenCats(prev => { const next = new Set(prev); next.delete(cat.category); return next; });
        if (adminEditCat === cat.category) setAdminEditCat(null);
      },
    });
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
          <>
            {user && (() => {
              const query = searchQuery.trim().toLowerCase();
              const visibleCats = dietData.map((cat, ci) => ({
                cat, ci,
                items: query
                  ? cat.items.map((item, ii) => ({ item, ii })).filter(({ item }) => item.name.toLowerCase().includes(query))
                  : cat.items.map((item, ii) => ({ item, ii })),
              })).filter(({ items }) => !query || items.length > 0)
               .filter(({ cat }) => user || cat.category !== 'Alcol');

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
                    <button className="category-btn" onClick={() => !query && setOpenIdx(isOpen ? null : ci)} aria-expanded={isOpen} aria-controls={`cat-grid-${ci}`}>
                      <span className="cat-icon" aria-hidden="true">{cat.icon}</span>
                      <span className="cat-name">{cat.category}</span>
                      {hasAny && <span className="cat-kcal-badge">+{kcalCat} kcal</span>}
                      {!query && <span className="cat-meta">{cat.items.length} {cat.items.length === 1 ? "alimento" : "alimenti"}</span>}
                      {!query && <span className={`cat-arrow${isOpen ? " open" : ""}`}>▼</span>}
                    </button>
                    {isOpen && (
                      <div id={`cat-grid-${ci}`} className="items-grid">
                        <div className="items-grid-label">Alimento</div>
                        <div className="items-grid-label">Porzione</div>
                        <div className="items-grid-label right">Kcal</div>
                        <div className="items-grid-label"></div>
                        {items.map(({ item, ii }, idx) => {
                          const qty = getCount(item.id);
                          const isActive = qty > 0;
                          if (item.variable) {
                            const g = varGrams[item.id] || 0;
                            const portionKcal = g > 0 ? Math.round(g * item.kcalPerG) : 0;
                            const totalVar = portionKcal * qty;
                            return (
                              <React.Fragment key={ii}>
                                {idx > 0 && <div className="items-grid-sep" />}
                                <div className={`item-name${isActive ? " item-cell-active" : ""}`}><span>{highlightName(item.name)}</span></div>
                                <div className={`item-portion${isActive ? " item-cell-active" : ""}`}>
                                  <input
                                    type="number"
                                    className="grams-input"
                                    aria-label={`Grammi di ${item.name}`}
                                    placeholder="Grammi"
                                    value={g || ""}
                                    onChange={e => {
                                      e.stopPropagation();
                                      const val = parseInt(e.target.value, 10);
                                      setVarGrams(prev => {
                                        if (!val || val <= 0) { const { [item.id]: _, ...rest } = prev; return rest; }
                                        return { ...prev, [item.id]: val };
                                      });
                                      if (val > 0 && getCount(item.id) > 0) {
                                        const newKcal = Math.round(val * item.kcalPerG);
                                        setLog(prev => {
                                          for (let i = prev.length - 1; i >= 0; i--) {
                                            if (prev[i].type === 'item' && prev[i].id === item.id) {
                                              const updated = [...prev];
                                              updated[i] = { ...updated[i], grams: val, kcal: newKcal };
                                              return updated;
                                            }
                                          }
                                          return prev;
                                        });
                                      }
                                    }}
                                    onClick={e => e.stopPropagation()}
                                    min="0"
                                  />
                                </div>
                                <div className={`item-kcal-cell${isActive ? " item-cell-active" : ""}`}>
                                  <span className="item-kcal">
                                    {g > 0 ? (isActive ? totalVar : portionKcal) : "–"}
                                    {g > 0 && isActive && qty > 1 && <span style={{ fontSize: 10, color: "var(--text-dimmer)", marginLeft: 3 }}>×{qty}</span>}
                                  </span>
                                  <KcalBar kcal={portionKcal} max={maxItemKcal} />
                                </div>
                                <div className={isActive ? "item-cell-active" : ""} style={{ minHeight: 44, padding: "0 14px 0 0", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                                  <div className="counter" onClick={e => e.stopPropagation()} role="group" aria-label={item.name}>
                                    <button className={`counter-btn${isActive ? "" : " minus-disabled"}`} onClick={e => dec(item.id, e)} aria-label={`Rimuovi ${item.name}`} aria-disabled={!isActive}>−</button>
                                    <span className="counter-num" aria-label={`${qty} porzioni`}>{qty}</span>
                                    <button className="counter-btn plus" onClick={e => inc(item.id, e)} aria-label={`Aggiungi ${item.name}`}>+</button>
                                  </div>
                                </div>
                              </React.Fragment>
                            );
                          }
                          return (
                            <React.Fragment key={ii}>
                              {idx > 0 && <div className="items-grid-sep" />}
                              <div className={`item-name${isActive ? " item-cell-active" : ""}`}><span>{highlightName(item.name)}</span></div>
                              <div className={`item-portion${isActive ? " item-cell-active" : ""}`}>{item.portion}</div>
                              <div className={`item-kcal-cell${isActive ? " item-cell-active" : ""}`}>
                                <span className="item-kcal">
                                  {isActive ? item.kcal * qty : item.kcal}
                                  {isActive && qty > 1 && <span style={{ fontSize: 10, color: "var(--text-dimmer)", marginLeft: 3 }}>×{qty}</span>}
                                </span>
                                <KcalBar kcal={item.kcal} max={maxItemKcal} />
                              </div>
                              <div className={isActive ? "item-cell-active" : ""} style={{ minHeight: 44, padding: "0 14px 0 0", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                                <div className="counter" onClick={e => e.stopPropagation()} role="group" aria-label={item.name}>
                                  <button className={`counter-btn${isActive ? "" : " minus-disabled"}`} onClick={e => dec(item.id, e)} aria-label={`Rimuovi ${item.name}`} aria-disabled={!isActive}>−</button>
                                  <span className="counter-num" aria-label={`${qty} porzioni`}>{qty}</span>
                                  <button className="counter-btn plus" onClick={e => inc(item.id, e)} aria-label={`Aggiungi ${item.name}`}>+</button>
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
                    <span className="cat-icon" aria-hidden="true">🧾</span>
                    <span className="cat-name">{user ? "Extra" : "Aggiungi alimento"}</span>
                    {hasExtras && <span className="cat-kcal-badge">+{extrasKcal} kcal</span>}
                    {user && <span style={{ fontSize: 12, color: "#a1a1aa", fontWeight: 400 }}>calorie libere</span>}
                  </div>
                  <div className="extra-input-row">
                    <input
                      className="extra-kcal-input"
                      type="text"
                      aria-label="Nome alimento"
                      placeholder="cosa hai mangiato…"
                      value={extraName}
                      onChange={e => setExtraName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") addExtra(); }}
                      style={{ flex: 2 }}
                    />
                    <input
                      className="extra-kcal-input"
                      type="number"
                      aria-label="Calorie"
                      placeholder="kcal"
                      value={extraInput}
                      onChange={e => setExtraInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") addExtra(); }}
                      min="1"
                      style={{ flex: 1, minWidth: 0 }}
                    />
                    <button className="extra-add-btn" onClick={addExtra} aria-label="Aggiungi alimento">+</button>
                  </div>
                  {hasExtras && (
                    <div className="extra-list">
                      {extras.map((item) => (
                        <div key={item.uid || item.name} className="extra-item">
                          <span className="extra-item-label">{item.name}</span>
                          <div className="extra-item-right">
                            <span className="extra-item-kcal">{item.kcal} kcal</span>
                            <button className="extra-remove-btn" onClick={() => removeExtra(item.uid)} aria-label={`Rimuovi ${item.name}`}>×</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {user && (
              <div className="legend">
                {[["var(--color-positive)", "<250 kcal"], ["var(--color-warning)", "250–400 kcal"], ["var(--color-negative)", ">400 kcal"]].map(([color, label]) => (
                  <span key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                    {label}
                  </span>
                ))}
              </div>
            )}

            {!user && (
              <div className="guest-banner">
                <div className="guest-banner-title">Accedi per sbloccare tutto</div>
                <div className="guest-banner-body">Con un account Google puoi gestire la tua lista alimenti personalizzata, consultare lo storico settimanale, sincronizzare i dati su tutti i tuoi dispositivi e tanto altro.</div>
                <button className="guest-banner-btn" onClick={login}>Accedi con Google</button>
              </div>
            )}
          </>
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
          <div className="admin-tab">
            {adminSearchQuery.trim() ? (
              (() => {
                const q = adminSearchQuery.trim().toLowerCase();
                const highlight = name => {
                  const idx = name.toLowerCase().indexOf(q);
                  if (idx === -1) return name;
                  return <>{name.slice(0, idx)}<span className="search-highlight">{name.slice(idx, idx + q.length)}</span>{name.slice(idx + q.length)}</>;
                };
                const results = dietData.flatMap((cat, catIdx) => {
                  const items = cat.items.filter(item => item.name.toLowerCase().includes(q));
                  return items.length ? [{ cat, catIdx, items }] : [];
                });
                if (!results.length) return <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>Nessun alimento trovato</div>;
                return results.map(({ cat, items }) => (
                  <div key={cat.category} className="category-card">
                    <div className="admin-cat-row" style={{ cursor: 'default' }}>
                      <span className="cat-icon" aria-hidden="true">{cat.icon}</span>
                      <span className="cat-name">{cat.category}</span>
                      <span className="cat-meta">{items.length} {items.length === 1 ? "alimento" : "alimenti"}</span>
                    </div>
                    <div className="admin-items-list">
                      {items.map(item => (
                        <div key={item.id} className="admin-item-row">
                          <div className="admin-item-info" style={{ paddingLeft: 10 }}>
                            <span className="admin-item-name">{highlight(item.name)}</span>
                            <span className="admin-item-meta">
                              {item.variable ? `${Math.round(item.kcalPerG * 100)} kcal/100g` : `${item.kcal} kcal`}
                              {item.portion ? ` · ${item.portion}` : ""}
                            </span>
                          </div>
                          <div className="admin-item-actions">
                            <button className="admin-icon-btn" onClick={() => {
                              setAdminSearchQuery("");
                              setAdminOpenCats(prev => { const next = new Set(prev); next.add(cat.category); return next; });
                              startEditItem(item);
                            }} aria-label={`Modifica ${item.name}`}>✏️</button>
                            <button className="admin-icon-btn admin-icon-btn-delete" onClick={() => deleteItem(item.id)} aria-label={`Elimina ${item.name}`}>🗑️</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()
            ) : (
              <>
            <div ref={sortableCatsRef}>
            {dietData.map((cat, catIdx) => {
              const isOpen = adminOpenCats.has(cat.category);
              return (
                <div key={cat.category} className="category-card">
                  {adminEditCat === cat.category ? (
                    <div className="admin-form" style={{ margin: "6px 10px" }}>
                      <input
                        className="admin-input admin-input-name"
                        aria-label="Nome categoria"
                        placeholder="Nome categoria"
                        value={adminEditCatDraft.name}
                        onChange={e => setAdminEditCatDraft(d => ({ ...d, name: e.target.value }))}
                        onKeyDown={e => { if (e.key === "Enter") saveEditedCategory(); if (e.key === "Escape") setAdminEditCat(null); }}
                        autoFocus
                      />
                      <input
                        className="admin-input admin-input-icon"
                        aria-label="Emoji icona categoria"
                        placeholder="Emoji"
                        value={adminEditCatDraft.icon}
                        onChange={e => setAdminEditCatDraft(d => ({ ...d, icon: e.target.value }))}
                        maxLength={2}
                      />
                      <div className="admin-form-actions">
                        <button className="admin-btn admin-btn-primary" onClick={saveEditedCategory}>Salva</button>
                        <button className="admin-btn admin-btn-ghost" onClick={() => setAdminEditCat(null)}>Annulla</button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="admin-cat-row"
                      data-hover-cat={cat.category}
                      onPointerEnter={() => {
                        if (!isDraggingRef.current || isOpen) return;
                        clearTimeout(hoverOpenTimerRef.current);
                        hoverOpenTimerRef.current = setTimeout(() => {
                          setAdminOpenCats(prev => { const next = new Set(prev); next.add(cat.category); return next; });
                        }, 600);
                      }}
                      onPointerLeave={() => clearTimeout(hoverOpenTimerRef.current)}
                      onDragEnter={() => {
                        if (isOpen) return;
                        clearTimeout(hoverOpenTimerRef.current);
                        hoverOpenTimerRef.current = setTimeout(() => {
                          setAdminOpenCats(prev => { const next = new Set(prev); next.add(cat.category); return next; });
                        }, 600);
                      }}
                      onDragLeave={e => {
                        if (e.currentTarget.contains(e.relatedTarget)) return;
                        clearTimeout(hoverOpenTimerRef.current);
                      }}
                    >
                      <span className="admin-cat-drag-handle" aria-hidden="true">⠿</span>
                      <button
                        className="category-btn"
                        onClick={() => setAdminOpenCats(prev => { const next = new Set(prev); next.has(cat.category) ? next.delete(cat.category) : next.add(cat.category); return next; })}
                        aria-expanded={isOpen}
                        aria-controls={`admin-cat-${catIdx}`}
                      >
                        <span className="cat-icon" aria-hidden="true">{cat.icon}</span>
                        <span className="cat-name">{cat.category}</span>
                        <span className="cat-meta">{cat.items.length} {cat.items.length === 1 ? "alimento" : "alimenti"}</span>
                        <span className={`cat-arrow${isOpen ? " open" : ""}`}>▼</span>
                      </button>
                      <button className="admin-icon-btn" onClick={e => { e.stopPropagation(); startEditCategory(cat); }} aria-label={`Modifica categoria ${cat.category}`}>✏️</button>
                      <button className="admin-icon-btn admin-icon-btn-delete" onClick={e => { e.stopPropagation(); deleteCategory(catIdx); }} aria-label={`Elimina categoria ${cat.category}`}>🗑️</button>
                    </div>
                  )}
                  {isOpen && (
                    <div id={`admin-cat-${catIdx}`} className="admin-items-list">
                      <div
                        ref={el => { if (el) sortableItemRefs.current[cat.category] = el; else delete sortableItemRefs.current[cat.category]; }}
                        data-category={cat.category}
                      >
                      {cat.items.map((item) => (
                        <div key={item.id}>
                          {adminEditId === item.id ? (
                            <div className="admin-form">
                              <input
                                className="admin-input admin-input-name"
                                aria-label="Nome alimento"
                                placeholder="Nome"
                                value={adminEditDraft.name}
                                onChange={e => setAdminEditDraft(d => ({ ...d, name: e.target.value }))}
                                onKeyDown={e => { if (e.key === "Enter") saveEditedItem(item.id); if (e.key === "Escape") setAdminEditId(null); }}
                                autoFocus
                              />
                              {!adminEditDraft.variable && (
                                <input
                                  className="admin-input admin-input-portion"
                                  aria-label="Porzione"
                                  placeholder="Porzione"
                                  value={adminEditDraft.portion}
                                  onChange={e => setAdminEditDraft(d => ({ ...d, portion: e.target.value }))}
                                />
                              )}
                              <label className="admin-variable-label">
                                <input
                                  type="checkbox"
                                  checked={adminEditDraft.variable}
                                  onChange={e => setAdminEditDraft(d => ({ ...d, variable: e.target.checked, ...(e.target.checked ? { portion: "" } : {}) }))}
                                />
                                Variabile
                              </label>
                              {adminEditDraft.variable ? (
                                <div className="admin-ref-wrap">
                                  <input
                                    className="admin-input admin-input-ref-g"
                                    type="number"
                                    aria-label="Grammi di riferimento"
                                    placeholder="g"
                                    value={adminEditDraft.refGrams}
                                    onChange={e => setAdminEditDraft(d => ({ ...d, refGrams: e.target.value }))}
                                    min="1"
                                  />
                                  <span className="admin-ref-sep">g =</span>
                                  <input
                                    className="admin-input admin-input-ref-kcal"
                                    type="number"
                                    aria-label="Calorie per i grammi di riferimento"
                                    placeholder="kcal"
                                    value={adminEditDraft.refKcal}
                                    onChange={e => setAdminEditDraft(d => ({ ...d, refKcal: e.target.value }))}
                                    min="0"
                                  />
                                  <span className="admin-ref-sep">kcal</span>
                                </div>
                              ) : (
                                <input
                                  className="admin-input admin-input-kcal"
                                  type="number"
                                  aria-label="Calorie"
                                  placeholder="kcal"
                                  value={adminEditDraft.kcal}
                                  onChange={e => setAdminEditDraft(d => ({ ...d, kcal: e.target.value }))}
                                  min="0"
                                />
                              )}
                              <div className="admin-form-actions">
                                <button className="admin-btn admin-btn-primary" onClick={() => saveEditedItem(item.id)} aria-label="Salva modifiche">Salva</button>
                                <button className="admin-btn admin-btn-ghost" onClick={() => setAdminEditId(null)} aria-label="Annulla modifica">Annulla</button>
                              </div>
                            </div>
                          ) : (
                            <div className="admin-item-row">
                              <span className="admin-drag-handle" aria-hidden="true">⠿</span>
                              <div className="admin-item-info">
                                <span className="admin-item-name">{item.name}</span>
                                <span className="admin-item-meta">
                                  {item.variable ? `${Math.round(item.kcalPerG * 100)} kcal/100g` : `${item.kcal} kcal`}
                                  {item.portion ? ` · ${item.portion}` : ""}
                                </span>
                              </div>
                              <div className="admin-item-actions">
                                <button className="admin-icon-btn" onClick={() => startEditItem(item)} aria-label={`Modifica ${item.name}`}>✏️</button>
                                <button className="admin-icon-btn admin-icon-btn-delete" onClick={() => deleteItem(item.id)} aria-label={`Elimina ${item.name}`}>🗑️</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      </div>

                      {adminNewItem?.catIdx === catIdx ? (
                        <div className="admin-form admin-form-new">
                          <input
                            className="admin-input admin-input-name"
                            aria-label="Nome nuovo alimento"
                            placeholder="Nome alimento"
                            value={adminNewItem.name}
                            onChange={e => setAdminNewItem(d => ({ ...d, name: e.target.value }))}
                            onKeyDown={e => { if (e.key === "Enter") addNewItem(catIdx); if (e.key === "Escape") setAdminNewItem(null); }}
                            autoFocus
                          />
                          {!adminNewItem.variable && (
                            <input
                              className="admin-input admin-input-portion"
                              aria-label="Porzione"
                              placeholder="Porzione"
                              value={adminNewItem.portion}
                              onChange={e => setAdminNewItem(d => ({ ...d, portion: e.target.value }))}
                            />
                          )}
                          <label className="admin-variable-label">
                            <input
                              type="checkbox"
                              checked={adminNewItem.variable}
                              onChange={e => setAdminNewItem(d => ({ ...d, variable: e.target.checked, ...(e.target.checked ? { portion: "" } : {}) }))}
                            />
                            Variabile
                          </label>
                          {adminNewItem.variable ? (
                            <div className="admin-ref-wrap">
                              <input
                                className="admin-input admin-input-ref-g"
                                type="number"
                                aria-label="Grammi di riferimento"
                                placeholder="g"
                                value={adminNewItem.refGrams}
                                onChange={e => setAdminNewItem(d => ({ ...d, refGrams: e.target.value }))}
                                min="1"
                              />
                              <span className="admin-ref-sep">g =</span>
                              <input
                                className="admin-input admin-input-ref-kcal"
                                type="number"
                                aria-label="Calorie per i grammi di riferimento"
                                placeholder="kcal"
                                value={adminNewItem.refKcal}
                                onChange={e => setAdminNewItem(d => ({ ...d, refKcal: e.target.value }))}
                                min="0"
                              />
                              <span className="admin-ref-sep">kcal</span>
                            </div>
                          ) : (
                            <input
                              className="admin-input admin-input-kcal"
                              type="number"
                              aria-label="Calorie"
                              placeholder="kcal"
                              value={adminNewItem.kcal}
                              onChange={e => setAdminNewItem(d => ({ ...d, kcal: e.target.value }))}
                              min="0"
                            />
                          )}
                          <div className="admin-form-actions">
                            <button className="admin-btn admin-btn-primary" onClick={() => addNewItem(catIdx)} aria-label="Aggiungi alimento">Aggiungi</button>
                            <button className="admin-btn admin-btn-ghost" onClick={() => setAdminNewItem(null)} aria-label="Annulla">Annulla</button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="admin-add-btn"
                          onClick={() => { setAdminEditId(null); setAdminNewItem({ catIdx, name: "", kcal: "", portion: "", variable: false, kcalPerG: "", refGrams: "100", refKcal: "" }); }}
                          aria-label={`Aggiungi alimento a ${cat.category}`}
                        >
                          + Aggiungi alimento
                        </button>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
            </div>

            {adminNewCat ? (
              <div className="admin-new-cat-card">
                <div className="admin-form">
                  <input
                    className="admin-input admin-input-name"
                    aria-label="Nome nuova categoria"
                    placeholder="Nome categoria"
                    value={adminNewCatDraft.name}
                    onChange={e => setAdminNewCatDraft(d => ({ ...d, name: e.target.value }))}
                    onKeyDown={e => { if (e.key === "Enter") addNewCategory(); if (e.key === "Escape") { setAdminNewCat(false); setAdminNewCatDraft({ name: "", icon: "" }); } }}
                    autoFocus
                  />
                  <input
                    className="admin-input admin-input-icon"
                    aria-label="Emoji icona categoria"
                    placeholder="Emoji"
                    value={adminNewCatDraft.icon}
                    onChange={e => setAdminNewCatDraft(d => ({ ...d, icon: e.target.value }))}
                    maxLength={2}
                  />
                  <div className="admin-form-actions">
                    <button className="admin-btn admin-btn-primary" onClick={addNewCategory} aria-label="Aggiungi categoria">Aggiungi</button>
                    <button className="admin-btn admin-btn-ghost" onClick={() => { setAdminNewCat(false); setAdminNewCatDraft({ name: "", icon: "" }); }} aria-label="Annulla">Annulla</button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                className="admin-add-cat-btn"
                onClick={() => setAdminNewCat(true)}
                aria-label="Aggiungi nuova categoria"
              >
                + Aggiungi categoria
              </button>
            )}
              </>
            )}
          </div>
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
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
