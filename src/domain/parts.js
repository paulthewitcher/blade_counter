import { isAllowedDetail } from '../config/details.js';
import { PART_DEFINITIONS, PART_TYPES, createEmptyLoadout } from '../config/partDefinitions.js';
import { STAT_KEYS, isAllowedStat } from '../config/stats.js';

export const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
export const STAT_EPSILON = 0.000001;
export const PART_TYPE_DEFINITIONS = PART_DEFINITIONS;
export const emptyLoadout = createEmptyLoadout;

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

export const getSystemTypes = (catalog, system) => {
  const slots = catalog?.systems?.[system]?.slots;
  if (!slots || typeof slots !== 'object') return [];

  // The systems.json definition is the source of truth for which selectors
  // exist. Do not infer slots from the available parts or from UI state.
  return Object.entries(slots)
    .filter(([, config]) => config?.enabled === true)
    .map(([type]) => type)
    .filter((type) => PART_DEFINITIONS[type]);
};

export const getRequiredPartTypes = (catalog, system) => {
  const slots = catalog?.systems?.[system]?.slots;
  if (!slots || typeof slots !== 'object') return [];
  return Object.entries(slots)
    .filter(([, config]) => config?.enabled === true && config?.required === true)
    .map(([type]) => type)
    .filter((type) => PART_DEFINITIONS[type]);
};

export const getOptionalPartTypes = (catalog, system) =>
  getSystemTypes(catalog, system).filter((type) => !getRequiredPartTypes(catalog, system).includes(type));

export const getSystemLabel = (catalog, system) => catalog?.systems?.[system]?.label || system;

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

export const getPartsForSystem = (catalog, type, system) =>
  (catalog?.parts?.[type] || [])
    .map(normalizePart)
    .filter((part) => !part.system || part.system === system);

export const resolveLoadoutParts = (catalog, loadout, system = loadout?.system) =>
  getSystemTypes(catalog, system)
    .map((type) => getPartById(catalog, type, loadout?.[type]))
    .filter(Boolean)
    .map(normalizePart);

export const isLoadoutComplete = (catalog, loadout, system = loadout?.system) =>
  getRequiredPartTypes(catalog, system).every((type) => Boolean(loadout?.[type]));

export const countSelectedParts = (catalog, loadout, system = loadout?.system) =>
  getSystemTypes(catalog, system).filter((type) => Boolean(loadout?.[type])).length;

export const buildBeybladeName = (parts) =>
  parts.map((part) => part.name).filter(Boolean).join(' / ');

export const createBeyblade = (catalog, loadout, name = '') => {
  const normalizedLoadout = { ...emptyLoadout(), ...loadout };
  const system = normalizedLoadout.system || Object.keys(catalog.systems || {})[0] || '';
  const parts = resolveLoadoutParts(catalog, normalizedLoadout, system);

  return {
    id: createId(),
    name: name.trim() || buildBeybladeName(parts) || 'Nuovo Beyblade',
    system,
    parts: Object.fromEntries(PART_TYPES.map((type) => [type, normalizedLoadout[type] || ''])),
    favorite: false,
    createdAt: new Date().toISOString(),
  };
};
