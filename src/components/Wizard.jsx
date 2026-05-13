const { useState, useEffect } = React;

export const WIZARD_STEPS = [
  {
    tab: null, selector: null,
    title: "Benvenuto in kcalTracker",
    text: "Questa guida ti mostra le funzionalità principali dell'app. Premi Avanti per iniziare.",
  },
  {
    tab: null, openProfileMenu: true, selector: ".profile-menu-wrap", selectorEnd: ".profile-dropdown",
    title: "Menu profilo",
    text: "Clicca sull'avatar in alto a destra per aprire questo menu: trovi le impostazioni dell'app e il pulsante per uscire dall'account.",
  },
  {
    tab: null, selector: ".kcal-row", selectorEnd: ".progress-track",
    title: "Il contatore calorie",
    text: "Il numero grande sono le kcal assunte oggi. A destra il tuo obiettivo; la differenza ti dice quante kcal ti rimangono (o di quanto hai sforato). La barra sotto si riempie man mano che mangi: diventa gialla avvicinandoti all'obiettivo e rossa se lo superi.",
  },
  {
    tab: "oggi", selector: ".category-card",
    title: "Tracker calorie",
    text: "Gli alimenti sono divisi per categoria. Apri un accordion e usa + e − per registrare le porzioni. Il totale si aggiorna in tempo reale.",
  },
  {
    tab: "oggi", selector: ".tracker-toolbar",
    title: "I controlli del tracker",
    text: "❌ reset azzera tutte le calorie del giorno corrente. A sinistra, 'chiudi tutto' chiude l'accordion aperto — compare solo quando ce n'è uno aperto.",
  },
  {
    tab: "oggi", selector: ".category-card", last: true,
    title: "Alimenti extra",
    text: "Hai mangiato qualcosa fuori dalla lista? Aggiungilo con nome e calorie. Viene sommato al totale della giornata.",
  },
  {
    tab: "alimenti", selector: "[data-wizard='alimenti-tab']",
    title: "Gestisci i tuoi alimenti",
    text: "Dal tab Alimenti puoi costruire la tua lista personalizzata: categorie, porzioni e calorie tutte configurabili.",
  },
  {
    tab: "alimenti", selector: ".admin-add-cat-btn",
    title: "Aggiungi categorie e alimenti",
    text: "Crea le tue categorie e aggiungi alimenti con porzioni e calorie. Puoi trascinare le righe per riordinare.",
  },
  {
    tab: "storico", selector: "[data-wizard='storico-tab']",
    title: "Storico settimanale",
    text: "Qui trovi il riepilogo di ogni settimana: calorie consumate, deficit o surplus e una proiezione di fine settimana. Si popola automaticamente giorno dopo giorno.",
  },
  {
    tab: null, openSettings: true, selector: ".settings-theme-toggle",
    title: "Tema",
    text: "Passa dal tema scuro a quello chiaro con un tap. La preferenza viene salvata automaticamente.",
  },
  {
    tab: null, openSettings: true, selector: "[data-wizard='settings-kcal']",
    title: "Calorie giornaliere",
    text: "Qui imposti quante calorie bruci mediamente ogni giorno (il tuo TDEE). Sarà l'obiettivo di default per ogni nuovo giorno — puoi sempre modificarlo per un giorno specifico dallo Storico.",
  },
  {
    tab: null, openSettings: true, selector: "[data-wizard='settings-orari']", last: true,
    title: "Fasce orarie",
    text: "Personalizza gli orari di fine di ogni fascia pasto. L'app li usa per raggruppare gli alimenti nel tab Menu e nello Storico. Le modifiche si applicano a tutto lo storico.",
  },
];

