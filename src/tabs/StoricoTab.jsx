import { ACTIVE_DAY } from '../utils.js';
import { getBimesterOf, getWeekStart, getMonthName, formatShortDate, formatDate, addBimesters, bimesterLabel, groupByWeek } from '../history.js';
import { groupLogByMeal, groupEntries } from '../schedule.js';

export default function StoricoTab({
  historyLoading, history, currentPage, setCurrentPage,
  openWeeks, toggleWeek,
  editingDayTarget, setEditingDayTarget, saveDayTarget,
  target, totalKcal, schedule,
}) {
  if (historyLoading) return <div className="history-empty">Caricamento...</div>;

  const { year: curYear, bim: curBim } = getBimesterOf(ACTIVE_DAY());
  const currentWeekStart = getWeekStart(ACTIVE_DAY());
  const pageHistory = history.filter(d => {
    const { year, bim } = getBimesterOf(d.date);
    return year === currentPage.year && bim === currentPage.bim;
  });
  const weeks = groupByWeek(pageHistory);
  const hasPrev = history.some(d => {
    const { year, bim } = getBimesterOf(d.date);
    return year < currentPage.year || (year === currentPage.year && bim < currentPage.bim);
  });
  const isCurrentPage = currentPage.year === curYear && currentPage.bim === curBim;
  let lastMonth = null;
  return (
    <>
      <div className="bimester-nav">
        <button className="bimester-btn" onClick={() => setCurrentPage(p => addBimesters(p.year, p.bim, -1))} disabled={!hasPrev}>← prec</button>
        <span className="bimester-label">{bimesterLabel(currentPage.year, currentPage.bim)}</span>
        <button className="bimester-btn" onClick={() => setCurrentPage(p => addBimesters(p.year, p.bim, 1))} disabled={isCurrentPage}>succ →</button>
      </div>
      {weeks.length === 0 ? (
        <div className="history-empty">Nessun dato in questo periodo.</div>
      ) : weeks.map((week, i) => {
        const isCurrentWeek = week.weekStart === currentWeekStart;
        const isOpen = isCurrentWeek || openWeeks.has(week.weekStart);
        const weekMonth = getMonthName(week.weekStart);
        const showMonthHeader = weekMonth !== lastMonth;
        lastMonth = weekMonth;
        return (
          <React.Fragment key={i}>
            {showMonthHeader && <div className="month-label">{weekMonth}</div>}
            <div className="week-card">
              {isCurrentWeek ? (
                <>
                  <div className="week-current-header">
                    Settimana in corso · {formatShortDate(week.weekStart)} → {formatShortDate(week.weekEndStr)}
                  </div>
                  {(() => {
                    const activeDay = ACTIVE_DAY();
                    const d = new Date(activeDay + "T12:00:00");
                    const daysFromFriday = (d.getDay() + 2) % 7;
                    if (daysFromFriday < 3) return null;
                    const weekKcal = week.days.reduce((s, day) => s + (day.totalKcal || 0), 0);
                    const daysAfterToday = 6 - daysFromFriday;
                    const projectedTotal = weekKcal + Math.max(totalKcal, target) + target * daysAfterToday;
                    const pastDaysTarget = week.days.reduce((s, day) => s + (day.target || 2000), 0);
                    const weeklyProjectedTarget = pastDaysTarget + target + target * daysAfterToday;
                    const projectedSurplus = projectedTotal - weeklyProjectedTarget;
                    const weightDelta = (Math.abs(projectedSurplus) / 7700).toFixed(2);
                    if (projectedSurplus > 0) return (
                      <div className="surplus-snackbar">
                        <span className="surplus-snackbar-icon">⚠️</span>
                        <div className="surplus-snackbar-text">
                          <strong>Surplus ad oggi: +{projectedSurplus.toLocaleString("it-IT")} kcal</strong>
                          <span>A fine settimana potresti aumentare di circa {weightDelta} kg</span>
                        </div>
                      </div>
                    );
                    return (
                      <div className="deficit-snackbar">
                        <span className="surplus-snackbar-icon">✅</span>
                        <div className="surplus-snackbar-text">
                          <strong>Deficit ad oggi: {projectedSurplus.toLocaleString("it-IT")} kcal</strong>
                          <span>A fine settimana potresti perdere circa {weightDelta} kg</span>
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (() => {
                const incomplete = week.days.length < 7;
                return (
                  <div className={`week-accordion-header${incomplete ? " incomplete" : ""}`} onClick={() => toggleWeek(week.weekStart)}>
                    <div className="week-acc-left">
                      <span className="week-acc-dates">
                        {incomplete && "⚠️ "}{formatShortDate(week.weekStart)} → {formatShortDate(week.weekEndStr)}
                        <span style={{ fontWeight: 400, color: "var(--text-dimmer)", marginLeft: 6 }}>{week.days.length}/7 giorni</span>
                      </span>
                    </div>
                    {!incomplete && (
                      <span className={`week-acc-balance ${week.balance <= 0 ? "deficit" : "surplus"}`}>
                        {week.balance <= 0
                          ? `✅ Deficit ${Math.abs(week.balance).toLocaleString("it-IT")} kcal`
                          : `⚠️ Surplus ${week.balance.toLocaleString("it-IT")} kcal`}
                      </span>
                    )}
                    <span className={`week-acc-arrow${isOpen ? " open" : ""}`}>▼</span>
                  </div>
                );
              })()}
              {isOpen && (
                <>
                  {week.days.map((day, j) => (
                    <div key={j} className="history-day" style={{ borderRadius: 0, border: "none", borderTop: j > 0 ? "1px solid var(--border)" : "none" }}>
                      <div className="history-day-header">
                        <span className="history-day-date">{formatDate(day.date)}</span>
                        <span className="history-day-kcal" style={{ color: day.totalKcal > day.target ? "var(--color-negative)" : "var(--color-positive)" }}>
                          {day.totalKcal} kcal
                          {(isCurrentWeek || week.days.length === 7) ? (
                            editingDayTarget?.date === day.date ? (
                              <input
                                className="history-day-target-input"
                                type="number"
                                value={editingDayTarget.draft}
                                onChange={e => setEditingDayTarget(prev => ({ ...prev, draft: e.target.value }))}
                                onBlur={() => saveDayTarget(day.date)}
                                onKeyDown={e => { if (e.key === "Enter") saveDayTarget(day.date); if (e.key === "Escape") setEditingDayTarget(null); }}
                                autoFocus
                                aria-label={`Obiettivo calorico per ${day.date}`}
                              />
                            ) : (
                              <span className="history-day-target" onClick={() => setEditingDayTarget({ date: day.date, draft: String(day.target || 2000) })} role="button" tabIndex={0} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setEditingDayTarget({ date: day.date, draft: String(day.target || 2000) }); }} aria-label={`Obiettivo ${day.date}: ${day.target || 2000} kcal. Premi per modificare`}>di {day.target || 2000}</span>
                            )
                          ) : (
                            <span className="history-day-target" style={{ cursor: "default", borderBottom: "none" }}>di {day.target || 2000}</span>
                          )}
                        </span>
                      </div>
                      {day.log && day.log.length > 0 ? (() => {
                        const alcolLog = day.log.filter(e => e.category === 'Alcol');
                        const foodLog = day.log.filter(e => e.category !== 'Alcol');
                        return (
                          <div className="history-log-groups">
                            {groupLogByMeal(foodLog, schedule).map(({ key, label, items }) => (
                              <div key={key} className="history-log-group">
                                <span className="history-log-label">{label}: </span>
                                <span className="history-log-items">{groupEntries(items).map(e => e.name + (e.grams > 0 ? ` ${e.grams}g` : '') + (e.count > 1 ? ` ×${e.count}` : '')).join(', ')}</span>
                              </div>
                            ))}
                            {alcolLog.length > 0 && (
                              <div className="history-log-group">
                                <span className="history-log-label">🍺 Extra: </span>
                                <span className="history-log-items">{groupEntries(alcolLog).map(e => e.name + (e.count > 1 ? ` ×${e.count}` : '')).join(', ')}</span>
                              </div>
                            )}
                          </div>
                        );
                      })() : day.items && day.items.length > 0 ? (
                        <div className="history-items">{day.items.join(" · ")}</div>
                      ) : null}
                    </div>
                  ))}
                  <div className="week-summary">
                    <div className="week-summary-row">
                      <span>Media settimanale</span>
                      <span>{(isCurrentWeek
                        ? week.days.reduce((s, d) => s + (d.target || 2000), 0) + target * (7 - week.days.length)
                        : week.days.length < 7 ? 14000 : week.weeklyTarget).toLocaleString("it-IT")} kcal</span>
                    </div>
                    <div className="week-summary-row">
                      <span>Calorie assunte</span>
                      <span>{week.totalConsumed.toLocaleString("it-IT")} kcal</span>
                    </div>
                    {!isCurrentWeek && week.days.length < 7 && (
                      <div className="week-incomplete-note">
                        ⚠️ Dati parziali — {7 - week.days.length} {7 - week.days.length === 1 ? "giorno non tracciato" : "giorni non tracciati"}. Il balance potrebbe non essere accurato.
                      </div>
                    )}
                    {(!isCurrentWeek || ACTIVE_DAY() === week.weekEndStr) && week.days.length === 7 && (
                      <div className="week-balance">
                        {week.balance <= 0
                          ? <span className="week-weight-delta deficit">🎉 potresti aver perso circa {(Math.abs(week.balance) / 7700).toFixed(2)} kg</span>
                          : <span className="week-weight-delta surplus">⚠️ potresti aver preso circa {(Math.abs(week.balance) / 7700).toFixed(2)} kg</span>}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
}
