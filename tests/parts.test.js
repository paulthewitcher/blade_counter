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
import { getEnabledPartTypes, getPartsForSystem } from '../src/domain/systems.js';

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

test('system controls which part categories are available', () => {
  const catalog = {
    systems: {
      BX: { slots: {
        blade: { enabled: true, required: true },
        ratchet: { enabled: true, required: true },
        bit: { enabled: true, required: true },
        lock_cip: { enabled: true, required: false },
        subBlade: { enabled: true, required: false },
      }},
      UX: { slots: {
        blade: { enabled: true, required: true },
        ratchet: { enabled: true, required: true },
        bit: { enabled: true, required: true },
        lock_cip: { enabled: true, required: true },
        subBlade: { enabled: false, required: false },
      }},
    },
    parts: {
      blade: [{ id: 'b1', name: 'Blade 1' }, { id: 'b2', name: 'Blade 2' }],
      ratchet: [{ id: 'r1', name: 'Ratchet 1' }],
      bit: [{ id: 'bit1', name: 'Bit 1' }],
      lock_cip: [{ id: 'l1', name: 'Lock 1' }],
      subBlade: [{ id: 's1', name: 'Sub 1' }],
    },
  };

  assert.deepEqual(getEnabledPartTypes(catalog.systems.BX), ['blade', 'ratchet', 'bit', 'lock_cip', 'subBlade']);
  assert.deepEqual(getEnabledPartTypes(catalog.systems.UX), ['blade', 'ratchet', 'bit', 'lock_cip']);
  assert.equal(getPartsForSystem(catalog, 'UX', 'blade').length, 2);
  assert.equal(getPartsForSystem(catalog, 'UX', 'subBlade').length, 0);
});

test('loadout completeness follows the selected system', () => {
  const catalog = {
    systems: {
      UX: { slots: {
        blade: { enabled: true, required: true },
        ratchet: { enabled: true, required: true },
        bit: { enabled: true, required: true },
        lock_cip: { enabled: true, required: true },
        subBlade: { enabled: false, required: false },
      }},
    },
    parts: {},
  };

  const loadout = emptyLoadout();
  loadout.blade = 'b';
  loadout.ratchet = 'r';
  loadout.bit = 't';
  assert.equal(isLoadoutComplete(catalog, 'UX', loadout), false);
  loadout.lock_cip = 'l';
  assert.equal(isLoadoutComplete(catalog, 'UX', loadout), true);
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

test('createBeyblade stores system and only stable part references', () => {
  const catalog = {
    systems: {
      BX: { slots: {
        blade: { enabled: true, required: true },
        ratchet: { enabled: true, required: true },
        bit: { enabled: true, required: true },
      }},
    },
    parts: { blade: [{ id: 'b', name: 'Blade' }], ratchet: [{ id: 'r', name: 'Ratchet' }], bit: [{ id: 't', name: 'Bit' }], lock_cip: [], subBlade: [] },
  };
  const beyblade = createBeyblade(catalog, 'BX', { blade: 'b', ratchet: 'r', bit: 't' }, 'My Beyblade');
  assert.equal(beyblade.name, 'My Beyblade');
  assert.equal(beyblade.system, 'BX');
  assert.deepEqual(beyblade.parts, { ...emptyLoadout(), blade: 'b', ratchet: 'r', bit: 't' });
  assert.equal('stats' in beyblade, false);
});


test('anagraphic parts do not contain a system assignment', async () => {
  const fs = await import('node:fs/promises');
  for (const filename of ['blades.json', 'ratchets.json', 'bits.json', 'lock_cips.json', 'sub_blades.json']) {
    const raw = await fs.readFile(new URL(`../catalog/${filename}`, import.meta.url), 'utf8');
    const catalogFile = JSON.parse(raw);
    for (const part of catalogFile.parts) {
      assert.equal('system' in part, false);
      assert.equal('systems' in part, false);
    }
  }
});


test('createBeyblade generates a fresh id for edited configurations', () => {
  const catalog = {
    systems: { BX: { slots: {
      blade: { enabled: true, required: true },
      ratchet: { enabled: true, required: true },
      bit: { enabled: true, required: true },
    }}},
    parts: {
      blade: [{ id: 'b', name: 'Blade' }],
      ratchet: [{ id: 'r', name: 'Ratchet' }],
      bit: [{ id: 't', name: 'Bit' }],
      lock_cip: [], subBlade: [],
    },
  };
  const original = createBeyblade(catalog, 'BX', { blade: 'b', ratchet: 'r', bit: 't' }, 'Original');
  const edited = createBeyblade(catalog, 'BX', original.parts, 'Edited');
  assert.notEqual(edited.id, original.id);
  assert.equal(edited.name, 'Edited');
  assert.deepEqual(edited.parts, original.parts);
});


test('app version is sourced from package.json', async () => {
  const fs = await import('node:fs/promises');
  const raw = JSON.parse(await fs.readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const appModule = await import('../src/config/app.js');
  assert.equal(appModule.APP_VERSION, raw.version);
});


test('favorite state uses isFavorite with legacy favorite migration support', async () => {
  const fs = await import('node:fs/promises');
  const raw = await fs.readFile(new URL('../src/domain/storage.js', import.meta.url), 'utf8');
  assert.match(raw, /isFavorite/);
  assert.match(raw, /favorite/);
});

test('migrated beyblades preserve their system after reload', async () => {
  const { migrateAppData } = await import('../src/domain/storage.js');
  const migrated = migrateAppData({
    schemaVersion: 2,
    beyblades: [{
      id: 'bb1',
      name: 'Roar Tyranno',
      system: 'UX',
      parts: { blade: 'blade1', ratchet: 'ratchet1', bit: 'bit1', lock_cip: 'lock1', subBlade: '' },
      isFavorite: true,
    }],
  });

  assert.equal(migrated.beyblades[0].system, 'UX');
  assert.equal(migrated.beyblades[0].parts.blade, 'blade1');
  assert.equal(migrated.beyblades[0].isFavorite, true);
});

