import React, { useCallback, useMemo, useRef, useState } from 'react';
import catalog from './data/catalog.js';
import BottomNav from './components/BottomNav.jsx';
import ComboLab from './components/ComboLab.jsx';
import LaunchDashboard from './components/LaunchDashboard.jsx';
import Operations from './components/Operations.jsx';
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
      setLiveRpm(speed);

      maxPowerRef.current = Math.max(
        maxPowerRef.current,
        speed
      );

      clearTimeout(launchTimerRef.current);

      launchTimerRef.current = setTimeout(() => {
        const finalPower = maxPowerRef.current;

        maxPowerRef.current = 0;

        if (finalPower <= 100 || finalPower > 90000) {
          return;
        }

        const selected = beyblades.find(
          (beyblade) => beyblade.id === selectedComboId
        );

        const newLaunch = {
          id: `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 10)}`,
          name: selected?.name || 'Unknown Beyblade',
          power: finalPower,
          timestamp: new Date().toLocaleTimeString([], {
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

  const deleteLaunch = useCallback(
    (id) => {
      setData((current) => ({
        ...current,
        launchHistory: current.launchHistory.filter(
          (launch) => launch.id !== id
        ),
      }));
    },
    [setData]
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
        <div>
          <h1>Blade Counter</h1>
          <small>v{APP_VERSION}</small>
        </div>

        <div className="connection-status">
          <span
            className={
              isConnected
                ? 'status-dot connected'
                : 'status-dot'
            }
          />

          <span>
            {isConnected
              ? 'Connesso'
              : 'Disconnesso'}
          </span>
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'home' && (
          <LaunchDashboard
            catalog={catalog}
            data={data}
            beyblades={beyblades}
            selectedComboId={selectedComboId}
            onSelectCombo={setSelectedComboId}
            onClearHistory={clearHistory}
            onDeleteLaunch={deleteLaunch}
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