export const PART_TYPES = ['blade', 'ratchet', 'bit', 'lock_cip', 'subBlade'];

export const PART_DEFINITIONS = Object.freeze({
  blade: { label: 'Blade' },
  ratchet: { label: 'Ratchet' },
  bit: { label: 'Bit' },
  lock_cip: { label: 'Lock Cip' },
  subBlade: { label: 'Sub Blade' },
});

export const createEmptyLoadout = () => Object.fromEntries(PART_TYPES.map((type) => [type, '']));
