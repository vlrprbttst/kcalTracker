# kcalTracker — Contesto progetto

## Cos'è
App personale tracking calorie giornaliere. GitHub Pages. Sviluppata con Valerio Pierbattista (omegaiori@gmail.com).

**Live:** https://vlrprbttst.github.io/kcalTracker
**Repo:** https://github.com/vlrprbttst/kcalTracker
**File principali:** `index.html` (scheletro), `style.css`, sorgenti JSX in `src/`, `app.js` (bundle caricato dal browser).
**Lista alimenti:** `src/seed.js` (`SEED_DIET_DATA`, seed iniziale). In produzione caricata da Firestore (`users/{uid}/config/foods`).

## Mappa dei moduli (dove vive cosa)
Leggi solo il modulo rilevante:

| Cosa stai modificando | File da aprire |
|---|---|
| Tab "Oggi" (tracker, contatori, extra, banner guest) | `src/tabs/TrackerTab.jsx` |
| Tab Menu (raggruppamento fascia oraria, sezione Alcol) | `src/tabs/MenuTab.jsx` |
| Tab Storico (settimane, balance, edit target, snackbar) | `src/tabs/StoricoTab.jsx` |
| Tab Alimenti (admin: edit/add/delete, SortableJS, search) | `src/tabs/AlimentiAdminTab.jsx` |
| Wizard guidato (steps, spotlight, tooltip) | `src/components/Wizard.jsx` |
| Impostazioni (defaultKcal, fasce orarie) | `src/components/SettingsOverlay.jsx` |
| Modale conferma generica | `src/components/ConfirmModal.jsx` |
| Barra kcal colorata | `src/components/KcalBar.jsx` |
| Header, profile menu, sticky-top, tab routing, login/logout, sync Firestore, debounce, theme, swipe | `src/app.jsx` |
| Firebase config, `auth`, `db`, `ALLOWED_UID` | `src/firebase.js` |
| `SEED_DIET_DATA` + `seedItemById`/`seedItemCategory` | `src/seed.js` |
| `ACTIVE_DAY`, `TODAY`, `genId`, `migrateCountKeys`, `loadLocalData`, `loadTarget`, `computeTotal`, `buildItemsList` | `src/utils.js` |
| `DEFAULT_SCHEDULE`, `minutesToTime`, `timeToMinutes`, `getMealSlot`, `groupLogByMeal`, `groupEntries` | `src/schedule.js` |
| `getWeekStart`, `formatShortDate`, `groupByWeek`, `getBimesterOf`, `bimesterLabel`, `addBimesters`, `getMonthName`, `formatDate` | `src/history.js` |
| Bundling, hash SRI, query string `?v=` | `build.js` |

---

## Stack tecnico
- React 18.3.1 via CDN (pinnato, SRI hash)
- Sorgenti `src/` bundlati con esbuild → `app.js` (IIFE singolo). No Babel-in-browser, no bundler runtime.
- ES modules internamente; `React`, `firebase`, `Sortable` globali da CDN
- Firebase 10.12.2 (compat SDK, CDN pinnato, SRI): Auth (Google OAuth) + Firestore
- SortableJS 1.15.2 via CDN (no SRI) — drag & drop tab Alimenti
- GitHub Pages hosting (branch `master`, auto-deploy on push)
- Dark/light theme via CSS variables
- `build.js` + `package.json` (Node.js + esbuild)

---

## Firebase
- **Project ID:** `kcaltracker-5dd56`
- **Auth domain:** `kcaltracker-5dd56.firebaseapp.com`
- **API Key:** `AIzaSyBCY1ONerEeZ6Ysa34222hZ-JzJ_rIjcZI` (safe da esporre, Firebase)
- **ALLOWED_UID / OWNER_UID:** `f1rMJWrezfORvihvxM5EspY3FsA3` (Valerio — owner, riceve seed e auto-merge da `SEED_DIET_DATA`)
- **maxUsers:** `5`
- **Domini autorizzati:** `localhost`, `127.0.0.1`, `vlrprbttst.github.io`

