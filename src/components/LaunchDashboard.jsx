import React, { useEffect, useMemo, useRef, useState } from 'react';
import StatsPreview from './garage/StatsPreview';
import { getVisibleStats, resolveLoadoutParts, sumStats } from '../domain/parts';
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
  const selected = activeBeyblades.find((beyblade) => beyblade.id === selectedComboId);
  const stats = selected
    ? getVisibleStats(sumStats(resolveLoadoutParts(catalog, selected.parts)))
    : {};

  const [openDeleteId, setOpenDeleteId] = useState(null);
  const swipeRef = useRef(null);

  useEffect(() => {
    const closeOnOutsidePointer = (event) => {
      if (!event.target.closest?.('.history-row')) {
        setOpenDeleteId(null);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, []);

  const handlePointerDown = (event, id) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    swipeRef.current = {
      id,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      moved: false,
    };
  };

  const handlePointerMove = (event) => {
    if (!swipeRef.current) return;
    const dx = event.clientX - swipeRef.current.startX;
    const dy = event.clientY - swipeRef.current.startY;
    swipeRef.current.lastX = event.clientX;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) swipeRef.current.moved = true;
  };

  const handlePointerUp = () => {
    const gesture = swipeRef.current;
    swipeRef.current = null;
    if (!gesture) return;

    const dx = gesture.lastX - gesture.startX;
    const dy = 0;
    if (gesture.moved && dx < -45 && Math.abs(dx) > Math.abs(dy)) {
      setOpenDeleteId(gesture.id);
    }
  };

  const handleHistoryRowClick = (event, id) => {
    if (event.target.closest?.('.history-delete-button')) return;
    if (openDeleteId !== null) setOpenDeleteId(null);
  };

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
            ) : activeBeyblades.map((beyblade) => (
              <button
                key={beyblade.id}
                type="button"
                onClick={() => onSelectCombo(beyblade.id)}
                className={selectedComboId === beyblade.id ? 'active-garage-card selected' : 'active-garage-card'}
              >
                <BeybladeThumbnail catalog={catalog} beyblade={beyblade} size={48} className="active-garage-thumbnail" />
                <span>{beyblade.name}</span>
              </button>
            ))}
          </div>
        </div>
        {selected && <StatsPreview totals={stats} />}
      </section>

      <section className="panel">
        <div className="panel-title-row"><div><h2>Launch history</h2><p>{data.launchHistory.length} lanci memorizzati.</p></div><button className="text-button" onClick={onClearHistory}>Pulisci</button></div>
        <div className="history-list">
          {data.launchHistory.length === 0 ? (
            <div className="empty-card">Nessun lancio registrato.</div>
          ) : data.launchHistory.map((launch) => {
            const isOpen = openDeleteId === launch.id;
            return (
              <div
                className={`history-row ${isOpen ? 'history-row-open' : ''}`}
                key={launch.id}
                onClick={(event) => handleHistoryRowClick(event, launch.id)}
                onPointerDown={(event) => handlePointerDown(event, launch.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={() => { swipeRef.current = null; }}
              >
                <div className="history-row-content">
                  <div><strong>{launch.name}</strong><small>{launch.timestamp}</small></div>
                  <b>{launch.power.toLocaleString()} <span>RPM</span></b>
                </div>
                {isOpen && (
                  <button
                    type="button"
                    className="history-delete-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteLaunch(launch.id);
                      setOpenDeleteId(null);
                    }}
                    aria-label={`Elimina lancio di ${launch.name}`}
                  >
                    Elimina
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
