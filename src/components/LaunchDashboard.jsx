import React, { useMemo } from 'react';
import StatsPreview from './garage/StatsPreview';
import { getVisibleStats, getPartById, resolveLoadoutParts, sumStats } from '../domain/parts';

const DEFAULT_IMAGE = `${import.meta.env.BASE_URL}default.png`;

const getPartImage = (catalog, type, id) => {
  const part = getPartById(catalog, type, id);
  return part?.image ? `${import.meta.env.BASE_URL}${part.image.replace(/^\/+/, '')}` : DEFAULT_IMAGE;
};

export default function LaunchDashboard({ catalog, data, beyblades, selectedComboId, onSelectCombo, onClearHistory, isConnected, onConnect, onDisconnect, liveRpm }) {
  const activeBeyblades = useMemo(() => beyblades.filter((beyblade) => beyblade.isFavorite === true), [beyblades]);
  const selected = activeBeyblades.find((beyblade) => beyblade.id === selectedComboId);
  const stats = selected ? getVisibleStats(sumStats(resolveLoadoutParts(catalog, selected.parts))) : {};

  return (
    <div className="page-stack">
      <section className="hero-status">
        <div className="hero-copy"><span className="eyebrow">BATTLE PASS</span><h1>{liveRpm ? `${liveRpm.toLocaleString()} RPM` : 'Pronto al lancio'}</h1><p>{selected ? `Selezionato: ${selected.name}` : 'Seleziona un Beyblade dal garage.'}</p></div>
        <button className={isConnected ? 'disconnect-button' : 'connect-button'} onClick={isConnected ? onDisconnect : onConnect}>{isConnected ? 'Disconnetti' : 'Connetti'}</button>
      </section>

      <section className="panel active-garage-panel">
        <div className="active-garage-grid">
          <div className="active-garage-header">
            <select
              value={selectedComboId}
              onChange={(event) => onSelectCombo(event.target.value)}
              aria-label="Seleziona Beyblade attivo"
            >
              <option value="">— Seleziona Beyblade —</option>
              {activeBeyblades.map((beyblade) => <option key={beyblade.id} value={beyblade.id}>{beyblade.name}</option>)}
            </select>
          </div>

          <div className="active-garage-list" aria-label="Beyblade preferiti">
            {activeBeyblades.length === 0 ? (
              <div className="empty-card">Nessun Beyblade attivo. Attiva la preferenza dal Garage.</div>
            ) : activeBeyblades.map((beyblade, index) => (
              <button
                key={beyblade.id}
                type="button"
                onClick={() => onSelectCombo(beyblade.id)}
                className={selectedComboId === beyblade.id ? 'active-garage-card selected' : 'active-garage-card'}
              >
                <img
                  src={getPartImage(catalog, 'blade', beyblade.parts?.blade)}
                  alt=""
                  aria-hidden="true"
                  width="48"
                  height="48"
                  loading={index < 6 ? 'eager' : 'lazy'}
                  decoding="async"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = DEFAULT_IMAGE;
                  }}
                />
                <span>{beyblade.name}</span>
              </button>
            ))}
          </div>
        </div>
        {selected && <StatsPreview totals={stats} />}
      </section>

      <section className="panel">
        <div className="panel-title-row"><div><h2>Launch history</h2><p>{data.launchHistory.length} lanci memorizzati.</p></div><button className="text-button" onClick={onClearHistory}>Pulisci</button></div>
        <div className="history-list">{data.launchHistory.length === 0 ? <div className="empty-card">Nessun lancio registrato.</div> : data.launchHistory.map((launch) => <div className="history-row" key={launch.id}><div><strong>{launch.name}</strong><small>{launch.timestamp}</small></div><b>{launch.power.toLocaleString()} <span>RPM</span></b></div>)}</div>
      </section>
    </div>
  );
}
