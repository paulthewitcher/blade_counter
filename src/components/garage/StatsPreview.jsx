
const labels = {
  attack: 'Attacco',
  defense: 'Difesa',
  stamina: 'Stamina',
  height: 'Altezza',
  burst: 'Burst',
  weight: 'Peso',
};

export default function StatsPreview({ totals }) {
  const visible = Object.entries(totals).filter(([, value]) => Math.abs(value) > 0.000001);
  if (!visible.length) return <div className="stats-empty">Nessuna statistica da mostrare.</div>;
  return (
    <div className="stats-grid">
      {visible.map(([key, value]) => (
        <div className="stat-card" key={key}>
          <span>{labels[key] || key.replaceAll('_', ' ')}</span>
          <strong>{Number.isInteger(value) ? value : value.toFixed(2)}</strong>
        </div>
      ))}
    </div>
  );
}
