const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const stick = document.getElementById("stick");
const joystick = document.getElementById("joystick");
const shootButton = document.getElementById("shootButton");
const dashButton = document.getElementById("dashButton");
const aimModeButton = document.getElementById("aimMode");
const timingModeButton = document.getElementById("timingMode");
const slowToggle = document.getElementById("slowToggle");
const meter = document.getElementById("meter");
const needle = document.getElementById("needle");
const toast = document.getElementById("toast");
const shotReadout = document.getElementById("shotReadout");
const spaceReadout = document.getElementById("spaceReadout");
const playerScoreEl = document.getElementById("playerScore");
const cpuScoreEl = document.getElementById("cpuScore");

const DPR = Math.min(window.devicePixelRatio || 1, 2);
const keys = new Set();
const input = {
  moveX: 0,
  moveY: 0,
  dash: false,
  joystickId: null,
  joyStartX: 0,
  joyStartY: 0,
  shootingId: null,
  shotStartX: 0,
  shotStartY: 0,
};

const state = {
  w: 0,
  h: 0,
  scale: 1,
  mode: "aim",
  time: 0,
  last: performance.now(),
  slowEnabled: true,
  slowUntil: 0,
  shake: 0,
  playerScore: 0,
  cpuScore: 0,
  possession: "player",
  messageTimer: 0,
  message: "Ready",
  timingActive: false,
  timingValue: 0,
  timingDir: 1,
  shotCharge: 0,
  aimVector: { x: 0, y: -1 },
  particles: [],
  ball: null,
};

const court = {
  x: 0,
  y: 0,
  w: 1000,
  h: 620,
  hoop: { x: 830, y: 310 },
};

const player = {
  x: 335,
  y: 310,
  r: 21,
  color: "#f5bf45",
  vx: 0,
  vy: 0,
  stamina: 1,
  cooldown: 0,
};

const defender = {
  x: 525,
  y: 310,
  r: 23,
  color: "#4aa3df",
  vx: 0,
  vy: 0,
};

function resize() {
  state.w = window.innerWidth;
  state.h = window.innerHeight;
  canvas.width = Math.floor(state.w * DPR);
  canvas.height = Math.floor(state.h * DPR);
  canvas.style.width = `${state.w}px`;
  canvas.style.height = `${state.h}px`;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  const margin = state.w < 760 ? 14 : 30;
  const usableH = state.h - margin * 2;
  const usableW = state.w - margin * 2;
  const ratio = court.w / court.h;
  let drawW = usableW;
  let drawH = drawW / ratio;
  if (drawH > usableH) {
    drawH = usableH;
    drawW = drawH * ratio;
  }
  state.scale = drawW / court.w;
  court.x = (state.w - drawW) / 2;
  court.y = (state.h - drawH) / 2;
}

