import test from 'node:test';
import assert from 'node:assert/strict';
import { getVisibleStats, sumStats } from '../src/domain/parts.js';

test('sums arbitrary stats across parts', () => {
  const result = sumStats([
    { stats: { attack: 10, defense: 2 } },
    { stats: { attack: 5, stamina: 7 } },
    { stats: { defense: 3, burst: 1 } },
  ]);
  assert.deepEqual(result, { attack: 15, defense: 5, stamina: 7, burst: 1 });
});

test('zero totals are hidden from the preview', () => {
  assert.deepEqual(getVisibleStats({ attack: 15, defense: 0, stamina: -0 }), { attack: 15 });
});
