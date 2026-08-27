import React, { useMemo, useState } from 'react';
import PartSelector from './PartSelector';
import StatsPreview from './StatsPreview';
import {
  PART_TYPES,
  createBeyblade,
  emptyLoadout,
  resolveLoadoutParts,
  sumStats,
  getVisibleStats,
  isLoadoutComplete,
} from '../../domain/parts';

export default function GarageBuilder({ catalog, onSaveBeyblade }) {
  const [loadout, setLoadout] = useState(emptyLoadout());
  const [name, setName] = useState('');
  const selectedParts = useMemo(() => resolveLoadoutParts(catalog, loadout), [catalog, loadout]);
  const totals = useMemo(() => getVisibleStats(sumStats(selectedParts)), [selectedParts]);

  const updatePart = (type, value) => setLoadout((current) => ({ ...current, [type]: value }));

  const handleSave = () => {
    if (!isLoadoutComplete(loadout)) return;
    onSaveBeyblade(createBeyblade(catalog, loadout, name));
    setName('');
  };

  return (
    <section className="panel">
      <div className="panel-title-row">
        <div>
          <h2>Garage</h2>
          <p>Componi un Beyblade da 3 a 5 parti. Le stats vengono sommate dinamicamente.</p>
        </div>
        <span className="schema-pill">3–5 PARTI</span>
      </div>
      <div className="selectors-grid">
        {PART_TYPES.map((type) => (
          <PartSelector key={type} type={type} parts={catalog.parts[type] || []} value={loadout[type]} onChange={(value) => updatePart(type, value)} />
        ))}
      </div>
      <label className="selector-field full-width">
        <span>Nome personalizzato</span>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="es. Roar Tyranno 3-60B" />
      </label>
      <div className="preview-header">
        <div><strong>Stats del Beyblade</strong><small>{selectedParts.length}/5 parti selezionate</small></div>
      </div>
      <StatsPreview totals={totals} />
      <button className="primary-button" onClick={handleSave} disabled={!isLoadoutComplete(loadout)}>Salva Beyblade</button>
    </section>
  );
}
