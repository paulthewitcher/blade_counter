import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createBeyblade,
  emptyLoadout,
  getVisibleStats,
  isLoadoutComplete,
  normalizeDetails,
  normalizeStats,
  resolveLoadoutParts,
  sumStats,
} from '../src/domain/parts.js';

test('sums whitelist stats across 3 to 5 parts', () => {
  const result = sumStats([
    { stats: { attack: 80, stamina: 30 } },
    { stats: { attack: 20, stamina: 20 } },
    { stats: { attack: 0, stamina: 5 } },
    { stats: { burst: 2 } },
    { stats: { weight: 3 } },
  ]);

  assert.deepEqual(result, { attack: 100, stamina: 55, burst: 2, weight: 3 });
});

test('rejects stats outside the whitelist', () => {
  assert.deepEqual(
    normalizeStats({ attack: 10, defence: 5, custom_stat: 99, stamina: 'not-a-number' }),
    { attack: 10, defence: 5 },
  );
});

test('details use their own whitelist and remain separate from stats', () => {
  assert.deepEqual(
    normalizeDetails({ type: 'balance', 'spin direction': 'right', attack: 20 }),
    { type: 'balance', 'spin direction': 'right' },
  );
});

test('zero totals are hidden from the preview', () => {
  assert.deepEqual(getVisibleStats({ attack: 15, defence: 0, stamina: -0 }), { attack: 15 });
});

test('loadout supports three required parts plus two optional parts', () => {
  const loadout = emptyLoadout();
  assert.deepEqual(loadout, { blade: '', ratchet: '', bit: '', lock_cip: '', subBlade: '' });
  assert.equal(isLoadoutComplete(loadout), false);

  loadout.blade = 'blade-1';
  loadout.ratchet = 'ratchet-1';
  loadout.bit = 'bit-1';
  assert.equal(isLoadoutComplete(loadout), true);
});

test('resolved parts can include optional lock_cip and subBlade', () => {
  const catalog = { parts: {
    blade: [{ id: 'b', name: 'Blade', stats: { attack: 80 } }],
    ratchet: [{ id: 'r', name: 'Ratchet', stats: { attack: 20 } }],
    bit: [{ id: 't', name: 'Bit', stats: { stamina: 55 } }],
    lock_cip: [{ id: 'l', name: 'Lock Cip', stats: { burst: 2 } }],
    subBlade: [{ id: 's', name: 'Sub Blade', stats: { defence: 5 } }],
  }};
  const parts = resolveLoadoutParts(catalog, { blade: 'b', ratchet: 'r', bit: 't', lock_cip: 'l', subBlade: 's' });
  assert.equal(parts.length, 5);
  assert.deepEqual(sumStats(parts), { attack: 100, stamina: 55, burst: 2, defence: 5 });
});

test('createBeyblade stores only stable part references', () => {
  const catalog = { parts: { blade: [{ id: 'b', name: 'Blade' }], ratchet: [{ id: 'r', name: 'Ratchet' }], bit: [{ id: 't', name: 'Bit' }], lock_cip: [], subBlade: [] } };
  const beyblade = createBeyblade(catalog, { blade: 'b', ratchet: 'r', bit: 't' }, 'My Beyblade');
  assert.equal(beyblade.name, 'My Beyblade');
  assert.deepEqual(beyblade.parts, { ...emptyLoadout(), blade: 'b', ratchet: 'r', bit: 't' });
  assert.equal('stats' in beyblade, false);
});
