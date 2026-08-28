import React, { useMemo } from 'react';
import StatsPreview from '../garage/StatsPreview';
import { resolveLoadoutParts, getVisibleStats, sumStats } from '../../domain/parts';

export default function ComboList({ catalog, beyblades, onToggleFavorite, onDelete }) {
  const cards = useMemo(() => beyblades.map((beyblade) => {
    const parts = resolveLoadoutParts(catalog, beyblade.parts, beyblade.system);
    return { beyblade, parts, stats: getVisibleStats(sumStats(parts)) };
  }), [catalog, beyblades]);

  return (
    <div className="combo-list">
      {cards.length === 0 ? <div className="empty-card">Nessun Beyblade salvato.</div> : cards.map(({ beyblade, parts, stats }) => (
        <article className="combo-card" key={beyblade.id}>
          <div className="combo-card-top">
            <div><h3>{beyblade.name}</h3><p>{parts.map((part) => part.name).join(' • ')}</p></div>
            <button className="icon-button" onClick={() => onToggleFavorite(beyblade.id)} aria-label="Preferito">{beyblade.favorite ? '★' : '☆'}</button>
          </div>
          <StatsPreview totals={stats} />
          <button className="danger-button" onClick={() => onDelete(beyblade.id)}>Rimuovi</button>
        </article>
      ))}
    </div>
  );
}
