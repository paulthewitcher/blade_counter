export const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const PART_TYPES = ['blade', 'ratchet', 'bit', 'lock_cip'];
export const STAT_EPSILON = 0.000001;

export const emptyLoadout = () => ({
  blade: '',
  ratchet: '',
  bit: '',
  lock_cip: '',
});

export const normalizeStats = (stats) => {
  if (!stats || typeof stats !== 'object') return {};
  return Object.fromEntries(
    Object.entries(stats)
      .map(([key, value]) => [String(key), Number(value)])
      .filter(([, value]) => Number.isFinite(value))
  );
};

export const getAllStatKeys = (parts) => {
  const keys = new Set();
  for (const part of parts) {
    for (const key of Object.keys(normalizeStats(part?.stats))) keys.add(key);
  }
  return [...keys];
};

export const sumStats = (parts) => {
  const totals = {};
  for (const part of parts) {
    for (const [key, rawValue] of Object.entries(normalizeStats(part?.stats))) {
      totals[key] = (totals[key] || 0) + rawValue;
    }
  }
  return totals;
};

export const getVisibleStats = (totals) =>
  Object.fromEntries(Object.entries(totals).filter(([, value]) => Math.abs(value) > STAT_EPSILON));

export const getPartById = (catalog, type, id) =>
  catalog?.parts?.[type]?.find((part) => part.id === id) || null;

export const resolveLoadoutParts = (catalog, loadout) =>
  PART_TYPES.map((type) => getPartById(catalog, type, loadout?.[type])).filter(Boolean);

export const buildComboName = (parts) => parts.map((part) => part.name).filter(Boolean).join(' / ');

export const createCombo = (catalog, loadout, name = '') => {
  const parts = resolveLoadoutParts(catalog, loadout);
  return {
    id: createId(),
    name: name.trim() || buildComboName(parts) || 'Nuovo Blade',
    parts: { ...emptyLoadout(), ...loadout },
    favorite: false,
    createdAt: new Date().toISOString(),
  };
};
