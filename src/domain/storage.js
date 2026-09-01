import { getSystem, getEnabledPartTypes } from './systems.js';

export const DATA_SCHEMA_VERSION = 3;
export const STORAGE_KEY = 'blade_counter_data_v3';

const PART_TYPES = ['blade', 'ratchet', 'bit', 'lock_cip', 'subBlade'];

const emptyPartReferences = () => Object.fromEntries(PART_TYPES.map((type) => [type, '']));

const normalizeParts = (parts) => {
  const normalized = emptyPartReferences();
  if (!parts || typeof parts !== 'object') return normalized;
  for (const type of PART_TYPES) {
    normalized[type] = parts[type] == null ? '' : String(parts[type]);
  }
  return normalized;
};

/*
 * Older exports may have an empty system. Since the old record only contains
 * the selected part categories, infer the unique system when possible.
 * If multiple systems have the same slot signature (BX/UX currently do),
 * choose BX deterministically; there is no information in the old record
 * that can distinguish them.
 */
export const inferSystemForParts = (parts, catalog) => {
  const selectedTypes = PART_TYPES.filter((type) => Boolean(parts?.[type]));
  if (!catalog?.systems || !selectedTypes.length) return '';

  const candidates = Object.entries(catalog.systems)
    .filter(([, system]) => {
      const enabled = getEnabledPartTypes(system);
      return enabled.length === selectedTypes.length &&
        enabled.every((type) => selectedTypes.includes(type));
    })
    .map(([id]) => id);

  if (candidates.includes('BX')) return 'BX';
  return candidates[0] || '';
};

export const normalizeBeyblade = (beyblade, catalog) => {
  const parts = normalizeParts(beyblade?.parts);
  const storedSystem = String(beyblade?.system || beyblade?.systemId || '');
  // A stored system is authoritative. Older/newer catalogs may change over
  // time, but a saved Beyblade must retain the system it was created with.
  const system = storedSystem || inferSystemForParts(parts, catalog);

  return {
    id: String(beyblade?.id ?? ''),
    name: String(beyblade?.name || 'Nuovo Beyblade'),
    system,
    parts,
    isFavorite: Boolean(beyblade?.isFavorite ?? beyblade?.favorite),
    createdAt: beyblade?.createdAt || new Date().toISOString(),
  };
};

export const defaultAppData = () => ({
  schemaVersion: DATA_SCHEMA_VERSION,
  beyblades: [],
  launchHistory: [],
});

export const migrateAppData = (input, catalog) => {
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
    beyblades: legacyBeyblades
      .map((item) => normalizeBeyblade(item, catalog))
      .filter((item) => item.id),
    launchHistory: Array.isArray(input.launchHistory) ? input.launchHistory : [],
  };
};

export const normalizeAppData = migrateAppData;

export const loadAppData = (catalog) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrateAppData(JSON.parse(raw), catalog);

    const oldV2 = localStorage.getItem('blade_counter_data_v2');
    if (oldV2) return migrateAppData(JSON.parse(oldV2), catalog);

    const oldCombos = localStorage.getItem('bey_custom_combos');
    const oldHistory = localStorage.getItem('bey_launch_history');
    if (oldCombos || oldHistory) {
      return migrateAppData({
        combos: oldCombos ? JSON.parse(oldCombos) : [],
        launchHistory: oldHistory ? JSON.parse(oldHistory) : [],
      }, catalog);
    }
  } catch (error) {
    console.warn('Unable to load saved data', error);
  }
  return defaultAppData();
};

export const saveAppData = (data, catalog) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrateAppData(data, catalog)));
  } catch (error) {
    console.warn('Unable to save app data', error);
  }
};
