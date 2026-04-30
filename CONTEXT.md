# kcalTracker — Contesto completo del progetto

## Cos'è
App personale per tracciare le calorie giornaliere. Pubblicata su GitHub Pages. Sviluppata con Valerio Pierbattista (omegaiori@gmail.com).

**Live:** https://vlrprbttst.github.io/kcalTracker  
**Repo:** https://github.com/vlrprbttst/kcalTracker  
**File principali:** `index.html` (scheletro HTML), `style.css` (tutto il CSS), `app.jsx` (sorgente JSX), `app.js` (compilato — quello che carica il browser)  
**File di riferimento alimenti:** la lista alimenti è in `app.jsx` nell'array `SEED_DIET_DATA` (seed iniziale), ma in produzione viene caricata da Firestore (`users/{uid}/config/foods`).

---

## Stack tecnico
- React 18.3.1 via CDN (versione pinnata, SRI hash)
- **app.jsx pre-compilato in app.js con Babel Node** — Babel non è più nel browser
- Firebase 10.12.2 (compat SDK via CDN, versione pinnata, SRI hash):
  - **Authentication** — Google OAuth
  - **Firestore** — salvataggio dati giornalieri, storico, e lista alimenti
- SortableJS 1.15.2 via CDN (no SRI hash) — drag & drop nel tab Alimenti
- GitHub Pages per l'hosting (branch `master`, aggiornamento automatico ad ogni push)
- Dark/light theme con CSS variables
- `build.js` + `package.json` per la compilazione locale (Node.js richiesto)

---

## Firebase
- **Project ID:** `kcaltracker-5dd56`
- **Auth domain:** `kcaltracker-5dd56.firebaseapp.com`
- **API Key:** `AIzaSyBCY1ONerEeZ6Ysa34222hZ-JzJ_rIjcZI` (sicuro da esporre nel frontend per Firebase)
- **ALLOWED_UID:** `f1rMJWrezfORvihvxM5EspY3FsA3` (solo questo UID può loggarsi)
- **Domini autorizzati:** `localhost`, `127.0.0.1`, `vlrprbttst.github.io`

### Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId
        && request.auth.uid == "f1rMJWrezfORvihvxM5EspY3FsA3";
    }
  }
}
```

### Struttura dati Firestore
```
users/
  {uid}/
    config/
      foods: {
        dietData: [ { category, icon, items: [{ id, name, portion, kcal, variable?, kcalPerG? }] } ]
      }
    days/
      2026-04-24: {
        counts:   { "b4x8q3": 2, "u6r3k8": 1, ... },
        varGrams: { "b4x8q3": 150, "g9j3w7": 200 },
        extras:   [{ uid: "abc123", name: "kebab", kcal: 650 }],
        log: [
          { type: "item",  id: "u6r3k8", name: "Uova strapazzate", kcal: 230, grams: 0,   category: "Uova",  ts: "2026-04-24T08:10:00.000Z" },
          { type: "item",  id: "b4x8q3", name: "Basmati cotto",    kcal: 200, grams: 150, category: "Carboidrati", ts: "2026-04-24T13:05:00.000Z" },
          { type: "extra", uid: "abc123", name: "kebab",            kcal: 650, grams: 0,   ts: "2026-04-24T20:30:00.000Z" },
        ],
        target:    2000,
        totalKcal: 1450,
        items:     ["Uova strapazzate", "Basmati cotto 150g (200 kcal)", "kebab (extra, 650 kcal)"],
        date:      "2026-04-24",
        updatedAt: timestamp
      }
