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
.lumi-roomba-eyes { display:none; position:absolute; left:31px; top:12px; width:15px; height:33px; }
.lumi-roomba-googly .lumi-roomba-eyes { display:block; }
.lumi-roomba-eye { box-sizing:content-box; position:absolute; width:14px; height:15px; border:1px solid #b9bec4; border-radius:50%; background:radial-gradient(circle at 35% 25%,white 45%,#dce1e6); box-shadow:0 2px 3px #0007; }
.lumi-roomba-eye:nth-child(2) { top:17px; left:-1px; }
.lumi-roomba-pupil { position:absolute; left:3.5px; top:4px; width:7px; height:7px; border-radius:50%; background:radial-gradient(circle at 30% 25%,#fff 0 10%,#111 18%); }
.lumi-roomba-settings { padding:16px; color:var(--lumiverse-text,inherit); }
.lumi-roomba-settings h3 { margin:0 0 16px; }
.lumi-roomba-option { display:flex; align-items:center; gap:10px; min-height:44px; cursor:pointer; }
.lumi-roomba-option input { width:18px; height:18px; accent-color:var(--lumiverse-primary,#a8ec83); }
.lumi-roomba-settings p { font-size:13px; line-height:1.5; opacity:.75; }
@keyframes lumi-roomba-sweep { to { transform:rotate(360deg); } }
@media (prefers-reduced-motion:reduce) { .lumi-roomba-brush { animation:none; } }
`;

// src/googly.ts
var KEY = "roomba:googly-eyes";
function mountGooglySettings(ctx, robot) {
  const panel = ctx.dom.createElement("section", { class: "lumi-roomba-settings" });
  const heading = ctx.dom.createElement("h3");
  heading.textContent = "Roomba";
  const label = ctx.dom.createElement("label", { class: "lumi-roomba-option" });
  const toggle = ctx.dom.createElement("input", { type: "checkbox" });
  const copy = ctx.dom.createElement("span");
  copy.textContent = "Googly eye mode";
  label.append(toggle, copy);
  const help = ctx.dom.createElement("p");
  help.textContent = "Two googly eyes. Same important cleaning mission.";
  const status = ctx.dom.createElement("p", { role: "status" });
  panel.append(heading, label, help, status);
  ctx.ui.mount("settings_extensions").append(panel);
  let disposed = false;
  let edited = false;
  let saveQueue = Promise.resolve();
  const apply = (enabled) => {
    toggle.checked = enabled;
    robot.classList.toggle("lumi-roomba-googly", enabled);
  };
  const onChange = () => {
    edited = true;
    const enabled = toggle.checked;
    apply(enabled);
    if (!ctx.settings) {
      status.textContent = "This host keeps the choice until the extension reloads.";
      return;
    }
    status.textContent = "Saving…";
    saveQueue = saveQueue.then(async () => {
      if (disposed)
        return;
      try {
        await ctx.settings.set(KEY, enabled);
        if (!disposed && toggle.checked === enabled)
          status.textContent = "";
      } catch {
        if (!disposed)
          status.textContent = "Could not save. Toggle again to retry.";
      }
    });
  };
  toggle.addEventListener("change", onChange);
  if (ctx.settings) {
    ctx.settings.get(KEY).then((value) => {
      if (!disposed && !edited)
        apply(value === true);
    }).catch(() => {
      if (!disposed && !edited)
        status.textContent = "Could not load your saved choice. You can still toggle the eyes.";
    });
  }
  return () => {
    disposed = true;
    toggle.removeEventListener("change", onChange);
    panel.remove();
  };
}

// src/eye-physics.ts
var PUPIL_TRAVEL = 3.2;
var GRAVITY = 140;
var createPupil = () => ({ x: 0, y: PUPIL_TRAVEL, vx: 0, vy: 0 });
function center(pose, eye) {
  const x = eye === 0 ? 10 : 9;
  const y = eye === 0 ? -8.5 : 8.5;
  const c = Math.cos(pose.heading);
  const s = Math.sin(pose.heading);
  return { x: pose.x + 29 + x * c - y * s, y: pose.y + 29 + x * s + y * c };
}
function stepPupil(pupil, before, after, elapsed, eye) {
  const dt = Math.max(0, Math.min(0.05, elapsed));
  if (!dt)
    return { ...pupil };
  const oldCenter = center(before, eye);
  const newCenter = center(after, eye);
  const housingVx = (newCenter.x - oldCenter.x) / dt;
  const housingVy = (newCenter.y - oldCenter.y) / dt;
  const next = { ...pupil };
  const steps = Math.ceil(dt * 240);
  const h = dt / steps;
  const drag = Math.exp(-(eye === 0 ? 5 : 6.5) * h);
  for (let i = 0;i < steps; i++) {
    next.vx = housingVx + (next.vx - housingVx) * drag;
    next.vy = housingVy + (next.vy - housingVy) * drag + GRAVITY * h;
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
        const restitution = outwardSpeed < 1 ? 0 : 0.38;
        next.vx -= (1 + restitution) * outwardSpeed * nx;
        next.vy -= (1 + restitution) * outwardSpeed * ny;
      }
    }
  }
  return next;
}
function pupilOffset(pupil, heading) {
  const c = Math.cos(heading);
  const s = Math.sin(heading);
  return { x: pupil.x * c + pupil.y * s, y: -pupil.x * s + pupil.y * c };
}

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
  const pupilElements = [];
  const eyes = ctx.dom.createElement("div", { class: "lumi-roomba-eyes" });
  for (let i = 0;i < 2; i++) {
    const eye = ctx.dom.createElement("div", { class: "lumi-roomba-eye" });
    const pupil = ctx.dom.createElement("div", { class: "lumi-roomba-pupil" });
    pupilElements.push(pupil);
    eye.append(pupil);
    eyes.append(eye);
  }
  robot.append(brush, body, eyes);
  stage.append(robot);
  mount.root.append(stage);
  const removeGooglySettings = mountGooglySettings(ctx, robot);
  const viewport = window.visualViewport;
  const bounds = () => ({ left: viewport?.offsetLeft ?? 0, top: viewport?.offsetTop ?? 0, width: viewport?.width ?? window.innerWidth, height: viewport?.height ?? window.innerHeight });
  let state = createRobot(bounds());
  let pupils = [createPupil(), createPupil()];
  let frame = null;
  let previous = null;
  let disposed = false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const paint = () => {
    robot.style.transform = `translate3d(${state.x}px,${state.y}px,0) rotate(${state.heading}rad)`;
    pupilElements.forEach((element, index) => {
      const offset = pupilOffset(pupils[index], state.heading);
      element.style.transform = `translate(${offset.x}px,${offset.y}px)`;
    });
  };
  const tick = (now) => {
    frame = null;
    if (disposed)
      return;
    const elapsed = previous === null ? 0 : (now - previous) / 1000;
    const before = state;
    state = stepRobot(state, bounds(), elapsed);
    pupils = robot.classList.contains("lumi-roomba-googly") ? pupils.map((pupil, index) => stepPupil(pupil, before, state, elapsed, index)) : [createPupil(), createPupil()];
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
    pupils = pupils.map((pupil) => ({ ...pupil, vx: 0, vy: 0 }));
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
    removeGooglySettings();
    stage.remove();
    removeStyle();
    mount.destroy();
  };
}
export {
  setup
};
