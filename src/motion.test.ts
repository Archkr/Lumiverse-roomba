import { describe, expect, test } from 'bun:test';
import { clampRobot, createRobot, stepRobot } from './motion';

const bounds = { left: 0, top: 0, width: 390, height: 844 };
describe('Roomba movement', () => {
  test('drives at the same speed at different refresh rates', () => {
    const initial = { ...createRobot(bounds), x: 100, y: 100, heading: 0, target: 0 };
    let slow = initial;
    let fast = initial;
    for (let i = 0; i < 30; i++) slow = stepRobot(slow, bounds, 1 / 30);
    for (let i = 0; i < 120; i++) fast = stepRobot(fast, bounds, 1 / 120);
    expect(slow.x).toBeCloseTo(132);
    expect(fast.x).toBeCloseTo(slow.x);
  });
  test('bumps, turns in place, and escapes a corner', () => {
    let robot = { x: 8, y: 8, heading: -2.4, target: -2.4, wanderIn: 5 };
    robot = stepRobot(robot, bounds, 0.05, () => 0.5);
    expect(robot.x).toBe(8);
    expect(robot.y).toBe(8);
    expect(robot.target).toBeGreaterThan(0);
    const turning = stepRobot(robot, bounds, 0.05);
    expect(turning.x).toBe(robot.x);
    expect(turning.heading).not.toBe(robot.heading);
    for (let i = 0; i < 100; i++) robot = stepRobot(robot, bounds, 0.05, () => 0.5);
    expect(robot.x).toBeGreaterThan(8);
    expect(robot.y).toBeGreaterThan(8);
  });
  test('stays in bounds over a long deterministic run', () => {
    let robot = createRobot(bounds);
    let seed = 3;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
    for (let i = 0; i < 50000; i++) {
      robot = stepRobot(robot, bounds, 1 / 60, random);
      expect(robot.x).toBeGreaterThanOrEqual(8);
      expect(robot.x).toBeLessThanOrEqual(324);
      expect(robot.y).toBeGreaterThanOrEqual(8);
      expect(robot.y).toBeLessThanOrEqual(778);
    }
  });
  test('clamps after viewport and keyboard changes', () => {
    const robot = clampRobot({ ...createRobot(bounds), x: 900, y: 900 }, { left: 10, top: 100, width: 250, height: 300 });
    expect(robot.x).toBe(194);
    expect(robot.y).toBe(334);
  });
  test('handles tiny viewports and caps elapsed time after suspension', () => {
    const robot = createRobot({ left: 0, top: 0, width: 30, height: 30 });
    expect(robot.x).toBe(0);
    expect(robot.y).toBe(0);
    const initial = { ...createRobot(bounds), heading: 0, target: 0 };
    expect(stepRobot(initial, bounds, 100).x - initial.x).toBeCloseTo(1.6);
  });
});
