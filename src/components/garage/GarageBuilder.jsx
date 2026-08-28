import React, { useMemo, useState } from 'react';
import PartCarousel from './PartCarousel';
import StatsPreview from './StatsPreview';
import {
  PART_TYPES,
  createBeyblade,
  emptyLoadout,
  getPartsForSystem,
  getRequiredPartTypes,
  getSystemLabel,
  getSystemTypes,
  isLoadoutComplete,
  resolveLoadoutParts,
  sumStats,
  getVisibleStats,
} from '../../domain/parts';

export default function GarageBuilder({ catalog, onSaveBeyblade }) {
  const systems = Object.keys(catalog.systems || {});
  const initialSystem = systems[0] || '';
  const [loadout, setLoadout] = useState({ ...emptyLoadout(), system: initialSystem });
  const [name, setName] = useState('');

  const systemTypes = useMemo(() => getSystemTypes(catalog, loadout.system), [catalog, loadout.system]);
  const requiredTypes = useMemo(() => getRequiredPartTypes(catalog, loadout.system), [catalog, loadout.system]);
  const selectedParts = useMemo(() => resolveLoadoutParts(catalog, loadout, loadout.system), [catalog, loadout]);
  const totals = useMemo(() => getVisibleStats(sumStats(selectedParts)), [selectedParts]);

  const updateSystem = (system) => {
    const nextLoadout = { ...emptyLoadout(), system };
    const enabledTypes = getSystemTypes(catalog, system);
    const currentParts = loadout;

    for (const type of enabledTypes) {
      const candidateId = currentParts[type];
      const candidate = getPartsForSystem(catalog, type, system).find((part) => part.id === candidateId);
      if (candidate) nextLoadout[type] = candidate.id;
    }

    setLoadout(nextLoadout);
  };

  const updatePart = (type, value) => setLoadout((current) => ({ ...current, [type]: value }));

  const handleSave = () => {
    if (!isLoadoutComplete(catalog, loadout, loadout.system)) return;
    onSaveBeyblade(createBeyblade(catalog, loadout, name));
    setLoadout((current) => ({ ...emptyLoadout(), system: current.system }));
    setName('');
  };

  return (
    <section className="panel garage-panel">
      <div className="panel-title-row">
        <div>
          <span className="eyebrow">GARAGE</span>
          <h2>Componi il tuo Beyblade</h2>
          <p>Ogni sistema decide quali slot sono disponibili. Le frecce scorrono solo i pezzi presenti nella relativa anagrafica.</p>
        </div>
        <span className="schema-pill">V3.1</span>
      </div>

      <label className="system-selector">
        <span>System</span>
        <select value={loadout.system} onChange={(event) => updateSystem(event.target.value)}>
          {systems.map((system) => <option key={system} value={system}>{getSystemLabel(catalog, system)}</option>)}
        </select>
      </label>

      <div className="garage-stage">
        {systemTypes.map((type) => {
          const definition = catalog.systems[loadout.system]?.slots?.[type];
          const parts = getPartsForSystem(catalog, type, loadout.system);
          return (
            <PartCarousel
              key={`${loadout.system}-${type}`}
              type={type}
              parts={parts}
              value={loadout[type]}
              required={Boolean(definition?.required)}
              onChange={(value) => updatePart(type, value)}
            />
          );
        })}
      </div>

      <div className="garage-summary">
        <div className="preview-header">
          <div>
            <strong>{getSystemLabel(catalog, loadout.system)}</strong>
            <small>{selectedParts.length}/{systemTypes.length} parti selezionate • {requiredTypes.length} obbligatorie</small>
          </div>
        </div>
        <StatsPreview totals={totals} />
      </div>

      <label className="selector-field full-width">
        <span>Nome personalizzato</span>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="es. Roar Tyranno 3-60B" />
      </label>
      <button className="primary-button" onClick={handleSave} disabled={!isLoadoutComplete(catalog, loadout, loadout.system)}>Salva Beyblade</button>
    </section>
  );
}
