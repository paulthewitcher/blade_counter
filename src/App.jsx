import React, { useCallback, useMemo, useRef, useState } from 'react';
import catalog from './data/catalog.json';
import BottomNav from './components/layout/BottomNav';
import ComboLab from './components/combo/ComboLab';
import LaunchDashboard from './components/LaunchDashboard';
import Operations from './components/operations/Operations';
import { useAppData } from './hooks/useAppData';
import { useBattlePass } from './hooks/useBattlePass';
import './app/app.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [data, setData] = useAppData();
  const [selectedComboId, setSelectedComboId] = useState('');
  const [liveRpm, setLiveRpm] = useState(0);
  const [logs, setLogs] = useState([]);
  const maxPowerRef = useRef(0);
  const launchTimerRef = useRef(null);

  const log = useCallback((message) => setLogs((current) => [...current.slice(-49), `[${new Date().toLocaleTimeString()}] ${message}`]), []);
  const combos = useMemo(() => data.combos, [data.combos]);

  const onSpeed = useCallback((speed) => {
    setLiveRpm(speed);
    maxPowerRef.current = Math.max(maxPowerRef.current, speed);
    clearTimeout(launchTimerRef.current);
    launchTimerRef.current = setTimeout(() => {
      const finalPower = maxPowerRef.current;
      maxPowerRef.current = 0;
      if (finalPower <= 100) return;
      const selected = combos.find((combo) => combo.id === selectedComboId);
      const newLaunch = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        name: selected?.name || 'Unknown Blade',
        power: finalPower,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setData((current) => ({ ...current, launchHistory: [newLaunch, ...current.launchHistory] }));
      log(`Lancio registrato: ${newLaunch.name} a ${finalPower} RPM.`);
    }, 800);
  }, [combos, log, selectedComboId, setData]);

  const { isConnected, connect, disconnect } = useBattlePass({ onSpeed, onLog: log });

  const addCombo = (combo) => {
    setData((current) => ({ ...current, combos: [combo, ...current.combos] }));
    setSelectedComboId(combo.id);
    log(`Combo salvata: ${combo.name}`);
  };

  const toggleFavorite = (id) => setData((current) => ({ ...current, combos: current.combos.map((combo) => combo.id === id ? { ...combo, favorite: !combo.favorite } : combo) }));
  const deleteCombo = (id) => {
    if (id === selectedComboId) setSelectedComboId('');
    setData((current) => ({ ...current, combos: current.combos.filter((combo) => combo.id !== id) }));
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-art" style={{ backgroundImage: `linear-gradient(to bottom, rgba(244,246,249,0.02) 40%, #f4f6f9 100%), url(${import.meta.env.BASE_URL}images/battlepass_header.jpg)` }} />
        <div className="header-overlay"><span>Blade Counter</span><small>data-first rebuild • v2.0.0</small></div>
        <div className={isConnected ? 'status-dot connected' : 'status-dot'} title={isConnected ? 'Battle Pass connesso' : 'Battle Pass disconnesso'} />
      </header>
      <main className="app-content">
        {activeTab === 'home' && <LaunchDashboard catalog={catalog} data={data} combos={combos} selectedComboId={selectedComboId} onSelectCombo={setSelectedComboId} onClearHistory={() => setData((current) => ({ ...current, launchHistory: [] }))} isConnected={isConnected} onConnect={connect} onDisconnect={disconnect} liveRpm={liveRpm} />}
        {activeTab === 'lab' && <ComboLab catalog={catalog} combos={combos} onAddCombo={addCombo} onToggleFavorite={toggleFavorite} onDelete={deleteCombo} />}
        {activeTab === 'operations' && <Operations data={{ ...data, logs }} onImport={(imported) => { setData(imported); log('Backup importato.'); }} />}
      </main>
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
