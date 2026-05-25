import { genId } from '../utils.js';

const { useState, useEffect, useRef } = React;

const OFF_URL = "https://world.openfoodfacts.org/cgi/search.pl";

function parseServingG(s) {
  if (!s || typeof s !== 'string') return null;
  const m = s.match(/(\d+(?:[.,]\d+)?)\s*g/i);
  if (m) return Math.round(parseFloat(m[1].replace(',', '.')));
  return null;
}

export default function OpenFoodFactsModal({ open, onClose, dietData, onImport }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCat, setSelectedCat] = useState({});
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setError(null);
      setSelectedCat({});
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    debounceRef.current = setTimeout(() => {
      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const params = new URLSearchParams({
        search_terms: query.trim(),
        search_simple: "1",
        action: "process",
        json: "1",
        page_size: "20",
        fields: "code,product_name,product_name_it,brands,nutriments,serving_size,image_thumb_url,image_small_url",
        lc: "it",
      });
      fetch(`${OFF_URL}?${params.toString()}`, { signal: ctrl.signal })
        .then(r => r.json())
        .then(data => {
          const items = (data.products || [])
            .map(p => {
              const kcal100 = p.nutriments?.["energy-kcal_100g"];
              if (!kcal100 || kcal100 <= 0) return null;
              const name = (p.product_name_it || p.product_name || "").trim();
              if (!name) return null;
              return {
                code: p.code,
                name,
                brand: (p.brands || "").split(",")[0].trim(),
                kcalPer100g: Math.round(kcal100),
                kcalPerG: kcal100 / 100,
                servingG: parseServingG(p.serving_size),
                image: p.image_thumb_url || p.image_small_url || null,
              };
            })
            .filter(Boolean);
          setResults(items);
          setLoading(false);
        })
        .catch(e => {
          if (e.name === 'AbortError') return;
          setError("Errore di rete");
          setLoading(false);
        });
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, open]);

  if (!open) return null;

  const handleImport = (r) => {
    const catName = selectedCat[r.code];
    if (!catName) return;
    const fullName = r.brand ? `${r.name} (${r.brand})` : r.name;
    const newItem = {
      id: genId(),
      name: fullName,
      portion: "g",
      kcal: 0,
      variable: true,
      kcalPerG: r.kcalPerG,
    };
    onImport(newItem, catName);
    setResults(prev => prev.filter(x => x.code !== r.code));
  };

  return (
    <div className="modal-overlay off-overlay" role="dialog" aria-modal="true" aria-labelledby="off-title" onClick={onClose}>
      <div className="off-modal" onClick={e => e.stopPropagation()}>
        <div className="off-header">
          <h2 id="off-title" className="off-title">Cerca su OpenFoodFacts</h2>
          <button className="off-close" onClick={onClose} aria-label="Chiudi">×</button>
        </div>
        <div className="off-search-row">
          <input
            className="off-search-input"
            type="search"
            autoFocus
            placeholder="Es. nutella, biscotti, parmigiano..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Cerca prodotto"
          />
        </div>
        <div className="off-results">
          {loading && <div className="off-status">Ricerca in corso…</div>}
          {error && <div className="off-status off-status-error">{error}</div>}
          {!loading && !error && query.trim() && results.length === 0 && (
            <div className="off-status">Nessun risultato</div>
          )}
          {!loading && !query.trim() && (
            <div className="off-status">Digita per cercare. I prodotti vengono dal database libero OpenFoodFacts.</div>
          )}
          {results.map(r => (
            <div key={r.code} className="off-result">
              {r.image ? (
                <img src={r.image} alt="" className="off-result-img" />
              ) : (
                <div className="off-result-img off-result-img-placeholder">🍽️</div>
              )}
              <div className="off-result-info">
                <div className="off-result-name">{r.name}</div>
                {r.brand && <div className="off-result-brand">{r.brand}</div>}
                <div className="off-result-meta">
                  {r.kcalPer100g} kcal/100g{r.servingG ? ` · porz. ${r.servingG}g` : ""}
                </div>
              </div>
              <div className="off-result-actions">
                <select
                  className="off-cat-select"
                  value={selectedCat[r.code] || ""}
                  onChange={e => setSelectedCat(prev => ({ ...prev, [r.code]: e.target.value }))}
                  aria-label="Categoria di destinazione"
                >
                  <option value="">Categoria…</option>
                  {dietData.map(c => <option key={c.category} value={c.category}>{c.icon} {c.category}</option>)}
                </select>
                <button
                  className="off-import-btn"
                  onClick={() => handleImport(r)}
                  disabled={!selectedCat[r.code]}
                  aria-label={`Importa ${r.name}`}
                >Importa</button>
              </div>
            </div>
          ))}
        </div>
        <div className="off-footer">
          Dati da <a href="https://world.openfoodfacts.org" target="_blank" rel="noopener noreferrer">OpenFoodFacts</a> (CC-BY-SA)
        </div>
      </div>
    </div>
  );
}
