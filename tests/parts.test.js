import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPartsForSystem,
  getSystemTypes,
  getRequiredPartTypes,
  getOptionalPartTypes,
  getVisibleStats,
  sumStats,
  isLoadoutComplete,
  createBeyblade,
} from '../src/domain/parts.js';

const catalog = {
  systems: {
    BX: { slots: {
      blade: { enabled: true, required: true },
      ratchet: { enabled: true, required: true },
      bit: { enabled: true, required: true },
      lock_cip: { enabled: false, required: false },
      subBlade: { enabled: false, required: false },
    }},
    UX: { slots: {
      blade: { enabled: true, required: true },
      ratchet: { enabled: true, required: true },
      bit: { enabled: true, required: true },
      lock_cip: { enabled: false, required: false },
      subBlade: { enabled: true, required: false },
    }},
  },
  parts: {
    blade: [
      { id: 'roar_tyranno', name: 'Roar Tyranno', system: 'BX', stats: { attack: 80, defence: 0 } },
      { id: 'ux_blade', name: 'UX Blade', system: 'UX', stats: { attack: 40 } },
    ],
    ratchet: [
      { id: '3-60', name: '3-60', system: 'BX', stats: { attack: 20, defence: 20 } },
      { id: '5-60', name: '5-60', system: 'UX', stats: { stamina: 10 } },
    ],
    bit: [
      { id: 'B', name: 'Ball', system: 'BX', stats: { attack: 0, defence: 5, stamina: 55 } },
      { id: 'GN', name: 'Gear Needle', system: 'UX', stats: { stamina: 8 } },
    ],
    lock_cip: [],
    subBlade: [{ id: 'T', name: 'Twin Layer', system: 'UX', stats: { burst: 3 } }],
  },
};

test('system slot metadata controls enabled, required and optional parts', () => {
  assert.deepEqual(getSystemTypes(catalog, 'BX'), ['blade', 'ratchet', 'bit']);
  assert.deepEqual(getSystemTypes(catalog, 'UX'), ['blade', 'ratchet', 'bit', 'subBlade']);
  assert.deepEqual(getRequiredPartTypes(catalog, 'UX'), ['blade', 'ratchet', 'bit']);
  assert.deepEqual(getOptionalPartTypes(catalog, 'UX'), ['subBlade']);
});

test('parts are filtered by system', () => {
  assert.deepEqual(getPartsForSystem(catalog, 'blade', 'BX').map((p) => p.id), ['roar_tyranno']);
  assert.deepEqual(getPartsForSystem(catalog, 'blade', 'UX').map((p) => p.id), ['ux_blade']);
});

test('stats sum across 3 to 5 parts and zero totals are hidden', () => {
  const parts = [catalog.parts.blade[0], catalog.parts.ratchet[0], catalog.parts.bit[0]];
  const totals = sumStats(parts);
  assert.deepEqual(totals, { attack: 100, defence: 25, stamina: 55 });
  assert.deepEqual(getVisibleStats(totals), { attack: 100, defence: 25, stamina: 55 });
  assert.deepEqual(getVisibleStats(sumStats([{ stats: { attack: 10 } }, { stats: { attack: -10 } }])), {});
});

test('optional subBlade can extend a valid UX loadout', () => {
  const loadout = { system: 'UX', blade: 'ux_blade', ratchet: '5-60', bit: 'GN', subBlade: 'T' };
  assert.equal(isLoadoutComplete(catalog, loadout, 'UX'), true);
  const beyblade = createBeyblade(catalog, loadout, 'UX test');
  assert.equal(beyblade.system, 'UX');
  assert.equal(beyblade.parts.subBlade, 'T');
});

test('Beyblade stores references, not duplicated stats', () => {
  const beyblade = createBeyblade(catalog, {
    system: 'BX', blade: 'roar_tyranno', ratchet: '3-60', bit: 'B', lock_cip: '', subBlade: ''
  }, 'Roar Tyranno');
  assert.equal(Object.prototype.hasOwnProperty.call(beyblade, 'stats'), false);
  assert.deepEqual(beyblade.parts, { blade: 'roar_tyranno', ratchet: '3-60', bit: 'B', lock_cip: '', subBlade: '' });
});