### Accesso multi-utente
Gestito da `config/access`:
```json
{ "allowedUids": ["f1rMJWrezfORvihvxM5EspY3FsA3", ...], "maxUsers": 5 }
```
Al login:
- UID in lista → accede
- UID non in lista + slot disponibili → `arrayUnion` + accede
- UID non in lista + lista piena → signOut + modale "Accesso non disponibile"

Nuovi utenti partono con `[]`. Seed/auto-merge `SEED_DIET_DATA` solo owner.

### Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /config/access {
      allow read: if request.auth != null;
      allow update: if request.auth != null
        && resource.data.allowedUids.size() < resource.data.maxUsers
        && !resource.data.allowedUids.hasAny([request.auth.uid])
        && request.resource.data.allowedUids.hasAll(resource.data.allowedUids)
        && request.resource.data.allowedUids.size() == resource.data.allowedUids.size() + 1
        && request.resource.data.allowedUids.hasAll([request.auth.uid])
        && request.resource.data.maxUsers == resource.data.maxUsers;
    }

    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId
        && get(/databases/$(database)/documents/config/access).data.allowedUids.hasAny([request.auth.uid]);
    }

  }
}
```

### Struttura dati Firestore
```
config/access: { allowedUids: [...], maxUsers: 5 }

users/{uid}/
  config/
    foods: { dietData: [ { category, icon, items: [{ id, name, portion, kcal, variable?, kcalPerG? }] } ] }
    schedule: { schedule: [ { key, label, end } ], defaultKcal: 2000 }
  days/{YYYY-MM-DD}: {
    counts:   { "<id>": N, ... },           // ID stabili opachi 6 char
    varGrams: { "<id>": grams, ... },
    extras:   [{ uid, name, kcal }],
    log:      [{ type: "item"|"extra", id?, uid?, name, kcal, grams, category?, ts }],
    target, totalKcal, items: [...], date, updatedAt
  }
