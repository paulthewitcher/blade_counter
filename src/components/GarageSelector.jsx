import React from 'react';
import blades from '../anagrafiche/blades.json';
import ratchets from '../anagrafiche/ratchets.json';
import bits from '../anagrafiche/bits.json';

const renderStats = (stats) =>
  Object.entries(stats).map(([key, value]) => (
    <li key={key} style={{ marginBottom: '4px' }}>
      <strong>{key}:</strong> {value}
    </li>
  ));

export default function GarageSelector({
  selectedBladeId,
  selectedRatchetId,
  selectedBitId,
  onSelectBlade,
  onSelectRatchet,
  onSelectBit,
}) {
  return (
    <section style={{ marginBottom: '25px' }}>
      <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>1. Anagrafica del Beyblade</h2>
      <p style={{ marginTop: 0, marginBottom: '12px', color: '#556' }}>
        Seleziona blade, ratchet e bit per costruire il profilo attivo.
      </p>

      <div style={{ display: 'grid', gap: '14px' }}>
        <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '12px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Blade</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {blades.map((blade) => (
              <button
                key={blade.id}
                onClick={() => onSelectBlade(blade.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #DDD',
                  cursor: 'pointer',
                  backgroundColor: selectedBladeId === blade.id ? '#007AFF' : '#FFFFFF',
                  color: selectedBladeId === blade.id ? '#FFFFFF' : '#333333',
                  fontWeight: selectedBladeId === blade.id ? 'bold' : 'normal',
                }}
              >
                {blade.name}
              </button>
            ))}
          </div>
          <ul style={{ margin: '10px 0 0 18px', padding: 0 }}>
            {renderStats(blades.find((blade) => blade.id === selectedBladeId)?.stats || blades[0].stats)}
          </ul>
        </div>

        <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '12px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Ratchet</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {ratchets.map((ratchet) => (
              <button
                key={ratchet.id}
                onClick={() => onSelectRatchet(ratchet.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #DDD',
                  cursor: 'pointer',
                  backgroundColor: selectedRatchetId === ratchet.id ? '#007AFF' : '#FFFFFF',
                  color: selectedRatchetId === ratchet.id ? '#FFFFFF' : '#333333',
                  fontWeight: selectedRatchetId === ratchet.id ? 'bold' : 'normal',
                }}
              >
                {ratchet.name}
              </button>
            ))}
          </div>
          <ul style={{ margin: '10px 0 0 18px', padding: 0 }}>
            {renderStats(ratchets.find((ratchet) => ratchet.id === selectedRatchetId)?.stats || ratchets[0].stats)}
          </ul>
        </div>

        <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '12px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Bit</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {bits.map((bit) => (
              <button
                key={bit.id}
                onClick={() => onSelectBit(bit.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #DDD',
                  cursor: 'pointer',
                  backgroundColor: selectedBitId === bit.id ? '#007AFF' : '#FFFFFF',
                  color: selectedBitId === bit.id ? '#FFFFFF' : '#333333',
                  fontWeight: selectedBitId === bit.id ? 'bold' : 'normal',
                }}
              >
                {bit.name}
              </button>
            ))}
          </div>
          <ul style={{ margin: '10px 0 0 18px', padding: 0 }}>
            {renderStats(bits.find((bit) => bit.id === selectedBitId)?.stats || bits[0].stats)}
          </ul>
        </div>
      </div>
    </section>
  );
}