import {
  DATA_SCHEMA_VERSION,
  normalizeAppData,
} from '../domain/storage';

export const exportBackup = (data) => {
  const sanitized = normalizeAppData(data);

  const payload = {
    app: 'blade_counter',
    schemaVersion: DATA_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: sanitized,
  };

  const blob = new Blob(
    [JSON.stringify(payload, null, 2)],
    {
      type: 'application/json',
    }
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download =
    `blade-counter-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
};

export const parseBackupFile = async (file) => {
  if (!file) {
    throw new Error(
      'Nessun file di backup selezionato.'
    );
  }

  if (
    file.type &&
    file.type !== 'application/json' &&
    !file.name.toLowerCase().endsWith('.json')
  ) {
    throw new Error(
      'Il file selezionato non è un backup JSON valido.'
    );
  }

  const text = await file.text();

  if (!text.trim()) {
    throw new Error(
      'Il file di backup è vuoto.'
    );
  }

  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(
      'Il file selezionato non contiene un JSON valido.'
    );
  }

  const source = parsed?.data ?? parsed;

  if (
    !source ||
    typeof source !== 'object' ||
    Array.isArray(source)
  ) {
    throw new Error(
      'Struttura del backup non valida.'
    );
  }

  return normalizeAppData(source);
};