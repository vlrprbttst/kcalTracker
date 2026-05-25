import { db } from '../firebase.js';
import { genId } from '../utils.js';
import OpenFoodFactsModal from '../components/OpenFoodFactsModal.jsx';

const { useState, useEffect, useRef } = React;

export default function AlimentiAdminTab({
  user, dietData, setDietData,
  counts, itemById,
  setConfirmModal,
  adminSearchQuery, setAdminSearchQuery,
}) {
  const [offOpen, setOffOpen] = useState(false);

  const importFromOFF = (newItem, catName) => {
    const exists = dietData.some(c => c.category === catName);
    const newDietData = exists
      ? dietData.map(c => c.category === catName ? { ...c, items: [...c.items, newItem] } : c)
      : [...dietData, { category: catName, icon: "🍽️", items: [newItem] }];
    setDietData(newDietData);
    if (user) {
      db.collection("users").doc(user.uid).collection("config").doc("foods")
        .set({ dietData: newDietData })
        .catch(e => console.error("OFF import save error:", e));
    }
    setAdminOpenCats(prev => { const next = new Set(prev); next.add(catName); return next; });
  };

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
  const hoverOpenTimerRef = useRef(null);
  const hoverOpenCatRef = useRef(null);
  const handleTouchMoveRef = useRef(null);
  const adminOpenCatsRef = useRef(adminOpenCats);
  const dietDataRef = useRef(dietData);
  const userRef = useRef(user);

  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { adminOpenCatsRef.current = adminOpenCats; }, [adminOpenCats]);
  useEffect(() => { dietDataRef.current = dietData; }, [dietData]);

  useEffect(() => {
    if (typeof Sortable === 'undefined') return;
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
    Object.keys(sortableItemInstances.current).forEach(catName => {
      if (!adminOpenCats.has(catName)) {
        try { sortableItemInstances.current[catName].destroy(); } catch {}
        delete sortableItemInstances.current[catName];
      }
    });
  }, [adminOpenCats, adminSearchQuery]);

  useEffect(() => {
    return () => {
      Object.values(sortableItemInstances.current).forEach(s => { try { s.destroy(); } catch {} });
      sortableItemInstances.current = {};
    };
  }, []);

  useEffect(() => {
    if (typeof Sortable === 'undefined' || !sortableCatsRef.current) return;
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
  }, [adminSearchQuery]);

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
    <div className="admin-tab">
      <div className="admin-toolbar">
        <button
          className="admin-off-btn"
          onClick={() => setOffOpen(true)}
          aria-label="Cerca prodotti su OpenFoodFacts"
        >🌍 Cerca online (OpenFoodFacts)</button>
      </div>
      <OpenFoodFactsModal
        open={offOpen}
        onClose={() => setOffOpen(false)}
        dietData={dietData}
        onImport={importFromOFF}
      />
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
              <button type="button" className="category-btn" aria-expanded="true" style={{ cursor: 'default' }}>
                <span className="cat-icon" aria-hidden="true">{cat.icon}</span>
                <span className="cat-name">{cat.category}</span>
                <span className="cat-meta">{items.length} {items.length === 1 ? "alimento" : "alimenti"}</span>
              </button>
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
  );
}
