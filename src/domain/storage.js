export const DATA_SCHEMA_VERSION = 3;
export const STORAGE_KEY = 'blade_counter_data_v3';

const emptyPartReferences = () => ({
  blade: '',
  ratchet: '',
  bit: '',
  lock_cip: '',
  subBlade: '',
});

const normalizeBeyblade = (beyblade) => ({
  id: String(beyblade?.id ?? ''),
  name: String(beyblade?.name || 'Nuovo Beyblade'),
  system: String(beyblade?.system || beyblade?.systemId || ''),
  parts: { ...emptyPartReferences(), ...(beyblade?.parts || {}) },
  isFavorite: Boolean(beyblade?.isFavorite ?? beyblade?.favorite),
  createdAt: beyblade?.createdAt || new Date().toISOString(),
});

export const defaultAppData = () => ({
  schemaVersion: DATA_SCHEMA_VERSION,
  beyblades: [],
  launchHistory: [],
});

export const migrateAppData = (input) => {
  const base = defaultAppData();
  if (!input || typeof input !== 'object') return base;

  const legacyBeyblades = Array.isArray(input.beyblades)
    ? input.beyblades
    : Array.isArray(input.combos)
      ? input.combos
      : [];

  return {
    ...base,
    schemaVersion: DATA_SCHEMA_VERSION,
    beyblades: legacyBeyblades.map(normalizeBeyblade).filter((item) => item.id),
    launchHistory: Array.isArray(input.launchHistory) ? input.launchHistory : [],
  };
};

export const normalizeAppData = migrateAppData;

export const loadAppData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrateAppData(JSON.parse(raw));

    const oldV2 = localStorage.getItem('blade_counter_data_v2');
    if (oldV2) return migrateAppData(JSON.parse(oldV2));

    const oldCombos = localStorage.getItem('bey_custom_combos');
    const oldHistory = localStorage.getItem('bey_launch_history');
    if (oldCombos || oldHistory) {
      return migrateAppData({
        combos: oldCombos ? JSON.parse(oldCombos) : [],
        launchHistory: oldHistory ? JSON.parse(oldHistory) : [],
      });
    }
  } catch (error) {
    console.warn('Unable to load saved data', error);
  }
  return defaultAppData();
};

export const saveAppData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrateAppData(data)));
  } catch (error) {
    console.warn('Unable to save app data', error);
  }
};
