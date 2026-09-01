import React, { useCallback, useMemo, useRef, useState } from 'react';
import catalog from './data/catalog.js';
import BottomNav from './components/layout/BottomNav';
import ComboLab from './components/combo/ComboLab';
import LaunchDashboard from './components/LaunchDashboard';
import Operations from './components/operations/Operations';
import { useAppData } from './hooks/useAppData';
import { useBattlePass } from './hooks/useBattlePass';
import { APP_VERSION } from './config/app.js';
import './app/app.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [data, setData] = useAppData(catalog);
  const [selectedComboId, setSelectedComboId] = useState('');
  const [liveRpm, setLiveRpm] = useState(0);
  const [logs, setLogs] = useState([]);
  const maxPowerRef = useRef(0);
  const launchTimerRef = useRef(null);

  const log = useCallback((message) => setLogs((current) => [...current.slice(-49), `[${new Date().toLocaleTimeString()}] ${message}`]), []);
  const beyblades = useMemo(() => data.beyblades, [data.beyblades]);

  const onSpeed = useCallback((speed) => {
    setLiveRpm(speed);
    maxPowerRef.current = Math.max(maxPowerRef.current, speed);
    clearTimeout(launchTimerRef.current);
    launchTimerRef.current = setTimeout(() => {
      const finalPower = maxPowerRef.current;
      maxPowerRef.current = 0;
      if (finalPower <= 100) return;
      const selected = beyblades.find((beyblade) => beyblade.id === selectedComboId);
      const newLaunch = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        name: selected?.name || 'Unknown Beyblade',
        power: finalPower,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setData((current) => ({ ...current, launchHistory: [newLaunch, ...current.launchHistory] }));
      log(`Lancio registrato: ${newLaunch.name} a ${finalPower} RPM.`);
    }, 800);
  }, [beyblades, log, selectedComboId, setData]);

  const { isConnected, connect, disconnect } = useBattlePass({ onSpeed, onLog: log });

  const addBeyblade = (beyblade) => {
    setData((current) => ({ ...current, beyblades: [beyblade, ...current.beyblades] }));
    setSelectedComboId(beyblade.id);
    log(`Beyblade salvato: ${beyblade.name}`);
  };

  const toggleFavorite = (id) => {
    setData((current) => {
      const updated = current.beyblades.map((beyblade) => beyblade.id === id ? { ...beyblade, isFavorite: !beyblade.isFavorite } : beyblade);
      const toggled = updated.find((beyblade) => beyblade.id === id);
      if (toggled && !toggled.isFavorite && toggled.id === selectedComboId) setSelectedComboId('');
      return { ...current, beyblades: updated };
    });
  };

  const deleteBeyblade = (id) => {
    if (id === selectedComboId) setSelectedComboId('');
    setData((current) => ({ ...current, beyblades: current.beyblades.filter((beyblade) => beyblade.id !== id) }));
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-art" style={{ backgroundImage: `linear-gradient(to bottom, rgba(244,246,249,0.02) 40%, #f4f6f9 100%), url(${import.meta.env.BASE_URL}images/battlepass_header.webp)` }} />
        <div className="header-overlay"><span>Blade Counter</span><small>data-first rebuild • v{APP_VERSION}</small></div>
        <div className={isConnected ? 'status-dot connected' : 'status-dot'} title={isConnected ? 'Battle Pass connesso' : 'Battle Pass disconnesso'} />
      </header>
      <main className="app-content">
        {activeTab === 'home' && <LaunchDashboard catalog={catalog} data={data} beyblades={beyblades} selectedComboId={selectedComboId} onSelectCombo={setSelectedComboId} onClearHistory={() => setData((current) => ({ ...current, launchHistory: [] }))} isConnected={isConnected} onConnect={connect} onDisconnect={disconnect} liveRpm={liveRpm} />}
        {activeTab === 'lab' && <ComboLab catalog={catalog} beyblades={beyblades} onAddBeyblade={addBeyblade} onToggleFavorite={toggleFavorite} onDelete={deleteBeyblade} />}
        {activeTab === 'operations' && <Operations data={{ ...data, logs }} catalog={catalog} onImport={(imported) => { setData(imported); log('Backup importato.'); }} />}
      </main>
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
