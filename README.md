# kcalTracker

A personal calorie tracking app — fast, minimal, no-bullshit.  
Built as a single HTML file. No installs, no accounts required, no tracking.

**[→ Open app](https://vlrprbttst.github.io/kcalTracker)**

---

## What it does

Track what you eat during the day from a personal food list, see your calorie total in real time, and keep a weekly history of how you're doing.

---

## Features

### Tracker
- Personal food list organized by category (carbs, meat, fish, veggies, drinks...)
- Tap **+** to add a portion — tap again to add another. Same food, multiple servings.
- Live calorie counter with a color-coded progress bar (green → yellow → red)
- Editable daily goal — tap the number to change it
- Auto-reset at midnight

### Free-form extras
- Eating something not on the list? Add it as an **extra** with a name and kcal value
- Extras count toward your daily total just like everything else

### Weekly history *(login required)*
- Log in with Google to unlock cloud sync and history
- Your data saves automatically in real time — works across devices and browsers
- History is organized by **week (Fri → Thu)** and **two-month periods**
- Each week shows total calories consumed vs. a 14,000 kcal weekly target
- Clear **deficit / surplus** indicator per week
- Current week is always visible; past weeks collapse into an accordion

### Dark / light theme
- Toggle between dark and light mode with the ☀️ / 🌙 button
- Preference is saved locally

---

## Stack

No framework, no bundler, no build step.

- **React 18** via CDN + Babel standalone
- **Firebase** — Google Auth + Firestore for cloud sync
- **GitHub Pages** for hosting

---

## Install as app

On mobile, open the link in Chrome (Android) or Safari (iOS) and use **"Add to Home Screen"** to install it as a standalone app with its own icon.

---

## Personal use

This app is built for personal use. Cloud sync and history are locked to a single authorized account. Anyone can use it as a day tracker without logging in — data stays local and resets daily.
