import type { Robot } from './motion';

type Pose = Pick<Robot, 'x' | 'y' | 'heading'>;
/** Offset from the eye's center and pupil velocity, both in screen coordinates. */
export interface Pupil { x: number; y: number; vx: number; vy: number }
export const PUPIL_TRAVEL = 3.2;
export const createPupil = (): Pupil => ({ x: 0, y: 0, vx: 0, vy: 0 });

function center(pose: Pose, eye: number) {
  // Match the centers of the two eye housings relative to the robot's pivot.
  const x = eye === 0 ? 10 : 9;
  const y = eye === 0 ? -8.5 : 8.5;
  const c = Math.cos(pose.heading);
  const s = Math.sin(pose.heading);
  return { x: pose.x + 29 + x * c - y * s, y: pose.y + 29 + x * s + y * c };
}

/** A loose disc in a moving circular housing: inertia, friction, and rim impacts.
 * No spring, random force, gravity, or clock-driven oscillation drives the pupil.
 * Screen coordinates preserve its momentum while the housing turns underneath it.
 */
export function stepPupil(pupil: Pupil, before: Pose, after: Pose, elapsed: number, eye: number): Pupil {
  const dt = Math.max(0, Math.min(0.05, elapsed));
  if (!dt) return { ...pupil };
  const oldCenter = center(before, eye);
  const newCenter = center(after, eye);
  const housingVx = (newCenter.x - oldCenter.x) / dt;
  const housingVy = (newCenter.y - oldCenter.y) / dt;
  const next = { ...pupil };
  const steps = Math.ceil(dt * 240);
  const h = dt / steps;
  const drag = Math.exp(-(eye === 0 ? 5 : 6.5) * h);
  for (let i = 0; i < steps; i++) {
    next.vx = housingVx + (next.vx - housingVx) * drag;
    next.vy = housingVy + (next.vy - housingVy) * drag;
    next.x += (next.vx - housingVx) * h;
    next.y += (next.vy - housingVy) * h;
    const distance = Math.hypot(next.x, next.y);
    if (distance > PUPIL_TRAVEL) {
      const nx = next.x / distance;
      const ny = next.y / distance;
      next.x = nx * PUPIL_TRAVEL;
      next.y = ny * PUPIL_TRAVEL;
      const outwardSpeed = (next.vx - housingVx) * nx + (next.vy - housingVy) * ny;
      if (outwardSpeed > 0) {
        // An inelastic impulse from the moving rim; low-speed contact rests.
        const restitution = outwardSpeed < 1 ? 0 : 0.38;
        next.vx -= (1 + restitution) * outwardSpeed * nx;
        next.vy -= (1 + restitution) * outwardSpeed * ny;
      }
    }
  }
  return next;
}

/** Convert the screen-space offset into the rotating robot's local CSS axes. */
export function pupilOffset(pupil: Pupil, heading: number) {
  const c = Math.cos(heading);
  const s = Math.sin(heading);
  return { x: pupil.x * c + pupil.y * s, y: -pupil.x * s + pupil.y * c };
}
