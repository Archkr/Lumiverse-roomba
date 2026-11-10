import { expect, test } from 'bun:test';
import { createPupil, PUPIL_TRAVEL, pupilOffset, stepPupil } from './eye-physics';

const origin = { x: 100, y: 100, heading: 0 };
test('gravity pulls a centered pupil down and settles it against the rim', () => {
  let pupil = { ...createPupil(), x: 0, y: 0 };
  pupil = stepPupil(pupil, origin, origin, 1 / 60, 0);
  expect(pupil.y).toBeGreaterThan(0);
  for (let i = 0; i < 180; i++) pupil = stepPupil(pupil, origin, origin, 1 / 60, 0);
  expect(pupil.x).toBeCloseTo(0);
  expect(pupil.y).toBeCloseTo(PUPIL_TRAVEL);
  expect(pupil.vy).toBeCloseTo(0);
});
test('resting pupils stay against the bottom rim without idle oscillation', () => {
  let pupil = createPupil();
  for (let i = 0; i < 1000; i++) pupil = stepPupil(pupil, origin, origin, 1 / 60, 0);
  expect(pupil).toEqual(createPupil());
});
test('pupils start at the bottom rim even before the first physics frame', () => {
  expect(createPupil().y).toBe(PUPIL_TRAVEL);
});
test('starting forward leaves the loose pupil behind', () => {
  const pupil = stepPupil(createPupil(), origin, { ...origin, x: 100.5 }, 1 / 60, 0);
  expect(pupil.x).toBeLessThan(0);
  expect(pupil.vx).toBeGreaterThan(0);
  expect(pupil.vx).toBeLessThan(30);
});
test('braking carries the pupil forward and the rim bounces it back', () => {
  let pupil = { ...createPupil(), y: 0, vx: 30 };
  pupil = stepPupil(pupil, origin, origin, 1 / 60, 0);
  expect(pupil.x).toBeGreaterThan(0);
  let bounced = false;
  for (let i = 0; i < 30; i++) {
    pupil = stepPupil(pupil, origin, origin, 1 / 60, 0);
    if (pupil.vx < 0) bounced = true;
  }
  expect(bounced).toBe(true);
  expect(Math.hypot(pupil.x, pupil.y)).toBeLessThanOrEqual(PUPIL_TRAVEL + 1e-10);
});
test('turning drives the two housings and pupils differently', () => {
  const turning = { ...origin, heading: 0.04 };
  const left = stepPupil({ ...createPupil(), y: 0 }, origin, turning, 1 / 60, 0);
  const right = stepPupil({ ...createPupil(), y: 0 }, origin, turning, 1 / 60, 1);
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
  const offset = pupilOffset({ ...createPupil(), x: 2, y: 0 }, Math.PI / 2);
  expect(offset.x).toBeCloseTo(0);
  expect(offset.y).toBeCloseTo(-2);
});

test('gravity stays screen-down when the Roomba rotates', () => {
  const rotated = { ...origin, heading: Math.PI / 2 };
  let pupil = { ...createPupil(), x: 0, y: 0 };
  for (let i = 0; i < 180; i++) pupil = stepPupil(pupil, rotated, rotated, 1 / 60, 1);
  const local = pupilOffset(pupil, rotated.heading);
  expect(local.x).toBeCloseTo(PUPIL_TRAVEL);
  expect(local.y).toBeCloseTo(0);
});
test('off-center pupils roll down the rim instead of staying suspended', () => {
  let pupil = { ...createPupil(), x: PUPIL_TRAVEL, y: 0 };
  for (let i = 0; i < 300; i++) pupil = stepPupil(pupil, origin, origin, 1 / 60, 0);
  expect(pupil.x).toBeCloseTo(0, 1);
  expect(pupil.y).toBeCloseTo(PUPIL_TRAVEL, 1);
});