export default function Wizard({ open, step, setStep, setOpen, setActiveTab, activeTab }) {
  const [spotlightRect, setSpotlightRect] = useState(null);

  useEffect(() => {
    if (!open) { setSpotlightRect(null); return; }
    const s = WIZARD_STEPS[step];
    if (!s.selector) { setSpotlightRect(null); return; }
    const t = setTimeout(() => {
      const els = document.querySelectorAll(s.selector);
      const el = s.last ? els[els.length - 1] : els[0];
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'instant' });
        requestAnimationFrame(() => requestAnimationFrame(() => {
          const r = el.getBoundingClientRect();
          const el2 = s.selectorEnd ? document.querySelector(s.selectorEnd) : null;
          if (el2) {
            const r2 = el2.getBoundingClientRect();
            const top = Math.min(r.top, r2.top) - 8;
            const left = Math.min(r.left, r2.left) - 8;
            const right = Math.max(r.right, r2.right) + 8;
            const bottom = Math.max(r.bottom, r2.bottom) + 8;
            setSpotlightRect({ top, left, width: right - left, height: bottom - top });
          } else {
            setSpotlightRect({ top: r.top - 8, left: r.left - 8, width: r.width + 16, height: r.height + 16 });
          }
        }));
      }
    }, 400);
    return () => clearTimeout(t);
  }, [open, step, activeTab]);

  if (!open) return null;

  const tooltipStyle = (() => {
    const TOOLTIP_H = 240, MARGIN = 12;
    const H = window.innerHeight;
    if (!spotlightRect) return { top: H / 2 - TOOLTIP_H / 2, left: "50%", transform: "translateX(-50%)" };
    const belowTop = spotlightRect.top + spotlightRect.height + MARGIN;
    const aboveTop = spotlightRect.top - TOOLTIP_H - MARGIN;
    const fitsBelow = belowTop + TOOLTIP_H + MARGIN <= H;
    const fitsAbove = aboveTop >= MARGIN;
    let topPx;
    if (fitsBelow) topPx = belowTop;
    else if (fitsAbove) topPx = aboveTop;
    else topPx = Math.min(Math.max(belowTop, MARGIN), H - TOOLTIP_H - MARGIN);
    return { top: topPx, left: "50%", transform: "translateX(-50%)" };
  })();

  const W = window.innerWidth, H = window.innerHeight;
  const eff = spotlightRect ?? { top: H / 2, left: W / 2, width: 0, height: 0 };
  const { top: sT, left: sL, width: sW, height: sH } = eff;
  const sR = sL + sW, sB = sT + sH;

  return (
    <>
      <div className="wiz-mask" style={{ top: 0, left: 0, width: W, height: sT }} />
      <div className="wiz-mask" style={{ top: sT, left: 0, width: sL, height: sH }} />
      <div className="wiz-mask" style={{ top: sT, left: sR, width: Math.max(0, W - sR), height: sH }} />
      <div className="wiz-mask" style={{ top: sB, left: 0, width: W, height: Math.max(0, H - sB) }} />
      {spotlightRect && (
        <div className="wizard-spotlight-border" style={{ top: sT, left: sL, width: sW, height: sH }} />
      )}
      <div className="wizard-tooltip" style={tooltipStyle} role="dialog" aria-modal="true" aria-labelledby="wizard-title">
        <button className="wizard-close" onClick={() => setOpen(false)} aria-label="Chiudi guida">×</button>
        <div className="wizard-step-body">
          <div className="wizard-step-indicator">{step + 1} / {WIZARD_STEPS.length}</div>
          <div id="wizard-title" className="wizard-title">{WIZARD_STEPS[step].title}</div>
          <div className="wizard-text">{WIZARD_STEPS[step].text}</div>
          <div className="wizard-actions">
            <div className="wizard-actions-left">
              {step > 0 && (
                <button className="wizard-btn-back" onClick={() => setStep(s => s - 1)}>← Indietro</button>
              )}
            </div>
            <div className="wizard-actions-right">
              {step < WIZARD_STEPS.length - 1 ? (
                <>
                  <button className="wizard-btn-skip" onClick={() => setOpen(false)}>Salta</button>
                  <button className="wizard-btn-next" onClick={() => setStep(s => s + 1)}>Avanti →</button>
                </>
              ) : (
                <button className="wizard-btn-next" onClick={() => { setOpen(false); setActiveTab("oggi"); }}>Fatto!</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
