# kcalTracker — Contesto completo del progetto

## Cos'è
App personale per tracciare le calorie giornaliere. Pubblicata su GitHub Pages. Sviluppata con Valerio Pierbattista (omegaiori@gmail.com).

**Live:** https://vlrprbttst.github.io/kcalTracker  
**Repo:** https://github.com/vlrprbttst/kcalTracker  
**File principali:** `index.html` (scheletro HTML), `style.css` (tutto il CSS), `app.jsx` (tutto il JS/JSX React)  
**File di riferimento alimenti:** la lista alimenti è in `app.jsx` nell'array `dietData`.

---

## Stack tecnico
- React 18.3.1 via CDN (versione pinnata, SRI hash)
- **app.jsx pre-compilato in app.js con Babel Node** — Babel non è più nel browser
- Firebase 10.12.2 (compat SDK via CDN, versione pinnata, SRI hash):
  - **Authentication** — Google OAuth
  - **Firestore** — salvataggio dati giornalieri e storico
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
- `counts` / `varGrams`: chiavi = ID stabili opachi a 6 caratteri da `dietData`
- `extras`: ogni extra ha un `uid` opaco generato al momento dell'aggiunta (per tracciamento nel log)
- `log`: array cronologico di tutto ciò che è stato mangiato, con timestamp ISO. Usato dal tab Menu e dallo Storico (vista raggruppata per pasto). Non va storicizzato — vale solo per il giorno corrente.
- `items`: stringhe leggibili per lo storico — immune a modifiche future agli alimenti
- Il debounce di salvataggio è **400ms**

### Migrazione automatica
`migrateCountKeys()` converte i vecchi documenti con chiavi `"ci_ii"` al formato ID stabile. Gira su localStorage e Firestore (solo documento di oggi).

---

## Regole importanti

### Aggiunta/modifica alimenti
Puoi aggiungere, rimuovere e riordinare alimenti liberamente — gli ID stabili disaccoppiano i dati Firestore dalla posizione nell'array.

**L'unica regola: non riusare mai un ID già usato per un alimento diverso.** Il nome può cambiare, l'ID è per sempre.

Quando aggiungi un nuovo alimento, Claude genera un ID opaco a 6 caratteri (es. `k3m7p2`). Non ha significato — è intenzionale.

Per gli alimenti a porzione variabile usa la formula `"aggiungi XXX col sistema di porzione variabile"` e specifica nome + kcal per 100g.

**Categoria Alcol → sezione Extra nel Menu:** tutti gli item con `category: "Alcol"` finiscono automaticamente nella sezione "🍺 Extra" del tab Menu e dello Storico, indipendentemente dall'orario. Basta aggiungere nuovi alcolici nella categoria "Alcol" in `dietData`.

**Attenzione:** non pushare mai a metà giornata se stai cambiando un alimento fisso in variabile — la sanitizzazione al carico azzera il count se varGrams è assente.

### Build
**Dopo ogni modifica a `app.jsx`, eseguire sempre `npm run build` prima di committare.** Il browser carica `app.js` (JavaScript puro), non `app.jsx`. Se non si ricompila, le modifiche non hanno effetto.

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
- **Alimenti a porzione variabile** (`variable: true` in dietData): input "Grammi" nella colonna porzione, kcal si aggiorna live; +/− contano le porzioni come al solito. Variabili attuali: Basmati cotto (`kcalPerG: 4/3`), Gnocchi (`kcalPerG: 1.5`), Pasta (`kcalPerG: 3.6`), Passata (`kcalPerG: 0.3`), Tikka masala sauce (`kcalPerG: 1.32`), Olio (`kcalPerG: 9`)
- Bottoni +/− sempre visibili: il − è opaco (75%) e non cliccabile finché qty = 0
- Totale kcal live con barra di progresso colorata (verde/giallo/rosso)
- Goal calorico editabile cliccando il numero nell'header (default: 2000 kcal)
- Shake animation quando si supera il target per la prima volta
- Bottone "chiudi tutto" per chiudere tutti gli accordion aperti
- Feedback tattile (vibrazione) al tap su + (funziona solo se la vibrazione del telefono è attiva)
- Reset manuale con conferma (azzera counts, extras, varGrams, log)
- Legenda colori barre kcal in fondo alla lista (verde <250, giallo 250–400, rosso >400)
- Logo testuale sostituito con `logo2.png` nell'header

