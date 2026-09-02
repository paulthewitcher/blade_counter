import React, { useCallback, useMemo, useRef, useState } from 'react';
import catalog from './data/catalog.js';
import BottomNav from './components/layout/BottomNav.jsx';
import ComboLab from './components/combo/ComboLab.jsx';
import LaunchDashboard from './components/LaunchDashboard.jsx';
import Operations from './components/operations/Operations.jsx';
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

  const log = useCallback((message) => {
    setLogs((current) => [
      ...current.slice(-49),
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
  }, []);

  const beyblades = useMemo(
    () => data.beyblades,
    [data.beyblades]
  );

  const onSpeed = useCallback(
    (speed) => {
      /*
       * 99999 è il valore inviato dal Battle Pass
       * quando il dispositivo è in standby/pronto.
       *
       * Non deve essere visualizzato come RPM reale
       * e non deve influenzare il massimo del lancio.
       */
      if (speed >= 99999) {
        setLiveRpm(0);
        maxPowerRef.current = 0;
        clearTimeout(launchTimerRef.current);
        return;
      }

      setLiveRpm(speed);

      maxPowerRef.current = Math.max(
        maxPowerRef.current,
        speed
      );

      clearTimeout(launchTimerRef.current);

      launchTimerRef.current = setTimeout(() => {
        const finalPower = maxPowerRef.current;

        maxPowerRef.current = 0;

        /*
         * Ignora valori troppo bassi o non validi.
         */
        if (finalPower <= 100 || finalPower > 90000) {
          setLiveRpm(0);
          return;
        }

        const selected = beyblades.find(
          (beyblade) => beyblade.id === selectedComboId
        );

        const now = new Date();

        const newLaunch = {
          id: `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 10)}`,
          name: selected?.name || 'Unknown Beyblade',
          power: finalPower,
          timestamp: now.toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        };

        setData((current) => ({
          ...current,
          launchHistory: [
            newLaunch,
            ...current.launchHistory,
          ],
        }));

        log(
          `Lancio registrato: ${newLaunch.name} a ${finalPower} RPM.`
        );

        /*
         * Dopo la registrazione il display torna a PRONTO.
         */
        setLiveRpm(0);
      }, 800);
    },
    [
      beyblades,
      log,
      selectedComboId,
      setData,
    ]
  );

  const {
    isConnected,
    connect,
    disconnect,
  } = useBattlePass({
    onSpeed,
    onLog: log,
  });

  const addBeyblade = useCallback(
    (beyblade) => {
      setData((current) => ({
        ...current,
        beyblades: [
          ...current.beyblades,
          beyblade,
        ],
      }));

      log(`Beyblade aggiunto: ${beyblade.name}.`);
    },
    [log, setData]
  );

  const toggleFavorite = useCallback(
    (id) => {
      setData((current) => ({
        ...current,
        beyblades: current.beyblades.map((beyblade) =>
          beyblade.id === id
            ? {
                ...beyblade,
                isFavorite: !beyblade.isFavorite,
              }
            : beyblade
        ),
      }));
    },
    [setData]
  );

  const deleteBeyblade = useCallback(
    (id) => {
      setData((current) => ({
        ...current,
        beyblades: current.beyblades.filter(
          (beyblade) => beyblade.id !== id
        ),
      }));

      if (selectedComboId === id) {
        setSelectedComboId('');
      }
    },
    [selectedComboId, setData]
  );

  const deleteSelectedLaunches = useCallback(
    (ids) => {
      if (!ids || ids.length === 0) {
        return;
      }

      const selectedIds = new Set(ids);

      setData((current) => ({
        ...current,
        launchHistory: current.launchHistory.filter(
          (launch) => !selectedIds.has(launch.id)
        ),
      }));

      log(
        `${ids.length} lancio${
          ids.length === 1 ? '' : 'i'
        } eliminato${
          ids.length === 1 ? '' : 'i'
        } dalla history.`
      );
    },
    [log, setData]
  );

  const clearHistory = useCallback(() => {
    setData((current) => ({
      ...current,
      launchHistory: [],
    }));

    log('History completamente cancellata.');
  }, [log, setData]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div
          className="header-art"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(244,246,249,0.02) 40%, #f4f6f9 100%), url(${import.meta.env.BASE_URL}images/battlepass_header.webp)`,
          }}
        />

        <div className="header-overlay">
          <span>Blade Counter</span>
          <small>
            data-first rebuild • v{APP_VERSION}
          </small>
        </div>

        <div
          className={
            isConnected
              ? 'status-dot connected'
              : 'status-dot'
          }
          title={
            isConnected
              ? 'Battle Pass connesso'
              : 'Battle Pass disconnesso'
          }
        />
      </header>

      <main className="app-content">
        {activeTab === 'home' && (
          <LaunchDashboard
            catalog={catalog}
            data={data}
            beyblades={beyblades}
            selectedComboId={selectedComboId}
            onSelectCombo={setSelectedComboId}
            onClearHistory={clearHistory}
            onDeleteSelectedLaunches={
              deleteSelectedLaunches
            }
            isConnected={isConnected}
            onConnect={connect}
            onDisconnect={disconnect}
            liveRpm={liveRpm}
          />
        )}

        {activeTab === 'combo' && (
          <ComboLab
            catalog={catalog}
            data={data}
            beyblades={beyblades}
            selectedComboId={selectedComboId}
            onSelectCombo={setSelectedComboId}
            onAddBeyblade={addBeyblade}
            onToggleFavorite={toggleFavorite}
            onDeleteBeyblade={deleteBeyblade}
          />
        )}

        {activeTab === 'operations' && (
          <Operations
            data={data}
            setData={setData}
            logs={logs}
            onLog={log}
          />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onChange={setActiveTab}
      />
    </div>
  );
}