```

**Note campi:**
- `config/foods.dietData`: lista alimenti, editabile da tab Alimenti. Owner: seminata da `SEED_DIET_DATA`. Altri: `[]`.
- `counts`/`varGrams`: chiavi = ID stabili 6 char
- `extras`: `uid` opaco per tracking nel log
- `log`: cronologico, solo giorno corrente
- `items`: stringhe leggibili per storico, immuni a future modifiche alimenti
- Debounce dati giornalieri: **400ms**. Save `config/foods`: **immediato**.

### Migrazione
`migrateCountKeys()` converte vecchi documenti `"ci_ii"` → ID stabili. Usa `SEED_DIET_DATA`. Dati già migrati.

---

## Regole importanti

### Aggiunta/modifica alimenti
Aggiungi/rimuovi/riordina liberamente (tab Alimenti o `SEED_DIET_DATA` per modifiche al seed).

**Regola unica: mai riusare un ID per alimento diverso.** Nome può cambiare, ID è per sempre.

Nuovi alimenti via codice: ID opaco 6 char base-36 (es. `k3m7p2`). Tab Alimenti genera auto.

Variabili: toggle "Variabile" nel tab. Inserisci g + kcal corrispondenti → `kcalPerG` calcolato auto. **Mai inserire `kcalPerG` a mano nel codice.**

**Categoria "Alcol" → sezione Extra** in tab Menu e Storico.

**Attenzione:** non pushare a metà giornata cambiando fisso → variabile. Sanitization al carico azzera count se `varGrams` assente.

### Build
**Dopo ogni modifica a `src/`, sempre `npm run build` prima del commit.**

```bash
npm run build   # esbuild bundla src/app.jsx → app.js
```

### Git
Sempre `git add .` (mai file singoli).

### Push
**Mai pushare autonomamente.** Aspetta esplicita richiesta Valerio.

---

## Funzionalità implementate

### Tracker (tab "Oggi")
- Lista alimenti in accordion per categoria. Layout interno: CSS Grid `1fr auto 56px 84px`
- Contatore +/− per porzione (multi-tap supportato)
- Alimenti variabili (`variable: true, kcalPerG: N`): input "Grammi", kcal aggiornato live
- − opaco (75%) e disabilitato a qty 0
- Totale kcal live, barra colorata (verde/giallo/rosso)
- Goal header = `defaultKcal` utente (editabile da Impostazioni o Storico per giorno)
- Shake animation al primo overshoot
- Ricerca filtra per nome (solo loggati)
- Vibrazione al tap +
- Reset con conferma (modale custom)
- Legenda colori barre kcal fondo lista
- Logo `logo-main-horizontal.png` responsive: 43/155px <390px, 52/210px ≥390px, 56/270px ≥768px. Gap bottoni: 6px <390px, 8px ≥390px

### Extra (campo libero)
- Card fondo lista: nome + kcal
- `uid` opaco per tracking nel log
- Lista con × per rimuovere
- Si sommano al totale

### Tab Menu (loggati, ≥1 alimento loggato)
- Loggato oggi raggruppato per fascia oraria. Duplicati uniti ("Bao ×3")
- Fasce: Fuori Orario / Colazione / Merenda mattina / Pranzo / Merenda pomeriggio / Cena
- Sezione 🍺 Extra: tutta categoria "Alcol" qui a prescindere dall'orario

### Menu profilo (loggati)
- Clic avatar → dropdown: ⚙️ Impostazioni, 🚪 Logout
- Chiude a clic fuori
- Logout = modale custom

### Impostazioni (overlay full-screen)
- Apre da ⚙️ nel profilo. Overlay fixed `z-index: 50`. × o Esc chiude (se wizard non in controllo)
- **Calorie giornaliere:** input `defaultKcal` (TDEE). Target default nuovi giorni. Singolo giorno editabile da Storico.
- **Fasce orarie:** label + end HH:MM (text input, non `type="time"` — garantisce 24h)
- Salva → Firestore (`config/schedule`: `schedule` + `defaultKcal`), aggiorna state, imposta `target` di oggi a `defaultKcal`
- Modifiche fasce in draft locale fino al salva

### defaultKcal
- `config/schedule.defaultKcal`. Default 2000 se assente.
- Fallback `target` quando giorno senza `target` esplicito
- Cambio `defaultKcal` aggiorna anche `target` giorno corrente
- Target singolo giorno (Storico) precede `defaultKcal`
- Guest: `target` da `localStorage` (`kcal_target`), default 2000

### Tab Alimenti (loggati)
- Categorie come accordion. Per item: nome + kcal/porzione, ✏️ + 🗑️
- Modifica inline: nome, porzione (nascosta se variabile), toggle variabile, kcal o `[Xg = Y kcal]`
- Variabili: due input `[g rif] g = [kcal] kcal` → `kcalPerG` al save. Porzione nascosta (sempre "g"). Toggle resetta porzione.
- Display lista variabili: `X kcal/100g` (non `kcalPerG kcal/g`)
- Edit variabile esistente: pre-popola `100g` e `Math.round(kcalPerG × 100)` kcal
- "+ Aggiungi alimento" fondo categoria aperta. "+ Aggiungi categoria" fondo lista. "Elimina categoria" fondo accordion
- **Ricerca:** barra header (visibile se `activeTab === "alimenti"`), state `adminSearchQuery`. Vista flat filtrata con highlight. ✏️ da search: clear query + apre categoria + form edit. 🗑️ diretto. Reset query al cambio tab.
- **Drag & drop item** (SortableJS): handle `⠿` per riga, riordina dentro categoria. Mouse + touch.
- **Drag & drop categorie:** handle `⠿` a sinistra titolo. Save immediato Firestore.
- Save: immediato a ogni mod (add/edit/delete/reorder) su `config/foods`
- Prima apertura owner: seminato da `SEED_DIET_DATA`. Altri utenti: lista vuota. **Nessun auto-merge:** dopo primo login `config/foods` è source-of-truth; modifiche successive a `SEED_DIET_DATA` non si propagano (evita che item eliminati riappaiano).
- Eliminare item con count attivo oggi: warning, conteggio non modificato

### Modali di conferma
Tutti `window.confirm` → modali custom:
- **Reset, Logout:** Annulla / Conferma (accent)
- **Elimina alimento/categoria:** Conferma rosso (danger)
- State: `confirmModal = { title, message, onConfirm, danger? } | null`
- Esc chiude

### Wizard guidato (loggati)
- 🧙 nell'header (solo loggati). Guida a step.
- **Auto-apertura primo login:** se `config/foods` assente, wizard apre auto dopo `setDataReady(true)` tramite flag `autoOpenWizard`. Tutti utenti (incluso owner). Successive visite: `config/foods` esiste, wizard non riapre.
- `WIZARD_STEPS` in `src/components/Wizard.jsx`, campi: `tab`, `selector`, `title`, `text`, `last`, `openSettings`. Anche importato in `src/app.jsx` per orchestration (step → tab/settings/profile-menu).
- Step può cambiare tab attivo + spotlight DOM (via `selector`)
- **Spotlight:** 4 div `.wiz-mask` mascherano fuori. Bordo `.wizard-spotlight-border` (animazione `wizardPulse`).
- **Tab switching + settings (`src/app.jsx`):** `useEffect([wizardOpen, wizardStep])` imposta `activeTab` se step ha `tab`; se ha `openSettings`, apre overlay (chiude su altri step o close wizard). Resta in App per coord cross-componente.
- **Misurazione spotlight (in `Wizard`):** `useEffect([open, step, activeTab])` con doppio `requestAnimationFrame` + `scrollIntoView`. State `spotlightRect` interno.
- **Tooltip:** `top` fisso. Logica: prova sotto → prova sopra → clamp viewport. `TOOLTIP_H = 240`.
- Emoji tema dinamica: testo step 1 contiene `{themeIcon}` sostituito a render (🌙 light / ☀️ dark)
- "Fatto!" chiude wizard + torna tab "oggi"
- Selector `data-wizard` su pulsanti tab Alimenti/Storico
- 11 step: Benvenuto → Controlli header → Contatore+barra → Tracker → Extra → Alimenti tab → Aggiungi alimenti → Storico → Profile menu → Calorie giornaliere (apre overlay) → Fasce orarie (overlay)

### Autenticazione
- "Accedi" header (Google OAuth)
- Multi-utente via `config/access`, max 5, primo-arriva
- Loggato: sync Firestore (debounce 400ms dati / immediato lista alimenti)
- Guest: localStorage, no storico, reset al cambio giorno
- Logout: counts/extras/varGrams/log azzerati; dietData → SEED_DIET_DATA

### Guest (MVP)
- No lista alimenti — solo "Aggiungi alimento" libero (nome + kcal)
- Banner beta + "Accedi con Google"
- Dati localStorage, azzerati a 05:30 (cambio giorno dietetico)
- Tab Menu/Storico/Alimenti nascosti

### Storico (loggati)
- Paginazione bimestrale con ← prec / succ →
- Settimana corrente: card aperta non chiudibile, header viola
- Passate: accordion; complete mostrano balance deficit/surplus
- Settimane venerdì → giovedì
- Verde = deficit, rosso = surplus
- **Vista pasti:** se giorno ha `log` raggruppa per fascia; altrimenti flat `items`

#### target giornaliero = TDEE
`day.target` = kcal bruciate stimate (default = `defaultKcal`). Surplus/deficit reale = `totalKcal − target`. Header mostra `defaultKcal`, editabile da Impostazioni o per giorno da Storico.

**Edit in Storico:** giorno mostra `{totalKcal} kcal` + `di {target}` (underline tratteggiato). Clic → input inline, save Firestore + `setHistory`.

Editabilità:
- Settimana corrente: editabile
- Passate complete (7gg): editabile
- Passate incomplete (<7gg): non editabile, "di X" statico

#### Calcoli basati su target giornalieri
Usa somma `day.target` effettivi, non fisso 14.000:
- Balance passata completa: `totalConsumed − weeklyTarget` (`weeklyTarget = sum(day.target||2000)`)
- Balance incompleta: non mostrato (dati parziali)
- Media settimanale completa: somma target giornalieri
- Media corrente: `pastDaysTarget + 2000 × (7 − week.days.length)`
- Media incompleta: fisso 14.000

#### Snackbar proiezione fine settimana
Card "Settimana corrente" da lunedì in poi (`daysFromFriday >= 3`, dove venerdì=0). Formula in `src/tabs/StoricoTab.jsx`. Output: surplus (giallo ⚠️) / deficit (verde ✅), delta peso = `|projectedSurplus| / 7700` kg. Scompare a nuova settimana (venerdì). `week.days` esclude oggi.

### Navigazione tab
- Swipe orizzontale su `<main>`
- Indicatore animato `cubic-bezier`
- Header + `.tabs-bar` in `<div className="sticky-top">` (`position: sticky; top: 0; z-index: 10`). Header non sticky proprio; bordo su `.tabs-bar`. Guest (no `.tabs-bar`): bordo ripristinato via `.sticky-top:not(:has(.tabs-bar)) .header`.
- Tab fluiscono da sx, no spacer `flex: 1`
- `.tabs-inner`: `overflow-x: auto; overflow-y: clip; scrollbar-width: none` — scroll orizz su schermi piccoli senza clippare indicatore attivo (`bottom: -1px`, tollerato da `padding-bottom: 1px`)

### Tema
- Toggle ☀️/🌙 header. Preferenza localStorage. CSS vars su `body` / `body.light`. Colori WCAG AAA (7:1).

---

## Dettagli tecnici

### dietData — globale → state
`SEED_DIET_DATA` in `src/seed.js` = seed + fallback migrazione legacy.

Al login: `dietData` caricato da Firestore (`config/foods`) in parallelo coi dati giorno. Se assente → seed da `SEED_DIET_DATA`. React state.

`itemById` / `itemCategory` = `useMemo` derivati da `dietData`.

### Lookup maps
```js
// globali (loadLocalData, migrateCountKeys — usano SEED_DIET_DATA)
const seedItemById = {};
const seedItemCategory = {};