### Extra (campo libero)
- Card in fondo alla lista con due input: nome alimento + kcal
- Gli extra hanno un `uid` opaco per essere tracciati nel log
- Gli extra appaiono come lista con bottone × per rimuoverli (rimozione per uid, non per indice)
- Si sommano al totale kcal

### Tab Menu (solo loggati, appare solo con almeno un alimento loggato)
- Si trova tra "Oggi" e "Storico"
- Mostra tutto ciò che è stato loggato oggi, raggruppato per fascia oraria
- **Voci duplicate raggruppate:** stesso alimento ripetuto più volte appare come "Bao ×3" con kcal totali sommate. Per alimenti variabili, grammi diversi restano voci separate (es. "Basmati 150g" e "Basmati 200g")
- Scompare automaticamente se il log si svuota (torna su "Oggi")
- **Fasce orarie:**
  - 00:00–05:29 → **Fuori Orario**
  - 05:30–10:30 → **Colazione**
  - 10:31–12:00 → **Merenda metà mattina**
  - 12:01–15:00 → **Pranzo**
  - 15:01–19:00 → **Merenda pomeriggio**
  - 19:01–22:00 → **Cena**
  - 22:01–23:59 → **Fuori Orario** (stessa fascia del mattino presto)
- **Sezione 🍺 Extra:** tutti gli alcolici (categoria "Alcol") appaiono qui, indipendentemente dall'orario
- Il log è salvato in Firestore → persiste tra dispositivi e reload
- Ogni pressione di + aggiunge una voce al log con timestamp corrente; ogni − rimuove l'ultima voce di quell'alimento
- Per alimenti variabili: se si digitano i grammi dopo aver premuto +, l'ultima voce del log viene aggiornata retroattivamente

### Autenticazione
- Bottone "Accedi" nell'header (Google OAuth)
- Solo l'ALLOWED_UID può loggarsi — chiunque altro vede la gif `no.gif` + messaggio "non puoi loggarti..."
- Da loggato: sync Firestore (debounced 400ms)
- Da non loggato: localStorage, nessuno storico, reset automatico al cambio giorno
- Al logout: counts, extras, varGrams, log si azzerano

### Esperienza non loggata (MVP guest)
- **Non viene mostrata** la lista alimenti (categorie), la search bar, la legenda kcal né la categoria Alcol
- L'unica interfaccia è il campo **"Aggiungi alimento"** (ex "Extra"): nome libero + kcal — identico al meccanismo Extra dell'utente loggato
- In fondo compare un **banner beta** che spiega le funzionalità disponibili da loggato e offre il bottone "Accedi con Google"
- I dati sono in localStorage, si azzerano automaticamente al cambio di giornata dietetica (05:30)
- Tab Menu e Storico non compaiono

### Storico (tab "Storico", solo loggati)
- **Paginazione bimestrale** (Gen-Feb, Mar-Apr, ecc.) con nav ← prec / succ →
- **Header mese** per ogni gruppo di settimane
- **Settimana in corso**: card sempre aperta, non chiudibile, header viola
- **Settimane passate**: accordion chiuso; cliccabile per aprire
  - Se **completa** (7/7 giorni): mostra balance deficit/surplus a destra nell'header
  - Se **incompleta**: nessun balance nell'header, solo date + N/7 giorni + ⚠️
- Settimane dal venerdì al giovedì (Valerio si pesa il venerdì)
- **Obiettivo settimana: 14.000 kcal** (fisso)
- Verde = deficit, rosso = surplus
- **Settimane incomplete**: accordion giallino, nota "dati parziali" nel riepilogo aperto
- **Vista pasti nel giorno:**
  - Se il giorno ha `log` (dati nuovi): mostra raggruppato per fascia oraria con sezione "🍺 Extra:" per alcolici
  - Se il giorno non ha `log` (dati vecchi): mostra la flat list `items` (compatibilità)
