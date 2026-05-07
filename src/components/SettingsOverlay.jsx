import { minutesToTime, timeToMinutes } from '../schedule.js';

export default function SettingsOverlay({ open, setOpen, wizardOpen, draft, setDraft, onSave }) {
  if (!open) return null;
  return (
    <div
      className="settings-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Impostazioni"
      onKeyDown={e => { if (e.key === "Escape" && !wizardOpen) setOpen(false); }}
    >
      <div className="settings-header">
        <div className="settings-header-inner">
          <button className="settings-close" onClick={() => setOpen(false)} aria-label="Chiudi impostazioni" autoFocus>×</button>
          <span className="settings-title">Impostazioni</span>
        </div>
      </div>
      <div className="settings-body">
        <section className="settings-section">
          <h2 className="settings-section-title">Calorie giornaliere</h2>
          <p className="settings-section-desc">Quante calorie bruci in media ogni giorno (TDEE). Sarà il tuo obiettivo di default per i nuovi giorni. Puoi sempre modificarlo per un giorno specifico dallo Storico.</p>
          <div className="settings-field">
            <label className="settings-label" htmlFor="settings-default-kcal">Calorie al giorno</label>
            <input
              id="settings-default-kcal"
              className="settings-input"
              type="number"
              min="500"
              max="9999"
              value={draft.defaultKcal}
              onChange={e => setDraft(d => ({ ...d, defaultKcal: e.target.value }))}
            />
          </div>
        </section>

        <section className="settings-section">
          <h2 className="settings-section-title">Fasce orarie</h2>
          <p className="settings-section-desc">Orari di fine di ogni fascia pasto. Si applicano a tutto lo storico, anche ai giorni passati.</p>
          <div className="orari-tab settings-orari">
            <div className="orari-slot orari-slot-fixed">
              <span className="orari-label-text">Fuori Orario</span>
              <span className="orari-range-text">00:00 — 05:29</span>
            </div>
            {draft.schedule.map((slot, i) => {
              const startMin = i === 0 ? 330 : draft.schedule[i - 1].end + 1;
              const prevEnd = i === 0 ? 329 : draft.schedule[i - 1].end;
              const nextEnd = i === draft.schedule.length - 1 ? 1440 : draft.schedule[i + 1].end;
              return (
                <div key={slot.key} className="orari-slot">
                  <input
                    className="orari-label-input"
                    aria-label={`Nome fascia ${slot.label}`}
                    value={slot.label}
                    onChange={e => {
                      const newSchedule = draft.schedule.map((s, j) => j === i ? { ...s, label: e.target.value } : s);
                      setDraft(d => ({ ...d, schedule: newSchedule }));
                    }}
                  />
                  <div className="orari-times">
                    <span className="orari-start">{minutesToTime(startMin)}</span>
                    <span className="orari-sep">—</span>
                    <input
                      key={`time-${slot.key}-${slot.end}`}
                      type="text"
                      inputMode="numeric"
                      placeholder="HH:MM"
                      className="orari-time-input"
                      aria-label={`Fine fascia ${slot.label}`}
                      defaultValue={minutesToTime(slot.end)}
                      onBlur={e => {
                        const raw = e.target.value.trim();
                        if (!raw.match(/^\d{1,2}:\d{2}$/)) { e.target.value = minutesToTime(slot.end); return; }
                        const newEnd = timeToMinutes(raw);
                        if (isNaN(newEnd) || newEnd <= prevEnd || newEnd >= nextEnd) { e.target.value = minutesToTime(slot.end); return; }
                        const newSchedule = draft.schedule.map((s, j) => j === i ? { ...s, end: newEnd } : s);
                        setDraft(d => ({ ...d, schedule: newSchedule }));
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="orari-slot orari-slot-fixed">
              <span className="orari-label-text">Fuori Orario</span>
              <span className="orari-range-text">{minutesToTime(draft.schedule[draft.schedule.length - 1].end + 1)} — 23:59</span>
            </div>
          </div>
        </section>
      </div>
      <div className="settings-footer">
        <div className="settings-footer-inner">
          <button className="settings-save-btn" onClick={onSave}>Salva</button>
        </div>
      </div>
    </div>
  );
}
