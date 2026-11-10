import type { SpindleFrontendContext } from 'lumiverse-spindle-types';
import { clampRobot, createRobot, stepRobot, type Bounds } from './motion';
import { STYLES } from './styles';
import { mountGooglySettings } from './googly';
import { createPupil, pupilOffset, stepPupil } from './eye-physics';

export function setup(ctx: SpindleFrontendContext): () => void {
  const mount = ctx.ui.mountApp({ position: 'app-overlay' });
  const removeStyle = ctx.dom.addStyle(STYLES);
  const stage = ctx.dom.createElement('div', { class: 'lumi-roomba-stage', 'aria-hidden': 'true' });
  const robot = ctx.dom.createElement('div', { class: 'lumi-roomba' });
  // All artwork is extension-owned DOM; no assets, network, or injected scripts.
  const brush = ctx.dom.createElement('div', { class: 'lumi-roomba-brush' });
  for (let i = 0; i < 3; i++) brush.append(ctx.dom.createElement('i'));
  const body = ctx.dom.createElement('div', { class: 'lumi-roomba-body' });
  for (const part of ['bumper', 'plate', 'clean', 'sensor', 'led']) {
    body.append(ctx.dom.createElement('div', { class: `lumi-roomba-${part}` }));
  }
  const pupilElements: HTMLElement[] = [];
  const eyes = ctx.dom.createElement('div', { class: 'lumi-roomba-eyes' });
  for (let i = 0; i < 2; i++) {
    const eye = ctx.dom.createElement('div', { class: 'lumi-roomba-eye' });
    const pupil = ctx.dom.createElement('div', { class: 'lumi-roomba-pupil' });
    pupilElements.push(pupil);
    eye.append(pupil);
    eyes.append(eye);
  }
  robot.append(brush, body, eyes);
  stage.append(robot);
  mount.root.append(stage);
  const removeGooglySettings = mountGooglySettings(ctx, robot);

  const viewport = window.visualViewport;
  const bounds = (): Bounds => ({ left: viewport?.offsetLeft ?? 0, top: viewport?.offsetTop ?? 0, width: viewport?.width ?? window.innerWidth, height: viewport?.height ?? window.innerHeight });
  let state = createRobot(bounds());
  let pupils = [createPupil(), createPupil()];
  let frame: number | null = null;
  let previous: number | null = null;
  let disposed = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const paint = () => {
    robot.style.transform = `translate3d(${state.x}px,${state.y}px,0) rotate(${state.heading}rad)`;
    pupilElements.forEach((element, index) => {
      const offset = pupilOffset(pupils[index]!, state.heading);
      element.style.transform = `translate(${offset.x}px,${offset.y}px)`;
    });
  };
  const tick = (now: number) => {
    frame = null;
    if (disposed) return;
    const elapsed = previous === null ? 0 : (now - previous) / 1000;
    const before = state;
    state = stepRobot(state, bounds(), elapsed);
    pupils = robot.classList.contains('lumi-roomba-googly')
      ? pupils.map((pupil, index) => stepPupil(pupil, before, state, elapsed, index))
      : [createPupil(), createPupil()];
    previous = now;
    paint();
    frame = window.requestAnimationFrame(tick);
  };
  const sync = () => {
    if (disposed) return;
    if (frame !== null) window.cancelAnimationFrame(frame);
    frame = null;
    previous = null;
    state = clampRobot(state, bounds());
    // Viewport changes and resuming a tab are relocations, not physical impacts.
    pupils = pupils.map(pupil => ({ ...pupil, vx: 0, vy: 0 }));
    paint();
    const paused = document.hidden || reducedMotion.matches;
    stage.toggleAttribute('data-paused', paused);
    if (!paused) frame = window.requestAnimationFrame(tick);
  };
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('resize', sync);
  viewport?.addEventListener('resize', sync);
  viewport?.addEventListener('scroll', sync);
  reducedMotion.addEventListener('change', sync);
  sync();
  return () => {
    if (disposed) return;
    disposed = true;
    if (frame !== null) window.cancelAnimationFrame(frame);
    document.removeEventListener('visibilitychange', sync);
    window.removeEventListener('resize', sync);
    viewport?.removeEventListener('resize', sync);
    viewport?.removeEventListener('scroll', sync);
    reducedMotion.removeEventListener('change', sync);
    removeGooglySettings();
    stage.remove();
    removeStyle();
    mount.destroy();
  };
}
