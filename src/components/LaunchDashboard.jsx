import StatsPreview from './garage/StatsPreview';
import { getVisibleStats, resolveLoadoutParts, sumStats } from '../domain/parts';

export default function LaunchDashboard({ catalog, data, beyblades, selectedComboId, onSelectCombo, onClearHistory, isConnected, onConnect, onDisconnect, liveRpm }) {
  const selected = beyblades.find((beyblade) => beyblade.id === selectedComboId);
  const stats = selected ? getVisibleStats(sumStats(resolveLoadoutParts(catalog, selected.parts))) : {};

  return (
    <div className="page-stack">
      <section className="hero-status">
        <div className="hero-copy"><span className="eyebrow">BATTLE PASS</span><h1>{liveRpm ? `${liveRpm.toLocaleString()} RPM` : 'Pronto al lancio'}</h1><p>{selected ? `Selezionato: ${selected.name}` : 'Seleziona un Beyblade dal garage.'}</p></div>
        <button className={isConnected ? 'disconnect-button' : 'connect-button'} onClick={isConnected ? onDisconnect : onConnect}>{isConnected ? 'Disconnetti' : 'Connetti'}</button>
      </section>
      <section className="panel">
        <div className="panel-title-row"><div><h2>Garage attivo</h2><p>Beyblade salvati disponibili per il lancio.</p></div></div>
        <div className="combo-select-list">{beyblades.length === 0 ? <div className="empty-card">Nessun Beyblade salvato.</div> : beyblades.map((beyblade) => <button key={beyblade.id} onClick={() => onSelectCombo(beyblade.id)} className={selectedComboId === beyblade.id ? 'combo-select selected' : 'combo-select'}><span>{beyblade.favorite ? '★' : '☆'}</span>{beyblade.name}</button>)}</div>
        {selected && <StatsPreview totals={stats} />}
      </section>
      <section className="panel">
        <div className="panel-title-row"><div><h2>Launch history</h2><p>{data.launchHistory.length} lanci memorizzati.</p></div><button className="text-button" onClick={onClearHistory}>Pulisci</button></div>
        <div className="history-list">{data.launchHistory.length === 0 ? <div className="empty-card">Nessun lancio registrato.</div> : data.launchHistory.map((launch) => <div className="history-row" key={launch.id}><div><strong>{launch.name}</strong><small>{launch.timestamp}</small></div><b>{launch.power.toLocaleString()} <span>RPM</span></b></div>)}</div>
      </section>
    </div>
  );
}
