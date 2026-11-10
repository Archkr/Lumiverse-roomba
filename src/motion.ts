export const SIZE = 58;
export const MARGIN = 8;
const SPEED = 32;
const TURN_SPEED = 2.4;
const TAU = Math.PI * 2;
export interface Bounds { left: number; top: number; width: number; height: number }
export interface Robot { x: number; y: number; heading: number; target: number; wanderIn: number }

function limits(bounds: Bounds) {
  const left = bounds.left + Math.min(MARGIN, Math.max(0, (bounds.width - SIZE) / 2));
  const top = bounds.top + Math.min(MARGIN, Math.max(0, (bounds.height - SIZE) / 2));
  return { left, top, right: Math.max(left, bounds.left + bounds.width - SIZE - MARGIN), bottom: Math.max(top, bounds.top + bounds.height - SIZE - MARGIN) };
}
export function clampRobot(robot: Robot, bounds: Bounds): Robot {
  const box = limits(bounds);
  return { ...robot, x: Math.max(box.left, Math.min(box.right, robot.x)), y: Math.max(box.top, Math.min(box.bottom, robot.y)) };
}
export function createRobot(bounds: Bounds): Robot {
  return clampRobot({ x: bounds.left + bounds.width * 0.65, y: bounds.top + bounds.height * 0.75, heading: -2.5, target: -2.5, wanderIn: 5 }, bounds);
}
/** Facing zero means right. Turn in place after a bump, then drive forward. */
export function stepRobot(robot: Robot, bounds: Bounds, elapsed: number, random = Math.random): Robot {
  const next = clampRobot(robot, bounds);
  const dt = Math.max(0, Math.min(0.05, elapsed));
  const delta = Math.atan2(Math.sin(next.target - next.heading), Math.cos(next.target - next.heading));
  if (Math.abs(delta) > 0.015) {
    next.heading += Math.sign(delta) * Math.min(Math.abs(delta), TURN_SPEED * dt);
    return next;
  }
  next.wanderIn -= dt;
  if (next.wanderIn <= 0) {
    next.target = next.heading + (random() - 0.5) * 1.5;
    next.wanderIn = 4 + random() * 6;
  }
  const box = limits(bounds);
  const dx = Math.cos(next.heading);
  const dy = Math.sin(next.heading);
  const x = next.x + dx * SPEED * dt;
  const y = next.y + dy * SPEED * dt;
  const hitX = x < box.left || x > box.right;
  const hitY = y < box.top || y > box.bottom;
  if (hitX || hitY) {
    // Aiming toward the interior also unsticks corners and resized viewports.
    const inward = Math.atan2((box.top + box.bottom) / 2 - next.y, (box.left + box.right) / 2 - next.x);
    next.target = inward + (random() - 0.5) * 0.7;
    next.wanderIn = 3 + random() * 5;
  } else {
    next.x = x;
    next.y = y;
  }
  // Keep long-running angles small without changing the intended direction.
  if (Math.abs(next.heading) > TAU * 10) {
    next.target -= Math.trunc(next.heading / TAU) * TAU;
    next.heading %= TAU;
  }
  return next;
}
