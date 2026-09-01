import React, { useRef, useState } from 'react';
import { exportBackup, parseBackupFile } from '../../services/backupService';

export default function Operations({ data, catalog, onImport }) {
  const inputRef = useRef(null);
  const [message, setMessage] = useState('');

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = await parseBackupFile(file, catalog);
      onImport(imported);
      setMessage('Backup importato.');
    } catch (error) {
      setMessage(`Import fallito: ${error.message}`);
    } finally {
      event.target.value = '';
    }
  };

  return (
    <section className="panel page-stack">
      <div className="panel-title-row"><div><h2>Operations</h2><p>Backup completo dell'app e dati strutturati per schema.</p></div></div>
      <div className="operation-grid">
        <button className="primary-button" onClick={() => exportBackup(data, catalog)}>Esporta backup JSON</button>
        <button className="secondary-button" onClick={() => inputRef.current?.click()}>Importa backup JSON</button>
      </div>
      <input ref={inputRef} type="file" accept="application/json,.json" hidden onChange={handleImport} />
      {message && <div className="notice">{message}</div>}
    </section>
  );
}