function worldToScreen(p) {
  return {
    x: court.x + p.x * state.scale,
    y: court.y + p.y * state.scale,
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function showMessage(text) {
  state.message = text;
  state.messageTimer = 1.25;
  toast.textContent = text;
  toast.classList.add("show");
}

function setMode(mode) {
  state.mode = mode;
  aimModeButton.classList.toggle("active", mode === "aim");
  timingModeButton.classList.toggle("active", mode === "timing");
  meter.classList.toggle("show", mode === "timing" && state.timingActive);
  showMessage(mode === "aim" ? "AIM: hold, pull, release" : "TIMING: release in the green");
}

function setSlowEnabled(enabled) {
  state.slowEnabled = enabled;
  slowToggle.classList.toggle("active", enabled);
  slowToggle.textContent = enabled ? "SLOW ON" : "SLOW OFF";
  slowToggle.setAttribute("aria-pressed", String(enabled));
  showMessage(enabled ? "Slow motion on" : "Slow motion off");
}

function resetPossession(scoredByPlayer) {
  player.x = scoredByPlayer ? 340 : 380;
  player.y = 310;
  defender.x = scoredByPlayer ? 555 : 500;
  defender.y = 310;
  state.ball = null;
  state.possession = "player";
  state.shotCharge = 0;
  state.timingActive = false;
  meter.classList.remove("show");
}

function addBurst(x, y, color, count = 16) {
  for (let i = 0; i < count; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 160;
    state.particles.push({
      x,
      y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      life: 0.45 + Math.random() * 0.35,
      color,
      size: 3 + Math.random() * 4,
    });
  }
}

function startShot(pointer) {
  if (state.ball || player.cooldown > 0) return;
  input.shootingId = pointer.pointerId;
  input.shotStartX = pointer.clientX;
  input.shotStartY = pointer.clientY;
  state.shotCharge = 0.08;
  state.slowUntil = state.time + 1000;

  if (state.mode === "timing") {
    state.timingActive = true;
    state.timingValue = 0;
    state.timingDir = 1;
    meter.classList.add("show");
  }
}

function updateShotDrag(pointer) {
  if (input.shootingId !== pointer.pointerId) return;
  const dx = input.shotStartX - pointer.clientX;
  const dy = input.shotStartY - pointer.clientY;
  const length = Math.hypot(dx, dy);
  if (length > 8) {
    state.aimVector.x = dx / length;
    state.aimVector.y = dy / length;
  }
  state.shotCharge = clamp(length / 150, 0.08, 1);
}

function releaseShot(pointer) {
  if (input.shootingId !== pointer.pointerId) return;
  input.shootingId = null;
  if (state.mode === "timing") {
    shootTiming();
  } else {
    shootAim();
  }
}

function shootAim() {
  const hoopVector = {
    x: court.hoop.x - player.x,
    y: court.hoop.y - player.y,
  };
  const hoopLength = Math.hypot(hoopVector.x, hoopVector.y);
  const perfect = { x: hoopVector.x / hoopLength, y: hoopVector.y / hoopLength };
  const angleFit = (state.aimVector.x * perfect.x + state.aimVector.y * perfect.y + 1) / 2;
  const distanceFit = 1 - clamp(Math.abs(0.68 - state.shotCharge) / 0.68, 0, 1);
  launchShot(angleFit * 0.62 + distanceFit * 0.38, "aim");
}

function shootTiming() {
  const timingFit = 1 - clamp(Math.abs(state.timingValue - 0.44) / 0.44, 0, 1);
  const rhythmBonus = state.timingValue > 0.36 && state.timingValue < 0.53 ? 0.22 : 0;
  state.timingActive = false;
  meter.classList.remove("show");
  launchShot(clamp(timingFit + rhythmBonus, 0, 1), "timing");
}

function launchShot(skill, source) {
  const contest = clamp(1 - distance(player, defender) / 150, 0, 1);
  const range = clamp(distance(player, court.hoop) / 520, 0, 1);
  const quality = clamp(skill - contest * 0.32 - range * 0.12 + 0.1, 0, 1);
  const made = quality > 0.73 || (quality > 0.48 && Math.random() < quality * 0.58);
  const missSide = (Math.random() - 0.5) * (110 - quality * 72);
  const missDepth = (Math.random() - 0.5) * (78 - quality * 48);
  const target = made
    ? { x: court.hoop.x + (Math.random() - 0.5) * 9, y: court.hoop.y + (Math.random() - 0.5) * 7 }
    : { x: court.hoop.x + missDepth, y: court.hoop.y + missSide };

  state.ball = {
    startX: player.x,
    startY: player.y - 7,
    x: player.x,
    y: player.y - 7,
    targetX: target.x,
    targetY: target.y,
    t: 0,
    duration: 0.74 + range * 0.18,
    made,
    quality,
    source,
    scored: false,
  };
  state.shotCharge = 0;
  player.cooldown = 0.7;
  state.slowUntil = state.time + 360;
  shotReadout.textContent = quality > 0.8 ? "Clean" : quality > 0.58 ? "Good" : "Tough";
}

function handleJoystickDown(event) {
  input.joystickId = event.pointerId;
  const rect = joystick.getBoundingClientRect();
  input.joyStartX = rect.left + rect.width / 2;
  input.joyStartY = rect.top + rect.height / 2;
  joystick.setPointerCapture(event.pointerId);
  updateJoystick(event);
}

function updateJoystick(event) {
  if (input.joystickId !== event.pointerId) return;
  const max = joystick.clientWidth * 0.33;
  const dx = event.clientX - input.joyStartX;
  const dy = event.clientY - input.joyStartY;
  const length = Math.hypot(dx, dy);
  const limited = Math.min(length, max);
  const nx = length > 0 ? dx / length : 0;
  const ny = length > 0 ? dy / length : 0;
  input.moveX = nx * (limited / max);
  input.moveY = ny * (limited / max);
  stick.style.transform = `translate(calc(-50% + ${nx * limited}px), calc(-50% + ${ny * limited}px))`;
}

function releaseJoystick(event) {
  if (input.joystickId !== event.pointerId) return;
  input.joystickId = null;
  input.moveX = 0;
  input.moveY = 0;
  stick.style.transform = "translate(-50%, -50%)";
}

function update(dt) {
  const slow = state.slowEnabled && (state.slowUntil > state.time || state.timingActive) ? 0.44 : 1;
  const step = dt * slow;
  state.time += dt * 1000;

  const keyX = (keys.has("ArrowRight") || keys.has("KeyD") ? 1 : 0) - (keys.has("ArrowLeft") || keys.has("KeyA") ? 1 : 0);
  const keyY = (keys.has("ArrowDown") || keys.has("KeyS") ? 1 : 0) - (keys.has("ArrowUp") || keys.has("KeyW") ? 1 : 0);
  const moveX = input.moveX || keyX;
  const moveY = input.moveY || keyY;
  const moving = Math.hypot(moveX, moveY);
  const dash = input.dash || keys.has("ShiftLeft") || keys.has("ShiftRight");
  const speed = (dash && player.stamina > 0.12 ? 270 : 178) * (state.ball ? 0.88 : 1);
  player.x += (moving ? moveX / Math.max(1, moving) : 0) * speed * step;
  player.y += (moving ? moveY / Math.max(1, moving) : 0) * speed * step;
  player.x = clamp(player.x, 125, court.w - 145);
  player.y = clamp(player.y, 88, court.h - 88);
  player.stamina = clamp(player.stamina + (dash && moving ? -0.55 : 0.34) * step, 0, 1);
  player.cooldown = Math.max(0, player.cooldown - step);

  const guardSpot = {
    x: player.x + clamp(court.hoop.x - player.x, -92, 92),
    y: player.y + clamp(court.hoop.y - player.y, -76, 76),
  };
  const chase = distance(player, defender) > 82 ? 1 : 0.45;
  defender.vx += (guardSpot.x - defender.x) * 3.2 * step * chase;
  defender.vy += (guardSpot.y - defender.y) * 3.2 * step * chase;
  defender.vx *= 0.86;
  defender.vy *= 0.86;
  defender.x += defender.vx * step;
  defender.y += defender.vy * step;
  defender.x = clamp(defender.x, 130, court.w - 130);
  defender.y = clamp(defender.y, 92, court.h - 92);

  if (state.timingActive) {
    state.timingValue += state.timingDir * step * 1.28;
    if (state.timingValue > 1) {
      state.timingValue = 1;
      state.timingDir = -1;
    } else if (state.timingValue < 0) {
      state.timingValue = 0;
      state.timingDir = 1;
    }
    needle.style.top = `${state.timingValue * (meter.clientHeight - 5)}px`;
    state.shotCharge = state.timingValue;
  }

  updateBall(step);
  updateParticles(step);
  updateHud();
}

function updateBall(dt) {
  if (!state.ball) return;
  const b = state.ball;
  b.t += dt / b.duration;
  const t = clamp(b.t, 0, 1);
  const ease = 1 - Math.pow(1 - t, 3);
  b.x = b.startX + (b.targetX - b.startX) * ease;
  b.y = b.startY + (b.targetY - b.startY) * ease;

  if (t >= 1 && !b.scored) {
    b.scored = true;
    if (b.made) {
      state.playerScore += distance(player, court.hoop) > 440 ? 3 : 2;
      playerScoreEl.textContent = state.playerScore;
      state.shake = 8;
      addBurst(court.hoop.x, court.hoop.y, "#99d6c2", 26);
      showMessage(b.quality > 0.86 ? "Perfect release" : "Bucket");
      resetPossession(true);
    } else {
      state.shake = 4;
      addBurst(b.targetX, b.targetY, "#d9572f", 12);
      showMessage(b.quality > 0.58 ? "Rim out" : "Off balance");
      setTimeout(() => resetPossession(false), 420);
    }
  }
}

function updateParticles(dt) {
  for (const p of state.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 220 * dt;
    p.life -= dt;
  }
  state.particles = state.particles.filter((p) => p.life > 0);
  state.shake = Math.max(0, state.shake - 28 * dt);
  if (state.messageTimer > 0) {
    state.messageTimer -= dt;
    if (state.messageTimer <= 0) toast.classList.remove("show");
  }
}

function updateHud() {
  const space = distance(player, defender);
  spaceReadout.textContent = space > 132 ? "Open" : space > 86 ? "Tight" : "Smothered";
  if (!input.shootingId && !state.timingActive && player.cooldown <= 0) {
    shotReadout.textContent = state.mode === "aim" ? "Hold" : "Tap-hold";
  }
}

function drawCourt() {
  const s = state.scale;
  ctx.save();
  const shakeX = (Math.random() - 0.5) * state.shake;
  const shakeY = (Math.random() - 0.5) * state.shake;
  ctx.translate(court.x + shakeX, court.y + shakeY);
  ctx.scale(s, s);

  ctx.fillStyle = "#b57745";
  roundRect(0, 0, court.w, court.h, 26);
  ctx.fill();

  ctx.fillStyle = "#cf965d";
  for (let i = 0; i < 18; i += 1) {
    ctx.fillRect(i * 64 - 16, 0, 30, court.h);
  }

  ctx.strokeStyle = "rgba(255,255,255,0.82)";
  ctx.lineWidth = 5;
  ctx.strokeRect(54, 54, court.w - 108, court.h - 108);
  ctx.beginPath();
  ctx.moveTo(court.w / 2, 54);
  ctx.lineTo(court.w / 2, court.h - 54);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(court.hoop.x, court.hoop.y, 168, Math.PI * 0.5, Math.PI * 1.5, true);
  ctx.stroke();
  ctx.strokeRect(court.hoop.x, court.hoop.y - 98, 118, 196);
  ctx.beginPath();
  ctx.arc(court.hoop.x, court.hoop.y, 58, 0, Math.PI * 2);
  ctx.stroke();

  drawHoop();
  drawPlayerShadow(player);
  drawPlayerShadow(defender);
  drawCharacter(defender, false);
  drawCharacter(player, true);
  drawAimPreview();
  drawBall();
  drawParticles();

  ctx.restore();
}

function drawHoop() {
  ctx.fillStyle = "#20262b";
  roundRect(court.hoop.x + 64, court.hoop.y - 58, 16, 116, 5);
  ctx.fill();
  ctx.strokeStyle = "#f7f1e3";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(court.hoop.x + 66, court.hoop.y - 48);
  ctx.lineTo(court.hoop.x + 66, court.hoop.y + 48);
  ctx.stroke();
  ctx.strokeStyle = "#d9572f";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(court.hoop.x, court.hoop.y, 24, 0, Math.PI * 2);
  ctx.stroke();
}

function drawPlayerShadow(p) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + p.r + 7, p.r * 1.2, p.r * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCharacter(p, isPlayer) {
  const angle = Math.atan2(court.hoop.y - p.y, court.hoop.x - p.x);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(angle);
  ctx.fillStyle = isPlayer ? "#f5bf45" : "#4aa3df";
  ctx.beginPath();
  ctx.arc(0, 0, p.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = isPlayer ? "#17130b" : "#07131d";
  ctx.fillRect(4, -9, 16, 18);
  ctx.fillStyle = "#f7f1e3";
  ctx.beginPath();
  ctx.arc(10, -7, 3, 0, Math.PI * 2);
  ctx.arc(10, 7, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (isPlayer && !state.ball) {
    ctx.fillStyle = "#c96536";
    ctx.beginPath();
    ctx.arc(p.x + 18, p.y - 18, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(23, 19, 11, 0.32)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x + 8, p.y - 18);
    ctx.lineTo(p.x + 28, p.y - 18);
    ctx.moveTo(p.x + 18, p.y - 28);
    ctx.lineTo(p.x + 18, p.y - 8);
    ctx.stroke();
  }
}

function drawAimPreview() {
  if (!input.shootingId || state.mode !== "aim") return;
  const targetX = player.x + state.aimVector.x * (180 + state.shotCharge * 220);
  const targetY = player.y + state.aimVector.y * (180 + state.shotCharge * 220);
  ctx.strokeStyle = `rgba(153, 214, 194, ${0.36 + state.shotCharge * 0.46})`;
  ctx.lineWidth = 5;
  ctx.setLineDash([14, 14]);
  ctx.beginPath();
  ctx.moveTo(player.x, player.y - 15);
  ctx.quadraticCurveTo((player.x + targetX) / 2, player.y - 150, targetX, targetY);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawBall() {
  if (!state.ball) return;
  const b = state.ball;
  const t = clamp(b.t, 0, 1);
  const arc = Math.sin(t * Math.PI) * 128;
  const radius = 10 + arc * 0.018;
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(b.x, b.y + 24, radius * 1.2, radius * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c96536";
  ctx.beginPath();
  ctx.arc(b.x, b.y - arc, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(23, 19, 11, 0.36)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(b.x, b.y - arc, radius * 0.72, Math.PI * 0.5, Math.PI * 1.5);
  ctx.moveTo(b.x - radius, b.y - arc);
  ctx.lineTo(b.x + radius, b.y - arc);
  ctx.stroke();
}

function drawParticles() {
  for (const p of state.particles) {
    ctx.globalAlpha = clamp(p.life * 2, 0, 1);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function loop(now) {
  const dt = Math.min(0.033, (now - state.last) / 1000);
  state.last = now;
  update(dt);
  ctx.clearRect(0, 0, state.w, state.h);
  drawBackground();
  drawCourt();
  requestAnimationFrame(loop);
}

function drawBackground() {
  ctx.fillStyle = "#10161b";
  ctx.fillRect(0, 0, state.w, state.h);
  ctx.fillStyle = "#182227";
  const tile = 46;
  for (let x = -tile; x < state.w + tile; x += tile) {
    for (let y = -tile; y < state.h + tile; y += tile) {
      if ((x / tile + y / tile) % 2 === 0) ctx.fillRect(x, y, tile, tile);
    }
  }
}

joystick.addEventListener("pointerdown", handleJoystickDown);
joystick.addEventListener("pointermove", updateJoystick);
joystick.addEventListener("pointerup", releaseJoystick);
joystick.addEventListener("pointercancel", releaseJoystick);

shootButton.addEventListener("pointerdown", (event) => {
  shootButton.setPointerCapture(event.pointerId);
  startShot(event);
});
shootButton.addEventListener("pointermove", updateShotDrag);
shootButton.addEventListener("pointerup", releaseShot);
shootButton.addEventListener("pointercancel", releaseShot);

dashButton.addEventListener("pointerdown", () => {
  input.dash = true;
});
dashButton.addEventListener("pointerup", () => {
  input.dash = false;
});
dashButton.addEventListener("pointercancel", () => {
  input.dash = false;
});

aimModeButton.addEventListener("click", () => setMode("aim"));
timingModeButton.addEventListener("click", () => setMode("timing"));
slowToggle.addEventListener("click", () => setSlowEnabled(!state.slowEnabled));

window.addEventListener("keydown", (event) => {
  keys.add(event.code);
  if (event.code === "Space" && !input.shootingId) {
    startShot({ pointerId: "keyboard", clientX: state.w - 90, clientY: state.h - 90 });
  }
});
window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
  if (event.code === "Space") releaseShot({ pointerId: "keyboard" });
});
window.addEventListener("resize", resize);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

resize();
showMessage("1v1 prototype");
requestAnimationFrame(loop);