// dentro App()
const itemById = useMemo(() => { ... }, [dietData]);
const itemCategory = useMemo(() => { ... }, [dietData]);
```

### Sanitizzazione al carico
Variabile con `count > 0` ma `varGrams = 0` → count azzerato. Usa `loadedItemById` (da dietData caricata, non SEED).

### Debounce
400ms dati giornalieri. `config/foods` immediato.

### dataReady
True solo quando caricate **tre** risorse: dati giorno + `config/foods` + `config/schedule`. Fetch fallito → no `setDataReady(true)` → no save.

### ACTIVE_DAY() — giornata dietetica
Giornata inizia **05:30**.
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
**Mai `toISOString()`** — UTC, sfasamenti.

### SortableJS (tab Alimenti)
Tutto codice in `src/tabs/AlimentiAdminTab.jsx`. Cleanup automatico via React unmount (componente render solo se `activeTab === "alimenti"`). Due istanze:

**Item sortable** — `useEffect([adminOpenCats, adminSearchQuery])`. Container = div interno categoria aperta. Refs: `sortableItemRefs` (dict per nome categoria), `sortableItemInstances`. Handle `.admin-drag-handle`. Dipende da `adminOpenCats` (Set) e `adminSearchQuery` (search smonta i ref). Inizio loop: check `instance.el !== el` (istanza stantia su nodo smontato) → destroy + delete prima di ricreare. Usa `adminOpenCatsRef`, `userRef`, `dietDataRef` per closure-safe in `onEnd`.

**`onEnd` con `group: 'items'`:** verificato su source SortableJS 1.15.2 — `onEnd` fire solo su sortable sorgente, non destinazione. Guard `if (from !== el) return;` = difesa innocua. Save Firestore **fuori** dal callback `setDietData` (no race: save drag dopo save delete riscrive Firestore con stato pre-cancellazione).

**Category sortable** — `useEffect([adminSearchQuery])`. Container = div che racchiude solo `.category-card` (sotto-div di `.admin-tab`, prima del "+ Aggiungi categoria") (`sortableCatsRef`). Handle `.admin-cat-drag-handle`. Container esclude "+ Aggiungi categoria" (evita sfasamento indici). Categorie usano `key={cat.category}` (non `key={catIdx}`) — chiavi stabili: React segue nodo DOM per identità invece di riconciliare per posizione. `onEnd` aggiorna `dietData` via `dietDataRef.current` (no functional update), save Firestore fuori dal callback.

### genId
```js
const genId = () => Math.random().toString(36).slice(2, 8);
```
ID opaco 6 char base-36.

---

## Accessibilità (WCAG AAA 2.2)

App compliant WCAG AAA 2.2. Ogni feature deve rispettare.

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

### Focus/Touch/Motion/Semantic
- Global `:focus-visible` 3px accent, offset 2px
- Counter buttons: touch target 44×44 via `::before { inset: -11px }`
- `@media (prefers-reduced-motion)` disabilita transizioni
- Skip link, `role="navigation"`, `aria-expanded`, `aria-label` su bottoni icona

---

## Lista alimenti
Completa in Firestore (`config/foods`). `SEED_DIET_DATA` in `src/seed.js` = versione di partenza. `id` opaco 6 char mai modificare.

---

## File repo
- `index.html` — scheletro (head, root, CDN scripts SRI, SortableJS, CSP meta)
- `style.css` — tutto CSS
- `src/app.jsx` — guscio React (state, sync Firestore, header, tab routing) — **non caricato dal browser**
- `src/firebase.js`, `src/seed.js`, `src/utils.js`, `src/schedule.js`, `src/history.js` — costanti, helper, lookup
- `src/components/` — `KcalBar.jsx`, `ConfirmModal.jsx`, `SettingsOverlay.jsx`, `Wizard.jsx`
- `src/tabs/` — `TrackerTab.jsx`, `MenuTab.jsx`, `StoricoTab.jsx`, `AlimentiAdminTab.jsx`
- `app.js` — bundle IIFE da esbuild — **caricato dal browser**
- `build.js` — esbuild + SHA-256 cache busting
- `package.json` / `package-lock.json`
- `manifest.json` — PWA
- `logo-main.png` (PWA icon), `logo-main-horizontal.png` (header)
- `logo.png`, `logo2.png` (legacy), `no.gif` (accesso negato)
- `.gitignore` — `.claude/`, `node_modules/`
- `CLAUDE.md` — questo file

---

## Idee scartate
- Grafico storico — scartato
- Nota giornaliera — scartata
- Google Fit — API dismessa 30/06/2025

---

## Come lavorare
1. CSS → `style.css` + **`npm run build`** (aggiorna hash CSS in `index.html`)
2. Logica/UI → file pertinente in `src/` (vedi "Mappa moduli") + **`npm run build`**
3. Alimenti → tab Alimenti (loggato) o `SEED_DIET_DATA` per modifiche al seed
4. Push → `git add . && git commit -m "..." && git push` — solo quando Valerio chiede
5. GitHub Pages → aggiorna in 1-2 min
6. Test locale → live server `127.0.0.1:5500`

### Cache PWA mobile
`app.js`, `style.css`, `manifest.json` caricati con `?v=HASH` (primi 8 char SHA-256, aggiornati da `build.js`). **Modificare senza `npm run build` non invalida la cache PWA.**

### Sicurezza
- SRI hash su tutti gli script CDN inclusi SortableJS (`sha384-BSxuMLxX+...`)
- CSP via meta tag: `script-src` senza `unsafe-inline` (rimosso, React non usa inline scripts); `style-src` mantiene `unsafe-inline` (necessario per inline styles React)
- Babel non in browser
- Versioni CDN pinnate