```

**Note sui campi:**
- `config/foods.dietData`: lista alimenti completa, modificabile dal tab Alimenti. Al primo login viene seminata da `SEED_DIET_DATA` in `app.jsx`.
- `counts` / `varGrams`: chiavi = ID stabili opachi a 6 caratteri
- `extras`: ogni extra ha un `uid` opaco generato al momento dell'aggiunta
- `log`: array cronologico — vale solo per il giorno corrente
- `items`: stringhe leggibili per lo storico — immune a modifiche future agli alimenti
- Il debounce di salvataggio dei dati giornalieri è **400ms**
- Il salvataggio di `config/foods` è **immediato** ad ogni modifica nel tab Alimenti

### Migrazione automatica
`migrateCountKeys()` converte i vecchi documenti con chiavi `"ci_ii"` al formato ID stabile. Usa `SEED_DIET_DATA` come riferimento (la migrazione è storica, i dati sono già migrati).

---

## Regole importanti

### Aggiunta/modifica alimenti
Puoi aggiungere, rimuovere e riordinare alimenti liberamente — sia via tab Alimenti nell'app, sia modificando `SEED_DIET_DATA` in `app.jsx` (solo per modifiche strutturali, es. aggiungere una categoria al seed iniziale).

**L'unica regola: non riusare mai un ID già usato per un alimento diverso.** Il nome può cambiare, l'ID è per sempre.

Quando aggiungi un nuovo alimento via codice, genera un ID opaco a 6 caratteri (es. `k3m7p2`). L'app genera automaticamente l'ID quando si aggiunge dal tab Alimenti.

Per gli alimenti a porzione variabile usa la formula `"aggiungi XXX col sistema di porzione variabile"` oppure usa il toggle "Variabile" nel tab Alimenti e inserisci kcal per grammo.

**Categoria Alcol → sezione Extra nel Menu:** tutti gli item con `category: "Alcol"` finiscono automaticamente nella sezione "🍺 Extra" del tab Menu e dello Storico.

**Attenzione:** non pushare mai a metà giornata se stai cambiando un alimento fisso in variabile — la sanitizzazione al carico azzera il count se varGrams è assente.

### Build
**Dopo ogni modifica a `app.jsx`, eseguire sempre `npm run build` prima di committare.**

```bash
npm run build   # compila app.jsx → app.js
```

### Git
Usare sempre `git add .` quando si committa (non specificare file singoli).

### Push
**Non pushare mai autonomamente.** Aspettare che Valerio lo dica esplicitamente.

---

## Funzionalità implementate

### Tracker (tab "Oggi")
- Lista alimenti divisa in categorie, ognuna è un accordion
- Layout interno accordion: **CSS Grid** (`1fr auto 56px 84px`) — nome flessibile, porzione auto, kcal e counter fissi
- Contatore +/− per porzione (supporta stessa voce più volte)
- **Alimenti a porzione variabile** (`variable: true, kcalPerG: N`): input "Grammi" nella colonna porzione, kcal si aggiorna live
- Bottoni +/− sempre visibili: il − è opaco (75%) e non cliccabile finché qty = 0
- Totale kcal live con barra di progresso colorata (verde/giallo/rosso)
- Goal calorico fisso a 2000 kcal nell'header (non editabile — il target si edita per giorno nello Storico)
- Shake animation quando si supera il target per la prima volta
- Barra di ricerca per filtrare gli alimenti per nome (solo loggati)
- Bottone "chiudi tutto" per chiudere tutti gli accordion aperti
- Feedback tattile (vibrazione) al tap su +
- Reset manuale con conferma (modale custom)
- Legenda colori barre kcal in fondo alla lista
- Logo testuale sostituito con `logo2.png` nell'header

### Extra (campo libero)
- Card in fondo alla lista con due input: nome alimento + kcal
- Gli extra hanno un `uid` opaco per essere tracciati nel log
- Gli extra appaiono come lista con bottone × per rimuoverli
- Si sommano al totale kcal

### Tab Menu (solo loggati, appare solo con almeno un alimento loggato)
- Mostra tutto ciò che è stato loggato oggi, raggruppato per fascia oraria
- **Voci duplicate raggruppate:** stesso alimento ripetuto più volte appare come "Bao ×3"
- **Fasce orarie:** Fuori Orario / Colazione / Merenda metà mattina / Pranzo / Merenda pomeriggio / Cena
- **Sezione 🍺 Extra:** tutti gli alcolici (categoria "Alcol") appaiono qui indipendentemente dall'orario

### Tab Alimenti (solo loggati)
- Gestione completa della lista alimenti direttamente nell'app
- **Struttura:** categorie come accordion, ognuna con la lista degli item interni
- **Per ogni item:** visualizzazione nome + kcal/porzione, bottone modifica (✏️) e elimina (🗑️)
- **Modifica inline:** form che sostituisce la riga, con campi nome, porzione, kcal (o kcal/g se variabile), toggle variabile
- **Aggiunta item:** bottone "+ Aggiungi alimento" in fondo a ogni categoria aperta
- **Aggiunta categoria:** bottone "+ Aggiungi categoria" in fondo alla lista
- **Eliminazione categoria:** bottone "Elimina categoria" in fondo all'accordion aperto
- **Drag & drop** (SortableJS): handle `⠿` su ogni riga per riordinare gli item all'interno della stessa categoria — funziona su mouse e touch
- **Salvataggio:** ogni modifica (add/edit/delete/reorder) salva immediatamente su Firestore `config/foods`
- **Prima apertura post-deploy:** se `config/foods` non esiste, viene seminato da `SEED_DIET_DATA`
- **Auto-merge al login:** se `config/foods` esiste ma mancano item/categorie presenti in `SEED_DIET_DATA`, vengono aggiunti automaticamente. Garantisce che nuovi alimenti aggiunti via codice appaiano anche per utenti già onboardati
- Eliminare un item con conteggi attivi oggi mostra un warning — il conteggio giornaliero non viene modificato

### Modali di conferma
Tutti i `window.confirm` sono stati sostituiti con modali custom coerenti col design dell'app:
- **Reset** e **Logout**: modale con bottoni Annulla / Conferma (accent)
- **Elimina alimento** e **Elimina categoria**: modale con bottone Conferma in rosso (danger)
- Stato: `confirmModal = { title, message, onConfirm, danger? } | null`
- Escape chiude la modale

### Autenticazione
- Bottone "Accedi" nell'header (Google OAuth)
- Solo l'ALLOWED_UID può loggarsi
- Da loggato: sync Firestore (debounced 400ms per dati giornalieri, immediato per lista alimenti)
- Da non loggato: localStorage, nessuno storico, reset automatico al cambio giorno
- Al logout: counts, extras, varGrams, log si azzerano; dietData torna a SEED_DIET_DATA

### Esperienza non loggata (MVP guest)
- Nessuna lista alimenti — solo il campo **"Aggiungi alimento"** (nome libero + kcal)
- Banner beta con bottone "Accedi con Google"
- I dati sono in localStorage, si azzerano al cambio di giornata dietetica (05:30)
- Tab Menu, Storico e Alimenti non compaiono

### Storico (tab "Storico", solo loggati)
- **Paginazione bimestrale** con nav ← prec / succ →
- **Settimana in corso**: card sempre aperta, non chiudibile, header viola
- **Settimane passate**: accordion; se completa mostra balance deficit/surplus
- Settimane dal venerdì al giovedì
- Verde = deficit, rosso = surplus
- **Vista pasti nel giorno:** se il giorno ha `log` mostra raggruppato per fascia oraria; altrimenti flat list `items`

#### target giornaliero = calorie bruciate (TDEE)
`day.target` rappresenta le calorie bruciate stimate per quel giorno (default 2000). Il surplus/deficit reale è `totalKcal − target`. Il target dell'header è fisso a 2000 e non è editabile.

**Editing target in Storico:** ogni giorno mostra `{totalKcal} kcal` e sotto `di {target}` (underline tratteggiato). Cliccando si apre un input inline che salva su Firestore e aggiorna tutta la UI in memoria (`setHistory`).

Regole di editabilità:
- **Settimana in corso**: editabile
- **Settimane passate complete** (7 giorni): editabile
- **Settimane passate incomplete** (<7 giorni): non editabile, "di X" statico

#### Calcoli basati su target giornalieri
Tutti i calcoli usano la somma dei `day.target` effettivi, non un fisso 14.000:

- **Balance settimana passata completa**: `totalConsumed − weeklyTarget` dove `weeklyTarget = days.reduce((s,d) => s + (d.target||2000), 0)`
- **Balance settimana incompleta**: non mostrato (warning dati parziali)
- **"Media settimanale" settimana completa**: somma target giornalieri effettivi
- **"Media settimanale" settimana in corso**: `pastDaysTarget + 2000 × (7 − week.days.length)` (giorni rimanenti stimati a 2000)
- **"Media settimanale" settimana incompleta**: fisso 14.000

#### Snackbar proiezione fine settimana
Visibile nella card "Settimana in corso" **dal lunedì in poi** (`daysFromFriday >= 3`, dove venerdì=0).

Formula:
```js
const daysFromFriday = (d.getDay() + 2) % 7; // Ven=0, Sab=1, Dom=2, Lun=3, Mar=4, Mer=5, Gio=6
const weekKcal = week.days.reduce(...);        // kcal giorni passati (da Firestore, escluso oggi)
const daysAfterToday = 6 - daysFromFriday;     // giorni rimanenti dopo oggi
const projectedTotal = weekKcal + Math.max(totalKcal, target) + target * daysAfterToday;
// Math.max(totalKcal, target): oggi si assume almeno il target giornaliero
const pastDaysTarget = week.days.reduce((s, day) => s + (day.target || 2000), 0);
const weeklyProjectedTarget = pastDaysTarget + target + target * daysAfterToday;
const projectedSurplus = projectedTotal - weeklyProjectedTarget;
const weightDelta = (Math.abs(projectedSurplus) / 7700).toFixed(2); // kg
```

- **Surplus** (`projectedSurplus > 0`): banner giallo (`.surplus-snackbar`) con ⚠️ — "Surplus ad oggi: +X kcal / potresti aumentare di circa Y kg"
- **Deficit** (`projectedSurplus <= 0`): banner verde (`.deficit-snackbar`) con ✅ — "Deficit ad oggi: −X kcal / potresti perdere circa Y kg"
- Scompare automaticamente a inizio nuova settimana (venerdì)
- `week.days` non include oggi (la history filtra `ACTIVE_DAY()`); `totalKcal` è lo stato corrente del giorno in corso

### Navigazione tab
- Swipe orizzontale sul `<main>` per passare tra i tab
- Indicatore tab animato con `cubic-bezier`

### Tema
- Toggle ☀️/🌙 nell'header
- Preferenza in localStorage
- CSS variables su `body` / `body.light`
- Tutti i colori WCAG AAA (7:1)

---

## Dettagli tecnici importanti

### dietData — da globale a state dinamico
`SEED_DIET_DATA` è l'array hardcoded in `app.jsx` usato come seed e fallback per la migrazione legacy.

Al login, `dietData` viene caricato da Firestore (`config/foods`) in parallelo con i dati del giorno. Se `config/foods` non esiste, viene seminato da `SEED_DIET_DATA`. Il componente mantiene `dietData` come React state.

`itemById` e `itemCategory` sono `useMemo` derivati da `dietData` — si ricalcolano ad ogni modifica della lista.

### Lookup maps
```js
// globali (per loadLocalData e migrateCountKeys — usano SEED_DIET_DATA)
const seedItemById = {};
const seedItemCategory = {};

