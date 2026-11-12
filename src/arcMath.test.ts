import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ITEMS,
  mod,
  shortestArcOffset,
  getXS,
  xAt,
  computeCardFrame,
} from './arcMath';

test('ITEMS contains 5 garments with 4 colors each', () => {
  assert.equal(ITEMS.length, 5);
  for (const item of ITEMS) {
    assert.equal(item.c.length, 4);
    assert.ok(item.p > 0);
  }
});

test('mod handles positive and negative values', () => {
  assert.equal(mod(-1, 5), 4);
  assert.equal(mod(6, 5), 1);
  assert.equal(mod(0, 5), 0);
});

test('shortestArcOffset wraps around 10-card loop in [-5, 5)', () => {
  assert.equal(shortestArcOffset(0, 0), 0);
  assert.equal(shortestArcOffset(9, 0), -1);
  assert.equal(shortestArcOffset(0, 9), 1);
  assert.equal(shortestArcOffset(5, 0), -5);
});

test('xAt interpolates linearly across XS table', () => {
  const xs = getXS(1000);
  assert.equal(xAt(0, xs), 0);
  assert.equal(xAt(1, xs), 215);
  assert.ok(Math.abs(xAt(0.5, xs) - 107.5) < 1e-6);
  assert.ok(Math.abs(xAt(10, xs) - 520) < 1e-6);
});

test('computeCardFrame hides center card behind model and shows neighbors', () => {
  const center = computeCardFrame({
    cardIndex: 0,
    pos: 0,
    width: 1440,
    height: 900,
    intro: 1,
    timeSec: 0,
    seed: 0,
    sx: 0,
    sy: 0,
    reducedMotion: true,
  });
  assert.equal(center.visible, false);
  assert.equal(center.zIndex, 1);
  assert.equal(center.z, -260);

  const rightNeighbor = computeCardFrame({
    cardIndex: 1,
    pos: 0,
    width: 1440,
    height: 900,
    intro: 1,
    timeSec: 0,
    seed: 0,
    sx: 0,
    sy: 0,
    reducedMotion: true,
  });
  assert.equal(rightNeighbor.visible, true);
  assert.equal(rightNeighbor.zIndex, 90);
  assert.equal(rightNeighbor.scale, 1);
  assert.equal(rightNeighbor.blur, 0);
  assert.ok(rightNeighbor.x > 0);
  assert.equal(rightNeighbor.ry, -16);
});

test('computeCardFrame fades far-edge cards beyond 3.4 and blurs beyond 1.6', () => {
  const far = computeCardFrame({
    cardIndex: 4,
    pos: 0,
    width: 1440,
    height: 900,
    intro: 1,
    timeSec: 0,
    seed: 0,
    sx: 0,
    sy: 0,
    reducedMotion: true,
  });
  assert.ok(far.blur > 0);
  assert.ok(far.opacity < 0.3 && far.opacity > 0.2);

  const edge = computeCardFrame({
    cardIndex: 5,
    pos: 0,
    width: 1440,
    height: 900,
    intro: 1,
    timeSec: 0,
    seed: 0,
    sx: 0,
    sy: 0,
    reducedMotion: true,
  });
  assert.equal(edge.visible, false);
});
