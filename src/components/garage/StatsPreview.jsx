import { STAT_DEFINITIONS, STAT_KEYS } from '../../config/stats.js';

export default function StatsPreview({ totals }) {
  const visible = STAT_KEYS
    .map((key) => [key, Number(totals?.[key] ?? 0)])
    .filter(([, value]) => Math.abs(value) > 0.000001);

  if (!visible.length) return <div className="stats-empty">Nessuna statistica da mostrare.</div>;

  return (
    <div className="stats-grid">
      {visible.map(([key, value]) => (
        <div className="stat-card" key={key}>
          <span>{STAT_DEFINITIONS[key].label}</span>
          <strong>{Number.isInteger(value) ? value : value.toFixed(2)}</strong>
        </div>
      ))}
    </div>
  );
}
