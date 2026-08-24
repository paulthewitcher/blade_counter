import React, { useMemo } from 'react';
import StatsPreview from '../garage/StatsPreview';
import { resolveLoadoutParts, getVisibleStats, sumStats } from '../../domain/parts';

export default function ComboList({ catalog, combos, onToggleFavorite, onDelete }) {
  const cards = useMemo(() => combos.map((combo) => {
    const parts = resolveLoadoutParts(catalog, combo.parts);
    return { combo, parts, stats: getVisibleStats(sumStats(parts)) };
  }), [catalog, combos]);

  return (
    <div className="combo-list">
      {cards.length === 0 ? <div className="empty-card">Nessuna combo salvata.</div> : cards.map(({ combo, parts, stats }) => (
        <article className="combo-card" key={combo.id}>
          <div className="combo-card-top">
            <div><h3>{combo.name}</h3><p>{parts.map((part) => part.name).join(' • ')}</p></div>
            <button className="icon-button" onClick={() => onToggleFavorite(combo.id)} aria-label="Preferita">{combo.favorite ? '★' : '☆'}</button>
          </div>
          <StatsPreview totals={stats} />
          <button className="danger-button" onClick={() => onDelete(combo.id)}>Rimuovi</button>
        </article>
      ))}
    </div>
  );
}
