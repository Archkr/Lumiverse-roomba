import { expect, test } from 'bun:test';
import { createPupil, PUPIL_TRAVEL, pupilOffset, stepPupil } from './eye-physics';

const origin = { x: 100, y: 100, heading: 0 };
test('a stationary housing does not animate a resting pupil', () => {
  const resting = { ...createPupil(), x: 1.2, y: -0.7 };
  let pupil = resting;
  for (let i = 0; i < 1000; i++) pupil = stepPupil(pupil, origin, origin, 1 / 60, 0);
  expect(pupil).toEqual(resting);
});
test('starting forward leaves the loose pupil behind', () => {
  const pupil = stepPupil(createPupil(), origin, { ...origin, x: 100.5 }, 1 / 60, 0);
  expect(pupil.x).toBeLessThan(0);
  expect(pupil.vx).toBeGreaterThan(0);
  expect(pupil.vx).toBeLessThan(30);
});
test('braking carries the pupil forward and the rim bounces it back', () => {
  let pupil = { ...createPupil(), vx: 30 };
  pupil = stepPupil(pupil, origin, origin, 1 / 60, 0);
  expect(pupil.x).toBeGreaterThan(0);
  for (let i = 0; i < 20; i++) pupil = stepPupil(pupil, origin, origin, 1 / 60, 0);
  expect(pupil.vx).toBeLessThan(0);
  expect(Math.hypot(pupil.x, pupil.y)).toBeLessThanOrEqual(PUPIL_TRAVEL + 1e-10);
});
test('turning drives the two housings and pupils differently', () => {
  const turning = { ...origin, heading: 0.04 };
  const left = stepPupil(createPupil(), origin, turning, 1 / 60, 0);
  const right = stepPupil(createPupil(), origin, turning, 1 / 60, 1);
  expect(left.x).toBeLessThan(0);
  expect(right.x).toBeGreaterThan(0);
  expect(left.y).toBeLessThan(0);
  expect(right.y).toBeLessThan(0);
});
test('pupils remain inside the rims through repeated acceleration and turns', () => {
  let pose = origin;
  let pupil = createPupil();
  for (let i = 0; i < 10000; i++) {
    const next = { x: 100 + 20 * Math.sin(i * 0.03), y: 100 + 10 * Math.cos(i * 0.04), heading: i * 0.04 };
    pupil = stepPupil(pupil, pose, next, 1 / 60, 0);
    expect(Math.hypot(pupil.x, pupil.y)).toBeLessThanOrEqual(PUPIL_TRAVEL + 1e-10);
    expect(Number.isFinite(pupil.vx + pupil.vy)).toBe(true);
    pose = next;
  }
});
test('local rendering preserves screen-space inertia across rotation', () => {
  const offset = pupilOffset({ ...createPupil(), x: 2 }, Math.PI / 2);
  expect(offset.x).toBeCloseTo(0);
  expect(offset.y).toBeCloseTo(-2);
});
