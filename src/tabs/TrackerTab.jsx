import KcalBar from '../components/KcalBar.jsx';

export default function TrackerTab({
  user,
  dietData,
  searchQuery,
  openIdx, setOpenIdx,
  varGrams, setVarGrams,
  setLog,
  extras, extraName, setExtraName, extraInput, setExtraInput,
  addExtra, removeExtra,
  getCount, inc, dec,
  catKcal,
  maxItemKcal,
  login,
}) {
  return (
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
  );
}