- Label riepilogo settimana: "Media settimanale" (14.000 kcal) e "Calorie assunte"

### Tema
- Toggle ☀️/🌙 nell'header
- Preferenza salvata in localStorage
- Transizione animata (0.25s)
- CSS variables su `body` / `body.light`
- Tutti i colori rispettano WCAG AAA (7:1 testo normale, 4.5:1 testo grande) — vedere sezione Accessibilità

---

## Dettagli tecnici importanti

### Lookup maps (globali, costruite da dietData)
```js
const itemById = {};      // id → item object
const itemCategory = {};  // id → nome categoria
dietData.forEach(cat => cat.items.forEach(item => {
  itemById[item.id] = item;
  itemCategory[item.id] = cat.category;
}));
```

### Sanitizzazione al carico
Al load da Firestore e localStorage: se un alimento variabile ha `count > 0` ma `varGrams = 0`, il count viene azzerato. Previene lo stato "evidenziato ma senza grammi".

### Debounce salvataggio
400ms (ridotto da 1500ms per ridurre il rischio di perdita dati su reload PWA).

### dataReady flag
Blocca il salvataggio Firestore finché i dati non sono stati caricati. Previene il sovrascrittura dei dati al login.

### ACTIVE_DAY() — giornata dietetica
La funzione `ACTIVE_DAY()` sostituisce `TODAY()` ovunque nell'app. La giornata dietetica inizia alle **05:30**: qualsiasi alimento loggato tra le 00:00 e le 05:29 viene attribuito al giorno precedente (es. mangi qualcosa all'1:00 del 25 aprile → finisce nello storico del 24 aprile, fascia "Fuori Orario").

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

**Attenzione:** non usare `toISOString()` per calcolare la data locale — restituisce UTC e causa sfasamenti nelle timezone non-UTC (es. in Italia UTC+2 a mezzanotte locale è ancora il giorno prima in UTC). Usare sempre `getFullYear/Month/Date`.

Usata per: load/save Firestore, localStorage, filtro storico, rilevamento settimana corrente, paginazione bimestrale.

---

## Accessibilità (WCAG AAA 2.2)

L'app è sviluppata per essere compliant WCAG AAA 2.2. Ogni nuova funzionalità deve rispettare questi standard.

### Colori (SC 1.4.6 — contrasto 7:1)
Variabili aggiornate per garantire 7:1 su tutti i background:

| Variabile | Dark | Light |
|---|---|---|
| `--text-dim` | `#b3b3be` | `#52525b` |
| `--text-dimmer` | `#a8a8b4` | `#525262` |
| `--text-dimmest` | `#a0a0aa` | `#606070` |
| `--accent` | `#b09dfc` | `#5b21b6` |
| `--color-positive` | `#4ade80` | `#14532d` |
| `--color-negative` | `#fa8585` | `#991b1b` |
| `--color-warning` | `#fbbf24` | `#78350f` |

Il `.guest-banner-btn` usa testo scuro (`#111113`) in dark mode (accent chiaro) e bianco in light mode (accent scuro).

### Focus (SC 2.4.12, 2.4.13)
- Global `:focus-visible` con outline 3px `var(--accent)`, offset 2px
- Nessun `outline: none` in tutta la codebase
- `.category-card` senza `overflow: hidden` — le outline non vengono tagliate
- `.category-btn` ha `border-radius: 10px` proprio per il focus ring
- Elementi dentro `.items-grid` (overflow:hidden) usano `outline-offset: -3px` (inset)
- `scroll-padding-top: 140px` su `html` — evita che l'header fisso nasconda il focus

### Touch target (SC 2.5.5 — 44×44px)
I counter buttons sono 22×22px visivamente, ma il touch target è esteso a 44×44px tramite `.counter-btn::before { inset: -11px }`.

### Motion (SC 2.3.3)
`@media (prefers-reduced-motion: reduce)` disabilita tutte le transizioni e animazioni.

