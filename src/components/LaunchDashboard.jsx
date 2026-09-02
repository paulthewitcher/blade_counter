import React, { useEffect, useMemo, useState } from 'react';
import StatsPreview from './garage/StatsPreview';
import {
  getVisibleStats,
  resolveLoadoutParts,
  sumStats,
} from '../domain/parts';
import BeybladeThumbnail from './shared/BeybladeThumbnail';

export default function LaunchDashboard({
  catalog,
  data,
  beyblades,
  selectedComboId,
  onSelectCombo,
  onClearHistory,
  onDeleteLaunch,
  isConnected,
  onConnect,
  onDisconnect,
  liveRpm,
}) {
  const activeBeyblades = useMemo(
    () => beyblades.filter((beyblade) => beyblade.isFavorite === true),
    [beyblades]
  );

  const selected = activeBeyblades.find(
    (beyblade) => beyblade.id === selectedComboId
  );

  const stats = selected
    ? getVisibleStats(
        sumStats(resolveLoadoutParts(catalog, selected.parts))
      )
    : {};

  const [selectedLaunchIds, setSelectedLaunchIds] = useState(new Set());

  // Rimuove dalle selezioni eventuali lanci che non esistono più.
  useEffect(() => {
    setSelectedLaunchIds((current) => {
      const existingIds = new Set(
        data.launchHistory.map((launch) => launch.id)
      );

      const next = new Set(
        [...current].filter((id) => existingIds.has(id))
      );

      if (next.size === current.size) return current;

      return next;
    });
  }, [data.launchHistory]);

  const toggleLaunchSelection = (id) => {
    setSelectedLaunchIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const handleClearHistory = () => {
    // Se ci sono righe selezionate, elimina solo quelle.
    if (selectedLaunchIds.size > 0) {
      [...selectedLaunchIds].forEach((id) => {
        onDeleteLaunch(id);
      });

      setSelectedLaunchIds(new Set());
      return;
    }

    // Nessuna selezione: chiedi conferma per cancellare tutto.
    const confirmed = window.confirm(
      'Sicuro di voler cancellare tutta la history?'
    );

    if (!confirmed) return;

    onClearHistory();
    setSelectedLaunchIds(new Set());
  };

  return (
    <div className="page-stack">
      <section className="hero-status">
        <div className="hero-copy">
          <span className="eyebrow">BATTLE PASS</span>
          <h1>
            {liveRpm
              ? `${liveRpm.toLocaleString()} RPM`
              : 'Pronto al lancio'}
          </h1>
          <p>
            {selected
              ? `Selezionato: ${selected.name}`
              : 'Seleziona un Beyblade dal garage.'}
          </p>
        </div>

        <button
          className={
            isConnected
              ? 'disconnect-button'
              : 'connect-button'
          }
          onClick={isConnected ? onDisconnect : onConnect}
        >
          {isConnected ? 'Disconnetti' : 'Connetti'}
        </button>
      </section>

      <section className="panel active-garage-panel">
        <div className="active-garage-grid">
          <div className="active-garage-header">
            <select
              value={selectedComboId}
              onChange={(event) =>
                onSelectCombo(event.target.value)
              }
              aria-label="Seleziona Beyblade attivo"
            >
              <option value="">
                — Seleziona Beyblade —
              </option>

              {activeBeyblades.map((beyblade) => (
                <option
                  key={beyblade.id}
                  value={beyblade.id}
                >
                  {beyblade.name}
                </option>
              ))}
            </select>
          </div>

          <div
            className="active-garage-list"
            aria-label="Beyblade preferiti"
          >
            {activeBeyblades.length === 0 ? (
              <div className="empty-card">
                Nessun Beyblade attivo. Attiva la preferenza
                dal Garage.
              </div>
            ) : (
              activeBeyblades.map((beyblade) => (
                <button
                  key={beyblade.id}
                  type="button"
                  onClick={() =>
                    onSelectCombo(beyblade.id)
                  }
                  className={
                    selectedComboId === beyblade.id
                      ? 'active-garage-card selected'
                      : 'active-garage-card'
                  }
                >
                  <BeybladeThumbnail
                    catalog={catalog}
                    beyblade={beyblade}
                    size={48}
                    className="active-garage-thumbnail"
                  />

                  <span>{beyblade.name}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {selected && <StatsPreview totals={stats} />}
      </section>

      <section className="panel">
        <div className="panel-title-row">
          <div>
            <h2>Launch history</h2>
            <p>
              {data.launchHistory.length} lanci memorizzati.
            </p>
          </div>

          <button
            className="text-button"
            onClick={handleClearHistory}
          >
            Pulisci
          </button>
        </div>

        <div className="history-list">
          {data.launchHistory.length === 0 ? (
            <div className="empty-card">
              Nessun lancio registrato.
            </div>
          ) : (
            data.launchHistory.map((launch) => {
              const isSelected = selectedLaunchIds.has(
                launch.id
              );

              return (
                <div
                  className={
                    isSelected
                      ? 'history-row history-row-selected'
                      : 'history-row'
                  }
                  key={launch.id}
                >
                  <label className="history-select">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        toggleLaunchSelection(launch.id)
                      }
                      aria-label={`Seleziona lancio di ${launch.name}`}
                    />
                  </label>

                  <div className="history-row-content">
                    <div>
                      <strong>{launch.name}</strong>
                      <small>{launch.timestamp}</small>
                    </div>

                    <b>
                      {launch.power.toLocaleString()}{' '}
                      <span>RPM</span>
                    </b>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}