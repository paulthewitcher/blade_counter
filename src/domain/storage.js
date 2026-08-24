export const DATA_SCHEMA_VERSION = 2;
export const STORAGE_KEY = 'blade_counter_data_v2';

export const defaultAppData = () => ({
  schemaVersion: DATA_SCHEMA_VERSION,
  combos: [],
  launchHistory: [],
  inventory: {
    blade: [],
    ratchet: [],
    bit: [],
    lock_cip: [],
  },
});

export const normalizeAppData = (input) => {
  const base = defaultAppData();
  if (!input || typeof input !== 'object') return base;
  return {
    ...base,
    ...input,
    schemaVersion: DATA_SCHEMA_VERSION,
    combos: Array.isArray(input.combos) ? input.combos : [],
    launchHistory: Array.isArray(input.launchHistory) ? input.launchHistory : [],
    inventory: { ...base.inventory, ...(input.inventory || {}) },
  };
};

export const loadAppData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeAppData(JSON.parse(raw));

    const oldCombos = localStorage.getItem('bey_custom_combos');
    const oldHistory = localStorage.getItem('bey_launch_history');
    if (oldCombos || oldHistory) {
      return normalizeAppData({
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeAppData(data)));
};
