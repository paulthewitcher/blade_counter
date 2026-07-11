import React, { useState, useRef } from 'react';
import GarageSelector from './components/GarageSelector';
import LaunchHistory from './components/LaunchHistory';
import { useBattlePass } from './hooks/useBattlePass';
import blades from './anagrafiche/blades.json';
import ratchets from './anagrafiche/ratchets.json';
import bits from './anagrafiche/bits.json';
import './App.css';

const buildProfileName = (bladeId, ratchetId, bitId) => {
  const blade = blades.find((item) => item.id === bladeId) || blades[0];
  const ratchet = ratchets.find((item) => item.id === ratchetId) || ratchets[0];
  const bit = bits.find((item) => item.id === bitId) || bits[0];

  return `${blade.name} / ${ratchet.name} / ${bit.name}`;
};

export default function App() {
  const [selectedBladeId, setSelectedBladeId] = useState(blades[0].id);
  const [selectedRatchetId, setSelectedRatchetId] = useState(ratchets[0].id);
  const [selectedBitId, setSelectedBitId] = useState(bits[0].id);
  const [selectedBeyblade, setSelectedBeyblade] = useState(buildProfileName(blades[0].id, ratchets[0].id, bits[0].id));
  const [launchHistory, setLaunchHistory] = useState([]);
  const [statusMessage, setStatusMessage] = useState('In attesa di connessione...');
  
  const maxPowerRef = useRef(0);
  const launchTimeoutRef = useRef(null);
  const selectedBeybladeRef = useRef(buildProfileName(blades[0].id, ratchets[0].id, bits[0].id));

  const updateProfileSelection = (bladeId, ratchetId, bitId) => {
    setSelectedBladeId(bladeId);
    setSelectedRatchetId(ratchetId);
    setSelectedBitId(bitId);

    const nextProfileName = buildProfileName(bladeId, ratchetId, bitId);
    setSelectedBeyblade(nextProfileName);
    selectedBeybladeRef.current = nextProfileName;
    setStatusMessage(`🎯 ${nextProfileName} pronto in posizione!`);
  };

  const handleSelectBlade = (bladeId) => {
    updateProfileSelection(bladeId, selectedRatchetId, selectedBitId);
  };

  const handleSelectRatchet = (ratchetId) => {
    updateProfileSelection(selectedBladeId, ratchetId, selectedBitId);
  };

  const handleSelectBit = (bitId) => {
    updateProfileSelection(selectedBladeId, selectedRatchetId, bitId);
  };

  const handleNewLaunchData = (currentPower) => {
    // ⛓️ SEGNALE DI AGGANCIO RILEVATO (Codice 99999)
    if (currentPower === 99999) {
      setStatusMessage(`⛓️ ${selectedBeybladeRef.current} ------ AGGANCIATO!`);
      return; // Interrompe qui senza toccare o bloccare i flussi dei lanci!
    }

    // Ignoriamo i pacchetti vuoti o filtrati
    if (currentPower <= 0) return;

    // 🔥 FLUSSO DI LANCIO ATTIVO
    setStatusMessage('🔥 Lancio in corso...');

    if (currentPower > maxPowerRef.current) {
      maxPowerRef.current = currentPower;
    }

    // Gestione del timer di accumulo (Debounce)
    if (launchTimeoutRef.current) {
      clearTimeout(launchTimeoutRef.current);
    }

    launchTimeoutRef.current = setTimeout(() => {
      const finalPeakPower = maxPowerRef.current;

      if (finalPeakPower >= 3000) {
        const newLaunchRecord = {
          id: Date.now().toString(),
          beyblade: selectedBeybladeRef.current, // Prende all'istante il nome esatto
          power: finalPeakPower,
          time: new Date().toLocaleTimeString()
        };

        setLaunchHistory(prev => [newLaunchRecord, ...prev]);
        setStatusMessage(`✅ Lancio registrato per ${selectedBeybladeRef.current}!`);
      }
      
      // Reset dei registri per il prossimo tiro autonomo
      maxPowerRef.current = 0;
      launchTimeoutRef.current = null;
    }, 1200); 
  };

  const { isConnected, connect, disconnect } = useBattlePass(handleNewLaunchData);
  const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', paddingBottom: '120px' }}>
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>BeyStats Web App</h1>
        <button 
          className={`btn-connect ${isConnected ? 'bg-green' : 'bg-red'}`} 
          onClick={isConnected ? disconnect : connect}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            color: 'white',
            fontWeight: 'bold',
            backgroundColor: isConnected ? '#4CAF50' : '#F44336',
            cursor: 'pointer'
          }}
        >
          {isConnected ? "Connesso (Stacca)" : "Connetti Battle Pass"}
        </button>
      </header>

      <main>
        <GarageSelector
          selectedBladeId={selectedBladeId}
          selectedRatchetId={selectedRatchetId}
          selectedBitId={selectedBitId}
          onSelectBlade={handleSelectBlade}
          onSelectRatchet={handleSelectRatchet}
          onSelectBit={handleSelectBit}
        />

        <div style={{
          background: '#E3F2FD',
          borderLeft: '5px solid #2196F3',
          color: '#0D47A1',
          padding: '12px 15px',
          borderRadius: '4px',
          marginBottom: '20px',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          Stato: {statusMessage}
        </div>

        <LaunchHistory history={launchHistory} />
      </main>

      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        background: '#1E1E1E', 
        color: '#00FF00', 
        borderRadius: '8px', 
        fontFamily: 'monospace', 
        fontSize: '11px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        border: '1px solid #333',
        lineHeight: '1.5'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#00FFFF', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
          🤖 TERMINALE DI DEBUG BEYBLADE:
        </p>
        <div id="web-logs" style={{ maxHeight: '150px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
          In attesa di connessione... Inserisci il Blade o lancia per analizzare i flussi.
        </div>
      </div>

      <div style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.65)',
        color: '#FFF',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '10px',
        fontFamily: 'sans-serif',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        pointerEvents: 'none',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        v{appVersion}
      </div>
    </div>
  );
}