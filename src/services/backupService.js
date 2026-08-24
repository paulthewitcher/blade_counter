import { DATA_SCHEMA_VERSION, normalizeAppData } from '../domain/storage';

export const exportBackup = (data) => {
  const payload = {
    app: 'blade_counter',
    schemaVersion: DATA_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: normalizeAppData(data),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `blade-counter-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const parseBackupFile = async (file) => {
  const parsed = JSON.parse(await file.text());
  return normalizeAppData(parsed?.data ?? parsed);
};
