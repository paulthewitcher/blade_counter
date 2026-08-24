import React, { useMemo, useState } from 'react';
import PartSelector from './PartSelector';
import StatsPreview from './StatsPreview';
import { PART_TYPES, createCombo, emptyLoadout, resolveLoadoutParts, sumStats, getVisibleStats } from '../../domain/parts';

export default function GarageBuilder({ catalog, onSaveCombo }) {
  const [loadout, setLoadout] = useState(emptyLoadout());
  const [name, setName] = useState('');
  const selectedParts = useMemo(() => resolveLoadoutParts(catalog, loadout), [catalog, loadout]);
  const totals = useMemo(() => getVisibleStats(sumStats(selectedParts)), [selectedParts]);

  const updatePart = (type, value) => setLoadout((current) => ({ ...current, [type]: value }));

  const handleSave = () => {
    if (!selectedParts.length) return;
    onSaveCombo(createCombo(catalog, loadout, name));
    setName('');
  };

  return (
    <section className="panel">
      <div className="panel-title-row">
        <div>
          <h2>Garage</h2>
          <p>Componi un Blade. Le stats vengono sommate dinamicamente.</p>
        </div>
        <span className="schema-pill">4 PARTI</span>
      </div>
      <div className="selectors-grid">
        {PART_TYPES.map((type) => <PartSelector key={type} type={type} parts={catalog.parts[type] || []} value={loadout[type]} onChange={(value) => updatePart(type, value)} />)}
      </div>
      <label className="selector-field full-width">
        <span>Nome personalizzato</span>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="es. Dran Sword 3-60F" />
      </label>
      <div className="preview-header">
        <div><strong>Stats del Blade</strong><small>{selectedParts.length}/4 parti selezionate</small></div>
      </div>
      <StatsPreview totals={totals} />
      <button className="primary-button" onClick={handleSave} disabled={!selectedParts.length}>Salva combo</button>
    </section>
  );
}
