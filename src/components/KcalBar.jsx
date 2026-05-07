export default function KcalBar({ kcal, max }) {
  const pct = Math.min((kcal / max) * 100, 100);
  const color = kcal > 400 ? "var(--color-negative)" : kcal > 250 ? "var(--color-warning)" : "var(--color-positive)";
  return (
    <div className="bar-mini">
      <div className="bar-mini-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
