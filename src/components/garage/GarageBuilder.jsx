import React, { useEffect, useMemo, useState } from 'react';
import PartSelector from './PartSelector';
import StatsPreview from './StatsPreview';
import { PART_TYPES } from '../../config/partDefinitions.js';
import { createBeyblade, emptyLoadout, resolveLoadoutParts, sumStats, getVisibleStats, isLoadoutComplete } from '../../domain/parts.js';
import { getEnabledPartTypes, getPartsForSystem, getSystem } from '../../domain/systems.js';

export default function GarageBuilder({ catalog, onSaveBeyblade, editingBeyblade, onCancelEdit }) {
  const [systemId, setSystemId] = useState('');
  const [loadout, setLoadout] = useState(emptyLoadout());
  const [name, setName] = useState('');

  const system = getSystem(catalog, systemId);
  const enabledTypes = useMemo(() => getEnabledPartTypes(system), [system]);
  const selectedParts = useMemo(() => resolveLoadoutParts(catalog, loadout), [catalog, loadout]);
  const totals = useMemo(() => getVisibleStats(sumStats(selectedParts)), [selectedParts]);

  useEffect(() => {
    if (!editingBeyblade) return;
    setSystemId(editingBeyblade.system || '');
    setLoadout({ ...emptyLoadout(), ...(editingBeyblade.parts || {}) });
    setName(editingBeyblade.name || '');
  }, [editingBeyblade]);

  const selectSystem = (value) => {
    setSystemId(value);
    setLoadout(emptyLoadout());
    if (!value) setName('');
  };

  const updatePart = (type, value) => setLoadout((current) => ({ ...current, [type]: value }));

  const handleSave = () => {
    if (!systemId || !isLoadoutComplete(catalog, systemId, loadout)) return;
    // createBeyblade always creates a fresh ID. Editing therefore never overwrites the source record.
    onSaveBeyblade(createBeyblade(catalog, systemId, loadout, name));
    setSystemId('');
    setLoadout(emptyLoadout());
    setName('');
  };

  const isEditing = Boolean(editingBeyblade);

  const handleCancelEdit = () => {
    setSystemId('');
    setLoadout(emptyLoadout());
    setName('');
    onCancelEdit?.();
  };

  return (
    <section className="panel garage-panel">
      <div className="panel-title-row">
        <div>
          <h2>Componi il tuo Beyblade</h2>
          <p>{isEditing ? `Modifica di ${editingBeyblade.name}: il salvataggio creerà un nuovo Beyblade.` : ''}</p>
        </div>
        {systemId && <span className="schema-pill">{systemId}</span>}
      </div>

      <div className="system-picker">
        <span>System</span>
        <select value={systemId} onChange={(event) => selectSystem(event.target.value)}>
          <option value="">— Seleziona System —</option>
          {Object.entries(catalog.systems || {}).map(([id, item]) => <option key={id} value={id}>{item.label || id}</option>)}
        </select>
      </div>

      {!systemId ? (
        <div className="garage-empty">Seleziona un System per iniziare la composizione.</div>
      ) : (
        <>
          <div className="garage-slots">
            {PART_TYPES.filter((type) => enabledTypes.includes(type)).map((type) => (
              <PartSelector
                key={type}
                type={type}
                parts={getPartsForSystem(catalog, systemId, type)}
                value={loadout[type]}
                onChange={(value) => updatePart(type, value)}
              />
            ))}
          </div>

          <label className="selector-field full-width">
            <span>Nome personalizzato</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="es. Roar Tyranno 3-60B" />
          </label>

          <div className="preview-header">
            <div><strong>Stats del Beyblade</strong><small>{selectedParts.length}/{enabledTypes.length} parti selezionate</small></div>
          </div>
          <StatsPreview totals={totals} />
          <div className="garage-save-actions">
            {isEditing && <button className="secondary-button" type="button" onClick={handleCancelEdit}>Annulla modifica</button>}
            <button className="primary-button" onClick={handleSave} disabled={!isLoadoutComplete(catalog, systemId, loadout)}>{isEditing ? 'Salva come nuovo Beyblade' : 'Salva Beyblade'}</button>
          </div>
        </>
      )}
    </section>
  );
}
