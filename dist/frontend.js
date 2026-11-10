// src/motion.ts
var SIZE = 58;
var MARGIN = 8;
var SPEED = 32;
var TURN_SPEED = 2.4;
var TAU = Math.PI * 2;
function limits(bounds) {
  const left = bounds.left + Math.min(MARGIN, Math.max(0, (bounds.width - SIZE) / 2));
  const top = bounds.top + Math.min(MARGIN, Math.max(0, (bounds.height - SIZE) / 2));
  return { left, top, right: Math.max(left, bounds.left + bounds.width - SIZE - MARGIN), bottom: Math.max(top, bounds.top + bounds.height - SIZE - MARGIN) };
}
function clampRobot(robot, bounds) {
  const box = limits(bounds);
  return { ...robot, x: Math.max(box.left, Math.min(box.right, robot.x)), y: Math.max(box.top, Math.min(box.bottom, robot.y)) };
}
function createRobot(bounds) {
  return clampRobot({ x: bounds.left + bounds.width * 0.65, y: bounds.top + bounds.height * 0.75, heading: -2.5, target: -2.5, wanderIn: 5 }, bounds);
}
function stepRobot(robot, bounds, elapsed, random = Math.random) {
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
    const inward = Math.atan2((box.top + box.bottom) / 2 - next.y, (box.left + box.right) / 2 - next.x);
    next.target = inward + (random() - 0.5) * 0.7;
    next.wanderIn = 3 + random() * 5;
  } else {
    next.x = x;
    next.y = y;
  }
  if (Math.abs(next.heading) > TAU * 10) {
    next.target -= Math.trunc(next.heading / TAU) * TAU;
    next.heading %= TAU;
  }
  return next;
}

// src/styles.ts
var STYLES = `
.lumi-roomba-stage { position:fixed; inset:0; z-index:40; pointer-events:none; overflow:hidden; }
.lumi-roomba { position:absolute; left:0; top:0; width:58px; height:58px; pointer-events:none; will-change:transform; }
.lumi-roomba-body { position:absolute; inset:5px; border-radius:50%; background:radial-gradient(ellipse at 33% 23%,#52585b 0%,#292d30 42%,#17191b 76%); border:2px solid #0c0e0f; box-shadow:0 3px 5px #0006,inset 0 0 0 2px #747a7c,inset 0 0 0 5px #222629; }
.lumi-roomba-bumper { position:absolute; inset:1px; border:3px solid transparent; border-right-color:#969d9f; border-radius:50%; }
.lumi-roomba-plate { position:absolute; inset:9px; border-radius:50%; background:linear-gradient(135deg,#4c5255,#262a2c 55%,#3c4245); border:1px solid #62696b; box-shadow:inset 0 1px 2px #aaa3; }
.lumi-roomba-clean { position:absolute; left:14px; top:14px; width:16px; height:16px; border:1px solid #8b9e88; border-radius:50%; background:radial-gradient(circle,#424c3d,#252d23); box-shadow:0 0 3px #a3d38b44; }
.lumi-roomba-clean::after { content:'CLEAN'; position:absolute; inset:0; display:grid; place-items:center; font:3px/1 sans-serif; letter-spacing:.3px; color:#d7e8d1; }
.lumi-roomba-sensor { position:absolute; right:3px; top:17px; width:5px; height:10px; border-radius:3px; background:#080b0c; box-shadow:inset -1px 0 1px #798285; }
.lumi-roomba-led { position:absolute; left:11px; top:20px; width:2px; height:4px; border-radius:2px; background:#a8ec83; box-shadow:0 0 3px #91df6c; }
.lumi-roomba-brush { position:absolute; width:18px; height:18px; left:36px; top:36px; animation:lumi-roomba-sweep .65s linear infinite; }
.lumi-roomba-brush i { position:absolute; top:8px; left:7px; height:2px; width:12px; background:linear-gradient(90deg,#565b58,#bbbda8); border-radius:2px; transform-origin:2px 1px; }
.lumi-roomba-brush i:nth-child(2) { transform:rotate(120deg); }
.lumi-roomba-brush i:nth-child(3) { transform:rotate(240deg); }
.lumi-roomba-stage[data-paused] .lumi-roomba-brush { animation-play-state:paused; }
@keyframes lumi-roomba-sweep { to { transform:rotate(360deg); } }
@media (prefers-reduced-motion:reduce) { .lumi-roomba-brush { animation:none; } }
`;

// src/frontend.ts
function setup(ctx) {
  const mount = ctx.ui.mountApp({ position: "app-overlay" });
  const removeStyle = ctx.dom.addStyle(STYLES);
  const stage = ctx.dom.createElement("div", { class: "lumi-roomba-stage", "aria-hidden": "true" });
  const robot = ctx.dom.createElement("div", { class: "lumi-roomba" });
  const brush = ctx.dom.createElement("div", { class: "lumi-roomba-brush" });
  for (let i = 0;i < 3; i++)
    brush.append(ctx.dom.createElement("i"));
  const body = ctx.dom.createElement("div", { class: "lumi-roomba-body" });
  for (const part of ["bumper", "plate", "clean", "sensor", "led"]) {
    body.append(ctx.dom.createElement("div", { class: `lumi-roomba-${part}` }));
  }
  robot.append(brush, body);
  stage.append(robot);
  mount.root.append(stage);
  const viewport = window.visualViewport;
  const bounds = () => ({ left: viewport?.offsetLeft ?? 0, top: viewport?.offsetTop ?? 0, width: viewport?.width ?? window.innerWidth, height: viewport?.height ?? window.innerHeight });
  let state = createRobot(bounds());
  let frame = null;
  let previous = null;
  let disposed = false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const paint = () => {
    robot.style.transform = `translate3d(${state.x}px,${state.y}px,0) rotate(${state.heading}rad)`;
  };
  const tick = (now) => {
    frame = null;
    if (disposed)
      return;
    state = stepRobot(state, bounds(), previous === null ? 0 : (now - previous) / 1000);
    previous = now;
    paint();
    frame = window.requestAnimationFrame(tick);
  };
  const sync = () => {
    if (disposed)
      return;
    if (frame !== null)
      window.cancelAnimationFrame(frame);
    frame = null;
    previous = null;
    state = clampRobot(state, bounds());
    paint();
    const paused = document.hidden || reducedMotion.matches;
    stage.toggleAttribute("data-paused", paused);
    if (!paused)
      frame = window.requestAnimationFrame(tick);
  };
  document.addEventListener("visibilitychange", sync);
  window.addEventListener("resize", sync);
  viewport?.addEventListener("resize", sync);
  viewport?.addEventListener("scroll", sync);
  reducedMotion.addEventListener("change", sync);
  sync();
  return () => {
    if (disposed)
      return;
    disposed = true;
    if (frame !== null)
      window.cancelAnimationFrame(frame);
    document.removeEventListener("visibilitychange", sync);
    window.removeEventListener("resize", sync);
    viewport?.removeEventListener("resize", sync);
    viewport?.removeEventListener("scroll", sync);
    reducedMotion.removeEventListener("change", sync);
    stage.remove();
    removeStyle();
    mount.destroy();
  };
}
export {
  setup
};
