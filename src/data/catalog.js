import systems from '../../catalog/systems.json';
import blades from '../../catalog/blades.json';
import ratchets from '../../catalog/ratchets.json';
import bits from '../../catalog/bits.json';
import lockCips from '../../catalog/lock_cips.json';
import subBlades from '../../catalog/sub_blades.json';

export const catalog = Object.freeze({
  schemaVersion: 1,
  systems: systems.systems,
  parts: {
    blade: blades.parts,
    ratchet: ratchets.parts,
    bit: bits.parts,
    lock_cip: lockCips.parts,
    subBlade: subBlades.parts,
  },
});

export default catalog;
