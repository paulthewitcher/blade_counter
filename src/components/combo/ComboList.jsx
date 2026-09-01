import React, { useMemo, useState } from 'react';
import StatsPreview from '../garage/StatsPreview';
import { resolveLoadoutParts, getVisibleStats, sumStats } from '../../domain/parts';
import BeybladeThumbnail from '../shared/BeybladeThumbnail';

export default function ComboList({ catalog, beyblades, onToggleFavorite, onDelete, onEdit }) {
  const [pendingDelete, setPendingDelete] = useState(null);

  const cards = useMemo(() => beyblades.map((beyblade) => {
    const parts = resolveLoadoutParts(catalog, beyblade.parts);
    return { beyblade, parts, stats: getVisibleStats(sumStats(parts)) };
  }), [catalog, beyblades]);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    onDelete(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <>
      <div className="combo-list">
        {cards.length === 0 ? <div className="empty-card">Nessun Beyblade salvato.</div> : cards.map(({ beyblade, parts, stats }) => (
          <article className="combo-card" key={beyblade.id}>
            <div className="combo-card-top">
              <div className="combo-card-identity"><BeybladeThumbnail catalog={catalog} beyblade={beyblade} size={52} className="combo-card-thumbnail" /><div><h3>{beyblade.name}</h3><p>{parts.map((part) => part.name).join(' • ')}</p></div></div>
              <button className="icon-button" onClick={() => onToggleFavorite(beyblade.id)} aria-label={beyblade.isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}>{beyblade.isFavorite ? '★' : '☆'}</button>
            </div>
            <StatsPreview totals={stats} />
            <div className="combo-card-actions">
              <button type="button" className="edit-button" onClick={() => onEdit(beyblade)}>Modifica</button>
              <button type="button" className="danger-button" onClick={() => setPendingDelete(beyblade)}>Elimina</button>
            </div>
          </article>
        ))}
      </div>

      {pendingDelete && (
        <div className="modal-backdrop" role="presentation" onClick={() => setPendingDelete(null)}>
          <div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title" onClick={(event) => event.stopPropagation()}>
            <h3 id="delete-dialog-title">Sei sicuro?</h3>
            <p>Stai per eliminare <strong>{pendingDelete.name}</strong>.</p>
            <div className="confirm-actions">
              <button type="button" className="cancel-button" onClick={() => setPendingDelete(null)}>Annulla</button>
              <button type="button" className="confirm-delete-button" onClick={confirmDelete}>Elimina</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
