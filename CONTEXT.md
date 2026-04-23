# kcalTracker — Contesto completo del progetto

## Cos'è
App personale per tracciare le calorie giornaliere. Pubblicata su GitHub Pages. Sviluppata con Valerio Pierbattista (omegaiori@gmail.com).

**Live:** https://vlrprbttst.github.io/kcalTracker  
**Repo:** https://github.com/vlrprbttst/kcalTracker  
**File principali:** `index.html` (scheletro HTML), `style.css` (tutto il CSS), `app.jsx` (tutto il JS/JSX React)  
**File di riferimento alimenti:** la lista alimenti è in `app.jsx` nell'array `dietData`. Il file `dieta.jsx` è stato eliminato.

---

## Stack tecnico
- React 18 via CDN (Babel standalone) — niente npm, niente bundler
- Firebase (compat SDK via CDN):
  - **Authentication** — Google OAuth
  - **Firestore** — salvataggio dati giornalieri e storico
- GitHub Pages per l'hosting (branch `master`, aggiornamento automatico ad ogni push)
- Dark/light theme con CSS variables

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
      2026-04-22: {
        counts: { "0_1": 2, "3_0": 1, ... },  // indici categoria_alimento: quantità
        extras: [{ name: "kebab", kcal: 650 }],
        target: 1960,
        totalKcal: 1450,
        items: ["Basmati cotto ×2", "Uova strapazzate", "kebab (extra, 650 kcal)"],
        date: "2026-04-22",
        updatedAt: timestamp
      }
```

I `counts` usano indici numerici `ci_ii` (categoria_alimento). Lo storico usa `totalKcal` e `items` (stringhe leggibili) — non usa `counts`, quindi è immune a cambi di indici futuri.

---

## Regole importanti

### CRITICO — Aggiunta alimenti
**Aggiungere sempre nuovi alimenti IN FONDO alla loro categoria**, mai in mezzo, mai eliminare voci esistenti. I `counts` salvati su Firestore usano indici numerici: spostare o eliminare un alimento corrompe lo storico.

### Git
Usare sempre `git add .` quando si committa (non specificare file singoli — potrebbero esserci altri file modificati come `logo.png`).

### Push
**Non pushare mai autonomamente.** Aspettare che Valerio lo dica esplicitamente.

---

## Funzionalità implementate

### Tracker (tab "Oggi")
- Lista alimenti divisa in categorie, ognuna è un accordion
- Layout interno accordion: **CSS Grid** (`1fr auto 56px 84px`) — nome flessibile, porzione auto, kcal e counter fissi
- Contatore +/− per porzione (supporta stessa voce più volte)
- Bottoni +/− sempre visibili: il − è opaco (75%) e non cliccabile finché qty = 0
- Totale kcal live con barra di progresso colorata (verde/giallo/rosso)
- Goal calorico editabile cliccando il numero nell'header (default: 2000 kcal)
- Shake animation quando si supera il target per la prima volta
- Bottone "chiudi tutto" per chiudere tutti gli accordion aperti
- Feedback tattile (vibrazione) al tap su + (funziona solo se la vibrazione del telefono è attiva)
- Reset manuale con conferma
- Legenda colori barre kcal in fondo alla lista (pallini CSS, stessi colori delle barre: verde <250, giallo 250–400, rosso >400)
- Logo testuale sostituito con `logo2.png` nell'header

### Extra (campo libero)
- Card in fondo alla lista con due input: nome alimento + kcal
- Gli extra appaiono come lista con bottone × per rimuoverli
- Si sommano al totale kcal

### Autenticazione
- Bottone "Accedi" nell'header (Google OAuth)
- Solo l'ALLOWED_UID può loggarsi — chiunque altro vede la gif `no.gif` + messaggio "non puoi loggarti..."
- Da loggato: sync Firestore in tempo reale (debounced 1.5s)
- Da non loggato: localStorage, nessuno storico, reset automatico al cambio giorno
- Al logout: counts e extras si azzerano

### Storico (tab "Storico", solo loggati)
- **Paginazione bimestrale** (Gen-Feb, Mar-Apr, ecc.) con nav ← prec / succ →
- **Header mese** per ogni gruppo di settimane
- **Settimana in corso**: card sempre aperta, non chiudibile, header viola
- **Settimane passate**: accordion chiuso con date + deficit/surplus nell'header; cliccabile per aprire
- Settimane dal venerdì al giovedì (Valerio si pesa il venerdì)
- **Obiettivo settimana: 14.000 kcal** (7 giorni × 2000 kcal — fisso)
- Verde = deficit, rosso = surplus
- **Balance deficit/surplus** visibile solo a settimana completa (7/7 giorni tracciati) o il giovedì — non durante la settimana in corso
- **Settimane incomplete**: accordion giallino con ⚠️, conteggio `N/7 giorni` nell'header, nota "dati parziali" nel riepilogo aperto

### Tema
- Toggle ☀️/🌙 nell'header
- Preferenza salvata in localStorage
- Transizione animata (0.25s)
- CSS variables su `body` / `body.light`
- `--color-positive` e `--color-negative` cambiano con il tema: dark `#4ade80`/`#f87171`, light `#16a34a`/`#dc2626` (WCAG AA)

---

## Lista alimenti
La lista completa è in `index.html` nel array `dietData` (circa riga 495).  
Le categorie sono ordinate per indice `ci` (0→12), gli alimenti per indice `ii` dentro ogni categoria.  
**Non modificare mai l'ordine o eliminare voci — leggere la sezione "Regole importanti" sopra.**

---

## File nella repo
- `index.html` — scheletro HTML (head, root div, link a CSS e JSX)
- `style.css` — tutto il CSS dell'app
- `app.jsx` — tutto il JS/JSX React (logica, componenti, dietData)
- `manifest.json` — PWA manifest (icona 1024×1024, maskable)
- `logo.png` — icona app PWA (1024×1024, sfondo scuro #111113)
- `logo2.png` — logo testuale nell'header
- `no.gif` — gif mostrata quando un utente non autorizzato prova a loggarsi
- `.gitignore` — esclude `.claude/`
- `CONTEXT.md` — questo file

---

## Idee discusse ma non implementate
- **Admin page** per gestire alimenti senza chiedere a Claude — richiede refactor degli indici (da numerici a ID stabili) + migrazione Firestore. Non ancora fatto.
- **Grafico nello storico** — scartato per ora
- **Nota giornaliera** — scartata per ora
- **Google Fit integration** — impossibile, API dismessa dal 30/06/2025

---

## Come lavorare su questo progetto
1. Modifiche al CSS → `style.css`
2. Modifiche alla logica/UI → `app.jsx`
3. Aggiunta alimenti → sempre in fondo alla categoria in `app.jsx` nell'array `dietData`
3. Push → `git add . && git commit -m "..." && git push` — solo quando Valerio lo chiede
4. GitHub Pages → si aggiorna in 1-2 minuti dal push
5. Per testare in locale → live server su `127.0.0.1:5500` (VS Code) o `localhost`
