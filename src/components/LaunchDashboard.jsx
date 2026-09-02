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
  onDeleteSelectedLaunches,
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

  const [selectedLaunchIds, setSelectedLaunchIds] = useState(
    new Set()
  );

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Rimuove dalle selezioni eventuali lanci che non esistono più.
  useEffect(() => {
    setSelectedLaunchIds((current) => {
      const existingIds = new Set(
        data.launchHistory.map((launch) => launch.id)
      );

      const next = new Set(
        [...current].filter((id) => existingIds.has(id))
      );

      if (next.size === current.size) {
        return current;
      }

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

  // Il pulsante Pulisci apre sempre il popup.
  const handleClearHistory = () => {
    setShowClearConfirm(true);
  };

  // Conferma la cancellazione, distinguendo tra selezionati e tutta la history.
  const handleConfirmClearHistory = () => {
    if (selectedLaunchIds.size > 0) {
      onDeleteSelectedLaunches([...selectedLaunchIds]);
    } else {
      onClearHistory();
    }

    setSelectedLaunchIds(new Set());
    setShowClearConfirm(false);
  };

  const handleCancelClearHistory = () => {
    setShowClearConfirm(false);
  };

  const isReady = isConnected && liveRpm <= 100;

  return (
    <div className="page-stack">
      <section className="hero-status">
        <div className="hero-copy">
          <span className="eyebrow">BATTLE PASS</span>

          <h1 className={isReady ? 'battle-ready' : ''}>
            {isReady
              ? 'PRONTO'
              : liveRpm
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
                  <div className="history-row-content">
                    <strong>{launch.name}</strong>

                    <b>
                      {launch.power.toLocaleString()}{' '}
                      <span>RPM</span>
                    </b>
                  </div>

                  <small className="history-timestamp">
                    {launch.timestamp}
                  </small>

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
                </div>
              );
            })
          )}
        </div>
      </section>

      {showClearConfirm && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCancelClearHistory();
            }
          }}
        >
          <div
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-history-title"
          >
            <h3 id="clear-history-title">
              {selectedLaunchIds.size > 0
                ? 'Cancella lanci selezionati?'
                : 'Cancella tutta la history?'}
            </h3>

            <p>
              {selectedLaunchIds.size > 0
                ? `Sicuro di voler cancellare ${
                    selectedLaunchIds.size
                  } lancio${
                    selectedLaunchIds.size === 1
                      ? ''
                      : 'i'
                  } selezionato${
                    selectedLaunchIds.size === 1
                      ? ''
                      : 'i'
                  }?`
                : 'Sicuro di voler cancellare tutta la history?'}
            </p>

            <div className="confirm-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancelClearHistory}
              >
                Annulla
              </button>

              <button
                type="button"
                className="confirm-delete-button"
                onClick={handleConfirmClearHistory}
              >
                {selectedLaunchIds.size > 0
                  ? 'Cancella selezionati'
                  : 'Cancella tutto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}