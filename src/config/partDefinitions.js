export const PART_TYPES = ['blade', 'ratchet', 'bit', 'lock_cip', 'subBlade'];

export const PART_DEFINITIONS = Object.freeze({
  blade: { label: 'Blade', required: true },
  ratchet: { label: 'Ratchet', required: true },
  bit: { label: 'Bit', required: true },
  lock_cip: { label: 'Lock Cip', required: false },
  subBlade: { label: 'Sub Blade', required: false },
});

export const REQUIRED_PART_TYPES = Object.freeze(PART_TYPES.filter((type) => PART_DEFINITIONS[type].required));
export const OPTIONAL_PART_TYPES = Object.freeze(PART_TYPES.filter((type) => !PART_DEFINITIONS[type].required));

export const createEmptyLoadout = () => Object.fromEntries(PART_TYPES.map((type) => [type, '']));