// dentro App() — derivati da state
const itemById = useMemo(() => { ... }, [dietData]);
const itemCategory = useMemo(() => { ... }, [dietData]);
```

### Sanitizzazione al carico
Al load da Firestore: se un alimento variabile ha `count > 0` ma `varGrams = 0`, il count viene azzerato. Usa `loadedItemById` (costruito dalla dietData caricata, non da SEED_DIET_DATA).

### Debounce salvataggio
400ms per i dati giornalieri. Il salvataggio di `config/foods` è sincrono (immediato).

### dataReady flag
Bloccato finché non sono caricati **sia** i dati del giorno **sia** la lista alimenti (`config/foods`). Se uno dei due fetch fallisce, `setDataReady(true)` non viene chiamato — il salvataggio non parte.

### ACTIVE_DAY() — giornata dietetica
La giornata dietetica inizia alle **05:30**.

```js
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
```

Non usare `toISOString()` — restituisce UTC e causa sfasamenti.

### SortableJS nel tab Alimenti
Inizializzato via `useEffect([adminOpenCat, activeTab])`. Dipende da `activeTab` perché il tab Alimenti viene smontato/rimontato al cambio tab — senza questa dipendenza, Sortable non verrebbe ricreato al ritorno sul tab. Usa `adminOpenCatRef` e `userRef` per accesso closure-safe a valori correnti dentro `onEnd`.

### genId
```js
const genId = () => Math.random().toString(36).slice(2, 8);
```
Genera ID opachi a 6 caratteri base-36. Usato per nuovi alimenti aggiunti dal tab Alimenti.

---

## Accessibilità (WCAG AAA 2.2)

L'app è sviluppata per essere compliant WCAG AAA 2.2. Ogni nuova funzionalità deve rispettare questi standard.

### Colori (SC 1.4.6 — contrasto 7:1)

| Variabile | Dark | Light |
|---|---|---|
| `--text-dim` | `#b3b3be` | `#52525b` |
| `--text-dimmer` | `#a8a8b4` | `#525262` |
| `--text-dimmest` | `#a0a0aa` | `#606070` |
| `--accent` | `#b09dfc` | `#5b21b6` |
| `--color-positive` | `#4ade80` | `#14532d` |
| `--color-negative` | `#fa8585` | `#991b1b` |
| `--color-warning` | `#fbbf24` | `#78350f` |

