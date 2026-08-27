// Add a key here before using it in a catalog JSON file.
export const STAT_DEFINITIONS = Object.freeze({
  attack: { label: 'Attack' },
  defence: { label: 'Defence' },
  stamina: { label: 'Stamina' },
  height: { label: 'Height' },
  burst: { label: 'Burst' },
  weight: { label: 'Weight' },
});

export const STAT_KEYS = Object.freeze(Object.keys(STAT_DEFINITIONS));
export const isAllowedStat = (key) => Object.prototype.hasOwnProperty.call(STAT_DEFINITIONS, key);
