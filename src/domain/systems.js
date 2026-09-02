import { PART_TYPES } from '../config/partDefinitions.js';

export const getSystem = (catalog, systemId) => catalog?.systems?.[systemId] || null;

export const getEnabledPartTypes = (system) =>
  PART_TYPES.filter((type) => system?.slots?.[type]?.enabled === true);

export const getRequiredPartTypesForSystem = (system) =>
  getEnabledPartTypes(system).filter((type) => system.slots[type].required === true);

export const getPartsForSystem = (catalog, systemId, type) => {
  const system = getSystem(catalog, systemId);
  if (!system?.slots?.[type]?.enabled) return [];
  return catalog?.parts?.[type] || [];
};

export const isLoadoutCompleteForSystem = (loadout, system) =>
  Boolean(system) && getRequiredPartTypesForSystem(system).every((type) => Boolean(loadout?.[type]));