### Focus, Touch target, Motion, Semantic HTML
- Global `:focus-visible` 3px accent, offset 2px
- Counter buttons: touch target 44×44px via `::before { inset: -11px }`
- `@media (prefers-reduced-motion)` disabilita tutte le transizioni
- Skip link, `role="navigation"`, `aria-expanded`, `aria-label` su tutti i bottoni icona

---

## Lista alimenti
La lista completa è gestita in Firestore (`config/foods`). `SEED_DIET_DATA` in `app.jsx` è la versione di partenza.  
Ogni voce ha un campo `id` opaco a 6 caratteri che non va mai modificato.

---

## File nella repo
- `index.html` — scheletro HTML (head, root div, CDN scripts con SRI, SortableJS, CSP meta tag)
- `style.css` — tutto il CSS dell'app
- `app.jsx` — sorgente JSX React — **non caricato dal browser**
- `app.js` — output compilato — **quello che carica il browser**
- `build.js` — script di compilazione
- `package.json` — devDependencies + script `build`
- `package-lock.json` — lockfile npm
- `manifest.json` — PWA manifest
- `logo.png` — icona app PWA
- `logo2.png` — logo testuale nell'header
- `no.gif` — gif accesso negato
- `.gitignore` — esclude `.claude/`, `CLAUDE.md`, `node_modules/`
- `CONTEXT.md` — questo file

