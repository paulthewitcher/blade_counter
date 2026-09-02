import React, { useRef, useState } from 'react';
import {
  exportBackup,
  parseBackupFile,
} from '../../services/backupService';

export default function Operations({
  data,
  setData,
  logs = [],
  onLog,
}) {
  const inputRef = useRef(null);
  const [message, setMessage] = useState('');

  const handleImport = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const imported = await parseBackupFile(file);

      setData(imported);

      onLog?.('Backup JSON importato correttamente.');
      setMessage('Backup importato.');
    } catch (error) {
      console.error('Import backup fallito:', error);

      onLog?.(
        `Import backup fallito: ${error.message}`
      );

      setMessage(
        `Import fallito: ${error.message}`
      );
    } finally {
      event.target.value = '';
    }
  };

  const handleExport = () => {
    try {
      exportBackup(data);

      onLog?.('Backup JSON esportato.');
      setMessage('Backup esportato.');
    } catch (error) {
      console.error('Export backup fallito:', error);

      onLog?.(
        `Export backup fallito: ${error.message}`
      );

      setMessage(
        `Export fallito: ${error.message}`
      );
    }
  };

  return (
    <section className="panel page-stack">
      <div className="panel-title-row">
        <div>
          <h2>Operations</h2>
          <p>
            Backup completo dell'app e dati
            strutturati per schema.
          </p>
        </div>
      </div>

      <div className="operation-grid">
        <button
          type="button"
          className="primary-button"
          onClick={handleExport}
        >
          Esporta backup JSON
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            inputRef.current?.click()
          }
        >
          Importa backup JSON
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={handleImport}
      />

      {message && (
        <div className="notice">
          {message}
        </div>
      )}

      {logs.length > 0 && (
        <div className="panel">
          <div className="panel-title-row">
            <div>
              <h3>Logs</h3>
            </div>
          </div>

          <div className="log-list">
            {logs.map((entry, index) => (
              <div
                key={`${index}-${entry}`}
                className="log-entry"
              >
                {entry}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}