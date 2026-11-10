import type { SpindleFrontendContext } from 'lumiverse-spindle-types';
import { clampRobot, createRobot, stepRobot, type Bounds } from './motion';
import { STYLES } from './styles';

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
  robot.append(brush, body);
  stage.append(robot);
  mount.root.append(stage);

  const viewport = window.visualViewport;
  const bounds = (): Bounds => ({ left: viewport?.offsetLeft ?? 0, top: viewport?.offsetTop ?? 0, width: viewport?.width ?? window.innerWidth, height: viewport?.height ?? window.innerHeight });
  let state = createRobot(bounds());
  let frame: number | null = null;
  let previous: number | null = null;
  let disposed = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const paint = () => { robot.style.transform = `translate3d(${state.x}px,${state.y}px,0) rotate(${state.heading}rad)`; };
  const tick = (now: number) => {
    frame = null;
    if (disposed) return;
    state = stepRobot(state, bounds(), previous === null ? 0 : (now - previous) / 1000);
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
    stage.remove();
    removeStyle();
    mount.destroy();
  };
}
