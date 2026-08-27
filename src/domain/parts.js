import { isAllowedDetail } from '../config/details.js';
import { PART_DEFINITIONS, PART_TYPES, createEmptyLoadout } from '../config/partDefinitions.js';
import { STAT_KEYS, isAllowedStat } from '../config/stats.js';

export const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
export const STAT_EPSILON = 0.000001;
export const PART_TYPE_DEFINITIONS = PART_DEFINITIONS;
export const emptyLoadout = createEmptyLoadout;
export { PART_TYPES };

export const normalizeStats = (stats) => {
  if (!stats || typeof stats !== 'object') return {};

  return Object.fromEntries(
    Object.entries(stats)
      .filter(([key]) => isAllowedStat(key))
      .map(([key, value]) => [key, Number(value)])
      .filter(([, value]) => Number.isFinite(value))
  );
};

export const normalizeDetails = (details) => {
  if (!details || typeof details !== 'object') return {};

  return Object.fromEntries(
    Object.entries(details)
      .filter(([key]) => isAllowedDetail(key))
      .map(([key, value]) => [key, value == null ? '' : String(value)])
  );
};

export const normalizeTags = (tags) =>
  Array.isArray(tags) ? tags.map(String).map((tag) => tag.trim()).filter(Boolean) : [];

export const normalizePart = (part) => ({
  ...part,
  stats: normalizeStats(part?.stats),
  details: normalizeDetails(part?.details),
  tags: normalizeTags(part?.tags),
});

export const getAllStatKeys = (parts) => {
  const keys = new Set();
  for (const part of parts) {
    for (const key of Object.keys(normalizeStats(part?.stats))) keys.add(key);
  }
  return STAT_KEYS.filter((key) => keys.has(key));
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
  Object.fromEntries(
    getAllStatKeys([{ stats: totals }])
      .map((key) => [key, totals[key]])
      .filter(([, value]) => Math.abs(value) > STAT_EPSILON)
  );

export const getPartById = (catalog, type, id) =>
  catalog?.parts?.[type]?.find((part) => part.id === id) || null;

export const resolveLoadoutParts = (catalog, loadout) =>
  PART_TYPES.map((type) => getPartById(catalog, type, loadout?.[type])).filter(Boolean);

export const getRequiredPartTypes = () =>
  PART_TYPES.filter((type) => PART_DEFINITIONS[type].required);

export const getOptionalPartTypes = () =>
  PART_TYPES.filter((type) => !PART_DEFINITIONS[type].required);

export const isLoadoutComplete = (loadout) =>
  getRequiredPartTypes().every((type) => Boolean(loadout?.[type]));

export const countSelectedParts = (loadout) =>
  PART_TYPES.filter((type) => Boolean(loadout?.[type])).length;

export const buildBeybladeName = (parts) =>
  parts.map((part) => part.name).filter(Boolean).join(' / ');

export const createBeyblade = (catalog, loadout, name = '') => {
  const normalizedLoadout = { ...emptyLoadout(), ...loadout };
  const parts = resolveLoadoutParts(catalog, normalizedLoadout);

  return {
    id: createId(),
    name: name.trim() || buildBeybladeName(parts) || 'Nuovo Beyblade',
    parts: normalizedLoadout,
    favorite: false,
    createdAt: new Date().toISOString(),
  };
};
