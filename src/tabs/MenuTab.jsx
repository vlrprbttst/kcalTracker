import { groupLogByMeal, groupEntries, minutesToTime } from '../schedule.js';

export default function MenuTab({ log, schedule }) {
  const alcolLog = log.filter(e => e.category === 'Alcol');
  const foodLog = log.filter(e => e.category !== 'Alcol');
  return (
    <div className="menu-tab">
      {groupLogByMeal(foodLog, schedule).map(({ key, label, items }) => {
        const slotTotal = items.reduce((s, e) => s + e.kcal, 0);
        return (
          <div key={key} className="meal-group">
            <div className="meal-group-header">
              <span className="meal-group-label">{label}</span>
              <span className="meal-group-total">{slotTotal} kcal</span>
            </div>
            {groupEntries(items).map((entry, i) => (
              <div key={i} className="meal-entry">
                <span className="meal-entry-name">{entry.name}{entry.grams > 0 ? ` ${entry.grams}g` : ''}{entry.count > 1 ? ` ×${entry.count}` : ''}</span>
                <span className="meal-entry-kcal">{entry.totalKcal > 0 ? `${entry.totalKcal} kcal` : '–'}</span>
              </div>
            ))}
          </div>
        );
      })}
      {alcolLog.length > 0 && (
        <div className="meal-group meal-group-extra">
          <div className="meal-group-header">
            <span className="meal-group-label">🍺 Extra</span>
            <span className="meal-group-total">{alcolLog.reduce((s, e) => s + e.kcal, 0)} kcal</span>
          </div>
          {groupEntries(alcolLog).map((entry, i) => (
            <div key={i} className="meal-entry">
              <span className="meal-entry-name">{entry.name}{entry.count > 1 ? ` ×${entry.count}` : ''}</span>
              <span className="meal-entry-kcal">{entry.totalKcal} kcal</span>
            </div>
          ))}
        </div>
      )}
      <div className="menu-legend">
        <div className="menu-legend-title">Fasce orarie</div>
        <div className="menu-legend-row"><span>Fuori Orario</span><span>00:00 – 05:29</span></div>
        {schedule.map((slot, i) => {
          const startMin = i === 0 ? 330 : schedule[i - 1].end + 1;
          return (
            <div key={slot.key} className="menu-legend-row">
              <span>{slot.label}</span>
              <span>{minutesToTime(startMin)} – {minutesToTime(slot.end)}</span>
            </div>
          );
        })}
        <div className="menu-legend-row"><span>Fuori Orario</span><span>{minutesToTime(schedule[schedule.length - 1].end + 1)} – 23:59</span></div>
      </div>
    </div>
  );
}