---

## Idee discusse ma non implementate
- **Grafico nello storico** — scartato per ora
- **Nota giornaliera** — scartata per ora
- **Google Fit integration** — impossibile, API dismessa dal 30/06/2025

---

## Come lavorare su questo progetto
1. Modifiche al CSS → `style.css`
2. Modifiche alla logica/UI → `app.jsx`, poi **`npm run build`**
3. Aggiunta/modifica alimenti → direttamente dal **tab Alimenti** nell'app (loggato), oppure in `SEED_DIET_DATA` in `app.jsx` per modifiche strutturali al seed
4. Push → `git add . && git commit -m "..." && git push` — solo quando Valerio lo chiede
5. GitHub Pages → si aggiorna in 1-2 minuti dal push
6. Per testare in locale → live server su `127.0.0.1:5500`

### Cache PWA mobile
`app.js` è caricato con query string di versione: `<script src="app.js?v=HASH">`. L'hash è i primi 8 caratteri del SHA-256 del contenuto di `app.js`, aggiornato automaticamente da `build.js`.

### Sicurezza
- **SRI hash** su tutti gli script CDN eccetto SortableJS (aggiunto successivamente)
- **Content Security Policy** via meta tag: `script-src` include `unpkg.com` (dove risiedono React e SortableJS)
- **Babel non più nel browser**
- **Versioni CDN pinnate**