### Semantic HTML e ARIA
- `<header>` e `<main id="main-content">` al posto di `<div>`
- Skip link "Vai al contenuto principale" visibile solo da tastiera
- `role="navigation"` sulla tabs-bar
- `role="dialog" aria-modal aria-labelledby` sul modal accesso negato
- `aria-expanded` + `aria-controls` su tutti i bottoni accordion
- `aria-label` su tutti i bottoni icona (tema, reset, +/−, ×, ricerca)
- `aria-label` su tutti gli input (grammi, extra nome/kcal, search, obiettivo)
- `aria-live="polite" aria-atomic="true"` sul totale kcal
- `role="group" aria-label` sui counter di ogni alimento
- Emoji decorative con `aria-hidden="true"`
- Placeholder degli input in corsivo per distinguerli dal testo inserito

---

## Lista alimenti
La lista completa è in `app.jsx` nell'array `dietData` (circa riga 15).  
Ogni voce ha un campo `id` opaco a 6 caratteri che non va mai modificato.  
Le categorie e l'ordine degli alimenti sono modificabili liberamente.

---

## File nella repo
- `index.html` — scheletro HTML (head, root div, CDN scripts con SRI, CSP meta tag)
- `style.css` — tutto il CSS dell'app
- `app.jsx` — sorgente JSX React (logica, componenti, dietData) — **non caricato dal browser**
- `app.js` — output compilato da `app.jsx` — **questo è ciò che carica il browser**
- `build.js` — script di compilazione (`node build.js` compila app.jsx → app.js)
- `package.json` — devDependencies (@babel/core, @babel/preset-react) + script `build`
- `package-lock.json` — lockfile npm
- `manifest.json` — PWA manifest (icona 1024×1024, maskable)
- `logo.png` — icona app PWA (1024×1024, sfondo scuro #111113)
- `logo2.png` — logo testuale nell'header
- `no.gif` — gif mostrata quando un utente non autorizzato prova a loggarsi
- `.gitignore` — esclude `.claude/`, `CLAUDE.md`, `node_modules/`
- `CONTEXT.md` — questo file

---

## Idee discusse ma non implementate
- **Admin page** per gestire alimenti senza chiedere a Claude — ora fattibile grazie agli ID stabili, ma non prioritaria
- **Grafico nello storico** — scartato per ora
- **Nota giornaliera** — scartata per ora
- **Google Fit integration** — impossibile, API dismessa dal 30/06/2025

---

## Come lavorare su questo progetto
1. Modifiche al CSS → `style.css`
2. Modifiche alla logica/UI → `app.jsx`, poi **`npm run build`** per compilare in `app.js`
3. Aggiunta alimenti → in `app.jsx` nell'array `dietData`, con un nuovo ID opaco unico a 6 caratteri, poi `npm run build`
4. Push → `git add . && git commit -m "..." && git push` — solo quando Valerio lo chiede
5. GitHub Pages → si aggiorna in 1-2 minuti dal push
6. Per testare in locale → live server su `127.0.0.1:5500` (VS Code) o `localhost`

### Cache PWA mobile
`app.js` è caricato con query string di versione: `<script src="app.js?v=HASH">`. L'hash è i primi 8 caratteri del SHA-256 del contenuto di `app.js`, calcolato e aggiornato automaticamente da `build.js` ad ogni compilazione. Se `app.jsx` non cambia, l'hash rimane identico. `style.css` non ha bisogno del versioning.

### Sicurezza
- **SRI hash** su tutti gli script CDN (React 18.3.1, Firebase 10.12.2) — il browser rifiuta file manomessi
- **Content Security Policy** via meta tag: limita `script-src` a `self`, `unpkg.com`, `gstatic.com`, `apis.google.com`; `connect-src` alle API Firebase/Google; `object-src 'none'`; `base-uri 'self'`
- **Babel non più nel browser** — nessun compilatore runtime, superficie di attacco ridotta
- **Versioni CDN pinnate** — nessun aggiornamento silenzioso
